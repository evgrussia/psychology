import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // --- Roles ---
  const roles = [
    { code: 'owner', scope: 'admin' },
    { code: 'assistant', scope: 'admin' },
    { code: 'editor', scope: 'admin' },
    { code: 'client', scope: 'product' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: {
        code: role.code,
        scope: role.scope as any,
      },
    });
  }
  console.log('Roles seeded.');

  // --- Initial Owner ---
  const ownerEmail = 'owner@psychology.test';
  const ownerPassword = 'password123'; // In a real app, this should be changed immediately
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      display_name: 'Владелец',
      password_hash: passwordHash,
      status: 'active',
      roles: {
        create: {
          role_code: 'owner',
        },
      },
    },
  });
  console.log(`Owner seeded: ${ownerEmail}`);

  // --- Topics ---
  const topics = [
    { code: 'anxiety', title: 'Тревога' },
    { code: 'burnout', title: 'Выгорание' },
    { code: 'relationships', title: 'Отношения' },
    { code: 'boundaries', title: 'Границы' },
    { code: 'selfesteem', title: 'Самооценка' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { code: topic.code },
      update: {},
      create: {
        code: topic.code,
        title: topic.title,
        is_active: true,
      },
    });
  }
  console.log('Topics seeded.');

  // --- Interactive Definitions ---
  const interactives = [
    { id: '11111111-1111-1111-1111-111111111111', type: 'quiz', slug: 'anxiety', title: 'Тест на тревогу', topic_code: 'anxiety' },
    { id: '22222222-2222-2222-2222-222222222222', type: 'quiz', slug: 'burnout', title: 'Проверка выгорания', topic_code: 'burnout' },
    { id: '33333333-3333-3333-3333-333333333333', type: 'navigator', slug: 'navigator', title: 'Навигатор состояния', topic_code: null },
    { id: '44444444-4444-4444-4444-444444444444', type: 'thermometer', slug: 'resource-thermometer', title: 'Термометр ресурса', topic_code: null },
  ];

  for (const interactive of interactives) {
    await prisma.interactiveDefinition.upsert({
      where: { interactive_type_slug: { interactive_type: interactive.type as any, slug: interactive.slug } },
      update: { title: interactive.title, topic_code: interactive.topic_code },
      create: {
        id: interactive.id,
        interactive_type: interactive.type as any,
        slug: interactive.slug,
        title: interactive.title,
        topic_code: interactive.topic_code,
        status: 'published',
        published_at: new Date(),
      },
    });
  }
  console.log('Interactive Definitions seeded.');

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
