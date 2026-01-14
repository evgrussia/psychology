import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';
import * as cookieParser from 'cookie-parser';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasher: BcryptHasher;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    hasher = new BcryptHasher();

    // Clean up
    await prisma.contentRevision.deleteMany();
    await prisma.contentItem.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Seed roles
    await prisma.role.createMany({
      data: [
        { code: 'owner', scope: 'admin' },
        { code: 'assistant', scope: 'admin' },
        { code: 'editor', scope: 'admin' },
        { code: 'client', scope: 'product' },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/admin/login (POST)', () => {
    it('should login as admin and return session cookie', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      const user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password_hash: passwordHash,
          status: 'active',
          roles: {
            create: { role_code: 'owner' },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body.email).toBe('admin@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('sessionId=');
    });

    it('should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail if user is not admin', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      await prisma.user.create({
        data: {
          email: 'client@example.com',
          password_hash: passwordHash,
          status: 'active',
          roles: {
            create: { role_code: 'client' },
          },
        },
      });

      await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({
          email: 'client@example.com',
          password: password,
        })
        .expect(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should return current user when authenticated', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      const user = await prisma.user.create({
        data: {
          email: 'me@example.com',
          password_hash: passwordHash,
          status: 'active',
          roles: {
            create: { role_code: 'owner' },
          },
        },
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: 'me@example.com', password })
        .expect(200);

      const cookie = loginRes.headers['set-cookie'][0];

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', [cookie])
        .expect(200);

      expect(response.body.email).toBe('me@example.com');
      expect(response.body.roles).toContain('owner');
    });

    it('should fail when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('RBAC protection', () => {
    it('should allow owner to access settings', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      await prisma.user.create({
        data: {
          email: 'owner2@example.com',
          password_hash: passwordHash,
          status: 'active',
          roles: {
            create: { role_code: 'owner' },
          },
        },
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: 'owner2@example.com', password })
        .expect(200);

      const cookie = loginRes.headers['set-cookie'][0];

      await request(app.getHttpServer())
        .get('/api/admin/settings')
        .set('Cookie', [cookie])
        .expect(200);
    });

    it('should forbid assistant from accessing settings', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      await prisma.user.create({
        data: {
          email: 'assistant@example.com',
          password_hash: passwordHash,
          status: 'active',
          roles: {
            create: { role_code: 'assistant' },
          },
        },
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: 'assistant@example.com', password })
        .expect(200);

      const cookie = loginRes.headers['set-cookie'][0];

      await request(app.getHttpServer())
        .get('/api/admin/settings')
        .set('Cookie', [cookie])
        .expect(403);
    });

    it('should forbid blocked user from accessing their data', async () => {
      const password = 'password123';
      const passwordHash = await hasher.hash(password);
      
      const user = await prisma.user.create({
        data: {
          email: 'blocked@example.com',
          password_hash: passwordHash,
          status: 'blocked',
          roles: {
            create: { role_code: 'client' },
          },
        },
      });

      // Try to login first - it should fail now as per new logic
      await request(app.getHttpServer())
        .post('/api/auth/client/login')
        .send({ email: 'blocked@example.com', password })
        .expect(401);

      // Even if session somehow exists, AuthGuard/GetCurrentUserUseCase should block it
      const sessionId = '00000000-0000-0000-0000-000000000000';
      await prisma.session.create({
        data: {
          id: sessionId,
          user_id: user.id,
          expires_at: new Date(Date.now() + 100000),
        },
      });

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', [`sessionId=${sessionId}`])
        .expect(401);
    });
  });
});
