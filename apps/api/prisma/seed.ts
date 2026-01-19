import { PrismaClient, CuratedItemType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createCipheriv, randomBytes } from 'crypto';

import { seedTopics } from './seed-data/topics';
import { seedTags } from './seed-data/tags';
import { seedPages, seedLandings, seedArticles, seedResources, SeedContentItem } from './seed-data/content-items';
import { seedGlossaryTerms } from './seed-data/glossary';
import { seedCuratedCollections } from './seed-data/curated';
import { seedServices } from './seed-data/services';
import { seedEvents } from './seed-data/events';
import { seedInteractives } from './seed-data/interactives';

const prisma = new PrismaClient();

const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

function ensureEncryptionEnv(): void {
  if (!process.env.ENCRYPTION_KEY_ID) {
    process.env.ENCRYPTION_KEY_ID = 'test-key';
  }
  if (!process.env.ENCRYPTION_KEY) {
    // 32 bytes in base64 (deterministic dev default)
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64');
  }
}

function encryptValue(plaintext: string): string {
  ensureEncryptionEnv();
  const keyId = process.env.ENCRYPTION_KEY_ID!;
  const keyBase64 = process.env.ENCRYPTION_KEY!;
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes in base64');
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [keyId, iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function seedRoles(): Promise<void> {
  const roles = [
    { code: 'owner', scope: 'admin' },
    { code: 'assistant', scope: 'admin' },
    { code: 'editor', scope: 'admin' },
    { code: 'client', scope: 'product' },
  ] as const;

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: { code: role.code, scope: role.scope as any },
    });
  }
}

async function seedOwner(): Promise<{ id: string; email: string }> {
  const ownerEmail = 'owner@psychology.test';
  const ownerPassword = 'password123';
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      display_name: 'Владелец',
      password_hash: passwordHash,
      status: 'active',
      roles: { create: { role_code: 'owner' } },
    },
  });

  return { id: owner.id, email: ownerEmail };
}

async function seedTopicsAndTags(): Promise<void> {
  for (const topic of seedTopics) {
    await prisma.topic.upsert({
      where: { code: topic.code },
      update: { title: topic.title, is_active: true },
      create: { code: topic.code, title: topic.title, is_active: true },
    });
  }

  for (const tag of seedTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { title: tag.title },
      create: { slug: tag.slug, title: tag.title },
    });
  }
}

async function upsertContentItem(params: {
  item: SeedContentItem;
  authorUserId: string;
  tagIdBySlug: Map<string, string>;
}): Promise<{ id: string; type: string; slug: string }> {
  const { item, authorUserId, tagIdBySlug } = params;
  const now = new Date();

  const record = await prisma.contentItem.upsert({
    where: { content_type_slug: { content_type: item.type as any, slug: item.slug } },
    update: {
      title: item.title,
      excerpt: item.excerpt ?? null,
      body_markdown: item.body_markdown,
      status: 'published',
      published_at: now,
      seo_title: item.seo_title ?? null,
      seo_description: item.seo_description ?? null,
      seo_keywords: item.seo_keywords ?? null,
      canonical_url: item.canonical_url ?? null,
      time_to_benefit: (item.time_to_benefit ?? null) as any,
      format: (item.format ?? null) as any,
      support_level: (item.support_level ?? null) as any,
    },
    create: {
      content_type: item.type as any,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? null,
      body_markdown: item.body_markdown,
      status: 'published',
      published_at: now,
      author_user_id: authorUserId,
      seo_title: item.seo_title ?? null,
      seo_description: item.seo_description ?? null,
      seo_keywords: item.seo_keywords ?? null,
      canonical_url: item.canonical_url ?? null,
      time_to_benefit: (item.time_to_benefit ?? null) as any,
      format: (item.format ?? null) as any,
      support_level: (item.support_level ?? null) as any,
    },
  });

  // Keep relations in sync for seed environments.
  await prisma.contentItemTopic.deleteMany({ where: { content_item_id: record.id } });
  if (item.topics && item.topics.length > 0) {
    await prisma.contentItemTopic.createMany({
      data: item.topics.map((code) => ({ content_item_id: record.id, topic_code: code })),
      skipDuplicates: true,
    });
  }

  await prisma.contentItemTag.deleteMany({ where: { content_item_id: record.id } });
  if (item.tags && item.tags.length > 0) {
    const tagIds = item.tags.map((slug) => tagIdBySlug.get(slug)).filter(Boolean) as string[];
    if (tagIds.length > 0) {
      await prisma.contentItemTag.createMany({
        data: tagIds.map((tagId) => ({ content_item_id: record.id, tag_id: tagId })),
        skipDuplicates: true,
      });
    }
  }

  return { id: record.id, type: item.type, slug: item.slug };
}

