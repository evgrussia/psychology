import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting test data seed...');

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

  // --- Test User ---
  const testUserEmail = 'test@psychology.test';
  const testUserPassword = 'password123';
  const passwordHash = await bcrypt.hash(testUserPassword, 12);

  await prisma.user.upsert({
    where: { email: testUserEmail },
    update: {},
    create: {
      email: testUserEmail,
      display_name: 'Тестовый Пользователь',
      password_hash: passwordHash,
      status: 'active',
      roles: {
        create: {
          role_code: 'client',
        },
      },
    },
  });

  console.log(`Test user seeded: ${testUserEmail}`);

  // --- Test Topics ---
  const topics = [
    { code: 'test-topic-1', title: 'Тестовая тема 1' },
    { code: 'test-topic-2', title: 'Тестовая тема 2' },
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

  console.log('Test data seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
