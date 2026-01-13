import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

export async function createTestUser(
  prisma: PrismaService,
  email: string = 'test@example.com',
  roleCode: string = 'client',
  status: 'active' | 'blocked' = 'active'
) {
  const hasher = new BcryptHasher();
  const password = 'password123';
  const passwordHash = await hasher.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      status,
      roles: {
        create: {
          role_code: roleCode,
        },
      },
    },
    include: {
      roles: true,
    },
  });

  return { user, password };
}

export async function loginTestUser(
  app: INestApplication,
  email: string,
  password: string,
  scope: 'admin' | 'client' = 'client'
) {
  const endpoint = scope === 'admin' ? '/api/auth/admin/login' : '/api/auth/client/login';
  
  const response = await request(app.getHttpServer())
    .post(endpoint)
    .send({ email, password })
    .expect(200);

  const cookie = response.headers['set-cookie'][0];
  return { cookie, body: response.body };
}

export async function clearDatabase(prisma: PrismaService) {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}