async function seedModerationTemplates(ownerUserId: string): Promise<void> {
  const moderationTemplates = [
    {
      name: 'Кризис: экстренная помощь',
      subject: null as string | null,
      body: `Спасибо, что написали. Я вижу, что вам сейчас очень тяжело.

То, что вы описываете, требует срочной поддержки. Пожалуйста, обратитесь:

- **112** — если вам угрожает опасность прямо сейчас
- **Телефон доверия: 8-800-2000-122** (круглосуточно, бесплатно)

Если вы в безопасности и хотите обсудить вашу ситуацию — приглашаю на консультацию (кнопка “Записаться” на сайте).

Берегите себя.`,
    },
    {
      name: 'Медицинский вопрос (out-of-scope)',
      subject: null as string | null,
      body: `Спасибо за вопрос.

То, что вы описываете, может требовать медицинского обследования. Рекомендую обратиться к профильному врачу.

Если вам нужна психологическая поддержка в процессе — можно обсудить эмоциональную сторону на консультации.`,
    },
    {
      name: 'Запрос терапии в комментариях',
      subject: null as string | null,
      body: `Спасибо за доверие.

Чтобы по-настоящему разобраться, нужно больше времени и безопасного пространства, чем позволяет формат короткого ответа.

Если вам откликается — приглашаю на консультацию. На встрече мы сможем подробно обсудить, что происходит, и собрать следующие шаги.`,
    },
    {
      name: 'Общий безопасный ответ',
      subject: null as string | null,
      body: `Спасибо за вопрос.

Коротко: часто помогает сделать один маленький шаг сейчас (дыхание/заземление) и затем вернуться к теме в более спокойном состоянии.

Важно помнить, что это не медицинская консультация и не диагноз. Если хочется — можно обсудить вашу ситуацию на встрече.`,
    },
  ];

  for (const template of moderationTemplates) {
    const exists = await prisma.messageTemplate.findFirst({
      where: { name: template.name, category: 'moderation', channel: 'email' },
    });
    if (exists) continue;

    await prisma.messageTemplate.create({
      data: {
        name: template.name,
        channel: 'email',
        category: 'moderation',
        status: 'active',
        versions: {
          create: {
            version: 1,
            subject: template.subject,
            body_markdown: template.body,
            updated_by_user_id: ownerUserId,
          },
        },
      },
    });
  }
}

async function seedInteractiveDefinitions(ownerUserId: string): Promise<void> {
  const now = new Date();

  for (const interactive of seedInteractives) {
    const def = await prisma.interactiveDefinition.upsert({
      where: { interactive_type_slug: { interactive_type: interactive.interactive_type as any, slug: interactive.slug } },
      update: {
        title: interactive.title,
        topic_code: interactive.topic_code ?? null,
        status: 'published',
        published_at: now,
        published_json: interactive.config as any,
        definition_json: interactive.config as any,
        draft_json: interactive.config as any,
        draft_updated_at: now,
        published_version: 1,
      },
      create: {
        id: interactive.id,
        interactive_type: interactive.interactive_type as any,
        slug: interactive.slug,
        title: interactive.title,
        topic_code: interactive.topic_code ?? null,
        status: 'published',
        published_at: now,
        published_json: interactive.config as any,
        definition_json: interactive.config as any,
        draft_json: interactive.config as any,
        draft_updated_at: now,
        published_version: 1,
      },
    });

    await prisma.interactiveDefinitionVersion.upsert({
      where: { interactive_definition_id_version: { interactive_definition_id: def.id, version: 1 } },
      update: { config_json: interactive.config as any },
      create: {
        interactive_definition_id: def.id,
        version: 1,
        config_json: interactive.config as any,
        created_by_user_id: ownerUserId,
      },
    });
  }
}

async function seedServicesAndEvents(): Promise<void> {
  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service as any,
      create: service as any,
    });
  }

  for (const event of seedEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event as any,
      create: event as any,
    });
  }
}

