import { PrismaClient, CollectionType, CuratedItemType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting curated collections seed...');

  // --- Mock Content Items if they don't exist ---
  const author = await prisma.user.findFirst({ where: { roles: { some: { role_code: 'owner' } } } });
  if (!author) {
    console.error('Owner not found. Run basic seed first.');
    return;
  }

  const mockContent = [
    { slug: 'anxiety-guide', title: 'Как справиться с тревогой: полное руководство', type: 'article', topic: 'anxiety' },
    { slug: 'burnout-prevention', title: '10 признаков выгорания и как их не пропустить', type: 'article', topic: 'burnout' },
    { slug: 'boundaries-101', title: 'Личные границы: что это и зачем они нужны', type: 'article', topic: 'boundaries' },
    { slug: 'first-session-prep', title: 'Как подготовиться к первой встрече с психологом', type: 'article', topic: null },
  ];

  for (const item of mockContent) {
    await prisma.contentItem.upsert({
      where: { content_type_slug: { content_type: item.type as any, slug: item.slug } },
      update: {},
      create: {
        content_type: item.type as any,
        slug: item.slug,
        title: item.title,
        body_markdown: 'Содержимое в процессе наполнения...',
        status: 'published',
        author_user_id: author.id,
        published_at: new Date(),
        topics: item.topic ? { create: { topic_code: item.topic } } : undefined,
      },
    });
  }

  // --- Curated Collections ---
  const collections = [
    {
      slug: 'anxiety-starter',
      title: 'Стартовый набор: тревога (CUR-01)',
      type: CollectionType.problem,
      topic: 'anxiety',
      items: [
        { type: CuratedItemType.interactive, interactiveSlug: 'anxiety', interactiveType: 'quiz' },
        { type: CuratedItemType.content, contentSlug: 'anxiety-guide' },
      ]
    },
    {
      slug: 'burnout-recovery',
      title: 'Что делать с выгоранием (CUR-02)',
      type: CollectionType.problem,
      topic: 'burnout',
      items: [
        { type: CuratedItemType.interactive, interactiveSlug: 'burnout', interactiveType: 'quiz' },
        { type: CuratedItemType.content, contentSlug: 'burnout-prevention' },
      ]
    },
    {
      slug: 'strengthen-boundaries',
      title: 'Укрепить границы (CUR-03)',
      type: CollectionType.goal,
      topic: 'boundaries',
      items: [
        { type: CuratedItemType.content, contentSlug: 'boundaries-101' },
      ]
    },
    {
      slug: 'quick-exercises',
      title: 'Быстрые упражнения (1-3 мин) (CUR-04)',
      type: CollectionType.format,
      topic: null,
      items: [
        { type: CuratedItemType.interactive, interactiveSlug: 'resource-thermometer', interactiveType: 'thermometer' },
      ]
    },
    {
      slug: 'first-session-ready',
      title: 'Подготовиться к первой встрече (CUR-05)',
      type: CollectionType.context,
      topic: null,
      items: [
        { type: CuratedItemType.content, contentSlug: 'first-session-prep' },
      ]
    }
  ];

  for (const coll of collections) {
    const createdColl = await prisma.curatedCollection.upsert({
      where: { slug: coll.slug },
      update: { title: coll.title, collection_type: coll.type, topic_code: coll.topic, status: 'published', published_at: new Date() },
      create: {
        slug: coll.slug,
        title: coll.title,
        collection_type: coll.type,
        topic_code: coll.topic,
        status: 'published',
        published_at: new Date(),
      },
    });

    // Clear existing items
    await prisma.curatedItem.deleteMany({ where: { collection_id: createdColl.id } });

    // Add items
    for (let i = 0; i < coll.items.length; i++) {
      const item = coll.items[i];
      let contentItemId: string | undefined;
      let interactiveId: string | undefined;

      if (item.type === CuratedItemType.content) {
        const ci = await prisma.contentItem.findFirst({ where: { slug: item.contentSlug } });
        contentItemId = ci?.id;
      } else {
        const id = await prisma.interactiveDefinition.findFirst({ 
          where: { slug: item.interactiveSlug, interactive_type: item.interactiveType as any } 
        });
        interactiveId = id?.id;
      }

      await prisma.curatedItem.create({
        data: {
          collection_id: createdColl.id,
          item_type: item.type,
          content_item_id: contentItemId,
          interactive_definition_id: interactiveId,
          position: i,
        }
      });
    }
  }

  console.log('Curated collections seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