async function seedScheduleAndSlots(): Promise<void> {
  const existingSettings = await prisma.scheduleSettings.findFirst();
  if (!existingSettings) {
    await prisma.scheduleSettings.create({
      data: { timezone: 'Europe/Moscow', buffer_minutes: 10 },
    });
  }

  const services = await prisma.service.findMany({ where: { status: 'published' as any } });
  const slotTimesUtc = [
    { hour: 10, minute: 0 }, // ~13:00 MSK
    { hour: 15, minute: 0 }, // ~18:00 MSK
  ];

  for (const service of services) {
    for (let day = 1; day <= 14; day++) {
      for (const t of slotTimesUtc) {
        const start = new Date();
        start.setUTCDate(start.getUTCDate() + day);
        start.setUTCHours(t.hour, t.minute, 0, 0);
        const end = addMinutes(start, service.duration_minutes);

        await prisma.availabilitySlot.upsert({
          where: {
            start_at_utc_end_at_utc_source_service_id: {
              start_at_utc: start,
              end_at_utc: end,
              source: 'product' as any,
              service_id: service.id,
            },
          },
          update: { status: 'available' as any, note: null },
          create: {
            service_id: service.id,
            start_at_utc: start,
            end_at_utc: end,
            status: 'available' as any,
            source: 'product' as any,
          },
        });
      }
    }
  }
}

async function seedGlossaryAndLinks(contentIdByTypeSlug: Map<string, string>): Promise<void> {
  const now = new Date();

  for (const term of seedGlossaryTerms) {
    const record = await prisma.glossaryTerm.upsert({
      where: { slug: term.slug },
      update: {
        title: term.title,
        category: term.category as any,
        short_definition: term.short_definition,
        body_markdown: term.body_markdown,
        status: 'published',
        published_at: now,
        meta_description: term.meta_description ?? null,
        keywords: term.keywords ?? null,
      },
      create: {
        slug: term.slug,
        title: term.title,
        category: term.category as any,
        short_definition: term.short_definition,
        body_markdown: term.body_markdown,
        status: 'published',
        published_at: now,
        meta_description: term.meta_description ?? null,
        keywords: term.keywords ?? null,
      },
    });

    await prisma.glossaryTermSynonym.deleteMany({ where: { term_id: record.id } });
    if (term.synonyms && term.synonyms.length > 0) {
      await prisma.glossaryTermSynonym.createMany({
        data: term.synonyms.map((syn) => ({ term_id: record.id, synonym: syn })),
        skipDuplicates: true,
      });
    }

    // Seed a couple of helpful links (best-effort).
    await prisma.glossaryTermLink.deleteMany({ where: { term_id: record.id } });
    const linkTargets: Array<{ key: string; linkType: string }> = [];
    if (term.slug === 'trevoga') {
      linkTargets.push({ key: 'article:trevoga-utrom-3-myagkih-shaga', linkType: 'read' });
      linkTargets.push({ key: 'resource:dyhanie-4-6', linkType: 'practice' });
    }
    if (term.slug === 'zazemlenie') {
      linkTargets.push({ key: 'resource:zazemlenie-5-4-3-2-1', linkType: 'practice' });
    }
    if (term.slug === 'vygoranie') {
      linkTargets.push({ key: 'article:10-priznakov-vygoraniya-kotorye-chasto-ignoriruyut', linkType: 'read' });
    }

    const linksToCreate = linkTargets
      .map((t) => ({ content_item_id: contentIdByTypeSlug.get(t.key), link_type: t.linkType }))
      .filter((x): x is { content_item_id: string; link_type: string } => Boolean(x.content_item_id));

    if (linksToCreate.length > 0) {
      await prisma.glossaryTermLink.createMany({
        data: linksToCreate.map((l) => ({ term_id: record.id, content_item_id: l.content_item_id, link_type: l.link_type })),
        skipDuplicates: true,
      });
    }
  }
}

async function seedCurated(contentIdByTypeSlug: Map<string, string>, interactiveIdByTypeSlug: Map<string, string>): Promise<void> {
  const now = new Date();

  for (const coll of seedCuratedCollections) {
    const collection = await prisma.curatedCollection.upsert({
      where: { slug: coll.slug },
      update: {
        title: coll.title,
        collection_type: coll.collection_type as any,
        topic_code: coll.topic_code ?? null,
        status: 'published',
        published_at: now,
      },
      create: {
        slug: coll.slug,
        title: coll.title,
        collection_type: coll.collection_type as any,
        topic_code: coll.topic_code ?? null,
        status: 'published',
        published_at: now,
      },
    });

    await prisma.curatedItem.deleteMany({ where: { collection_id: collection.id } });

    for (let position = 0; position < coll.items.length; position++) {
      const item = coll.items[position];
      if (item.item_type === 'content') {
        const contentId = contentIdByTypeSlug.get(`${item.content_type}:${item.content_slug}`) ?? null;
        if (!contentId) continue;
        await prisma.curatedItem.create({
          data: {
            collection_id: collection.id,
            item_type: CuratedItemType.content,
            content_item_id: contentId,
            interactive_definition_id: null,
            position,
            note: item.note ?? null,
          },
        });
      } else {
        const interactiveId = interactiveIdByTypeSlug.get(`${item.interactive_type}:${item.interactive_slug}`) ?? null;
        if (!interactiveId) continue;
        await prisma.curatedItem.create({
          data: {
            collection_id: collection.id,
            item_type: CuratedItemType.interactive,
            content_item_id: null,
            interactive_definition_id: interactiveId,
            position,
            note: item.note ?? null,
          },
        });
      }
    }
  }
}

async function seedDemoUsersAndUgc(ownerUserId: string): Promise<void> {
  // Demo client user (for CRM / cabinet).
  const clientEmail = 'demo.client@psychology.test';
  const clientPasswordHash = await bcrypt.hash('password123', 12);

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      display_name: 'Демо клиент',
      password_hash: clientPasswordHash,
      status: 'active',
      roles: { create: { role_code: 'client' } },
    },
  });

  // Demo lead + identity + timeline (idempotent via fixed ID).
  const leadId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  await prisma.lead.upsert({
    where: { id: leadId },
    update: {
      status: 'engaged' as any,
      source: 'quiz' as any,
      topic_code: 'anxiety',
      utm: { source: 'seed', medium: 'local', campaign: 'demo' } as any,
    },
    create: {
      id: leadId,
      status: 'engaged' as any,
      source: 'quiz' as any,
      topic_code: 'anxiety',
      utm: { source: 'seed', medium: 'local', campaign: 'demo' } as any,
    },
  });

  await prisma.leadIdentity.deleteMany({ where: { lead_id: leadId } });
  await prisma.leadIdentity.create({
    data: {
      lead_id: leadId,
      user_id: client.id,
      email_encrypted: encryptValue(clientEmail.toLowerCase()),
      phone_encrypted: encryptValue('79991234567'),
      is_primary: true,
    },
  });

  await prisma.leadTimelineEvent.deleteMany({ where: { lead_id: leadId } });
  await prisma.leadTimelineEvent.createMany({
    data: [
      { lead_id: leadId, event_name: 'quiz_completed', source: 'web', properties: { quiz: 'anxiety', level: 'moderate' } as any },
      { lead_id: leadId, event_name: 'booking_start', source: 'web', properties: { service_slug: 'intro-session' } as any },
    ],
    skipDuplicates: true,
  });

  await prisma.leadNote.deleteMany({ where: { lead_id: leadId } });
  await prisma.leadNote.create({
    data: {
      lead_id: leadId,
      author_user_id: ownerUserId,
      note_encrypted: encryptValue('Демо заметка: клиент интересуется форматом и конфиденциальностью.'),
    },
  });

  // Demo anonymous questions (pending + flagged)
  const q1Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const q2Id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const q1 = await prisma.anonymousQuestion.upsert({
    where: { id: q1Id },
    update: {
      status: 'pending' as any,
      trigger_flags: [] as any,
      question_text_encrypted: encryptValue('Почему у меня тревога утром и как перестать “накручивать”?'),
      contact_value_encrypted: encryptValue('demo.client@psychology.test'),
      publish_allowed: true,
    },
    create: {
      id: q1Id,
      status: 'pending' as any,
      trigger_flags: [] as any,
      question_text_encrypted: encryptValue('Почему у меня тревога утром и как перестать “накручивать”?'),
      contact_value_encrypted: encryptValue('demo.client@psychology.test'),
      publish_allowed: true,
    },
  });

  await prisma.anonymousQuestion.upsert({
    where: { id: q2Id },
    update: {
      status: 'flagged' as any,
      trigger_flags: ['crisis'] as any,
      question_text_encrypted: encryptValue('Мне очень плохо, иногда думаю что не хочу жить.'),
      contact_value_encrypted: null,
      publish_allowed: false,
    },
    create: {
      id: q2Id,
      status: 'flagged' as any,
      trigger_flags: ['crisis'] as any,
      question_text_encrypted: encryptValue('Мне очень плохо, иногда думаю что не хочу жить.'),
      contact_value_encrypted: null,
      publish_allowed: false,
    },
  });

  // Demo answer to the pending question
  await prisma.questionAnswer.deleteMany({ where: { question_id: q1.id } });
  await prisma.questionAnswer.create({
    data: {
      question_id: q1.id,
      answered_by_user_id: ownerUserId,
      answer_text_encrypted: encryptValue(
        'Спасибо за вопрос. Утренняя тревога часто усиливается от недосыпа и перегруза. Можно попробовать дыхание 4–6 и один маленький план на час. Если хочется — обсудим на встрече.',
      ),
      published_at: new Date(),
    },
  });

  // Demo moderation action
  await prisma.ugcModerationAction.deleteMany({ where: { ugc_id: q1.id } });
  await prisma.ugcModerationAction.create({
    data: {
      ugc_type: 'question',
      ugc_id: q1.id,
      moderator_user_id: ownerUserId,
      action: 'publish' as any,
      reason_category: null,
    },
  });

  // Demo review + consent
  const reviewId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const review = await prisma.review.upsert({
    where: { id: reviewId },
    update: {
      user_id: client.id,
      status: 'submitted',
      review_text_encrypted: encryptValue('Бережно и понятно. После первой встречи стало спокойнее и яснее, с чего начать.'),
      anonymity_level: 'initials',
      published_at: new Date(),
    },
    create: {
      id: reviewId,
      user_id: client.id,
      status: 'submitted',
      review_text_encrypted: encryptValue('Бережно и понятно. После первой встречи стало спокойнее и яснее, с чего начать.'),
      anonymity_level: 'initials',
      published_at: new Date(),
    },
  });

  await prisma.reviewPublicationConsent.deleteMany({ where: { review_id: review.id } });
  await prisma.reviewPublicationConsent.create({
    data: {
      review_id: review.id,
      user_id: client.id,
      granted: true,
      version: 'v1',
    },
  });
}

async function main() {
  console.log('Starting seed...');

  await seedRoles();
  console.log('Roles seeded.');

  const owner = await seedOwner();
  console.log(`Owner seeded: ${owner.email}`);

  await seedTopicsAndTags();
  console.log('Topics & tags seeded.');

  await seedModerationTemplates(owner.id);
  console.log('Moderation templates seeded.');

  await seedInteractiveDefinitions(owner.id);
  console.log('Interactive definitions seeded.');

  await seedServicesAndEvents();
  console.log('Services & events seeded.');

  const allTags = await prisma.tag.findMany();
  const tagIdBySlug = new Map(allTags.map((t) => [t.slug, t.id]));

  const contentIdByTypeSlug = new Map<string, string>();
  for (const item of [...seedPages, ...seedLandings, ...seedArticles, ...seedResources]) {
    const res = await upsertContentItem({ item, authorUserId: owner.id, tagIdBySlug });
    contentIdByTypeSlug.set(`${res.type}:${res.slug}`, res.id);
  }
  console.log('Pages, landings, articles & resources seeded.');

  // Map content by "type:slug" for glossary link helper
  const contentIdByKey = new Map<string, string>(contentIdByTypeSlug);
  // Add convenience aliases used in glossary seeding
  // (e.g. 'article:...' already present)
  await seedGlossaryAndLinks(contentIdByKey);
  console.log('Glossary seeded.');

  const interactiveDefs = await prisma.interactiveDefinition.findMany();
  const interactiveIdByTypeSlug = new Map<string, string>(
    interactiveDefs.map((d) => [`${d.interactive_type}:${d.slug}`, d.id]),
  );

  await seedCurated(contentIdByTypeSlug, interactiveIdByTypeSlug);
  console.log('Curated collections seeded.');

  await seedScheduleAndSlots();
  console.log('Schedule & slots seeded.');

  await seedDemoUsersAndUgc(owner.id);
  console.log('Demo users, CRM and UGC seeded.');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
