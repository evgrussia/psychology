import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

describe('Smoke Test (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Psychology Platform API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Health Check /api/health', async () => {
    // Note: Adjust endpoint if you have a specific health check endpoint
    // If not, we'll just check if the app responds to some basic route
    return request(app.getHttpServer())
      .get('/api/auth/me') 
      .expect(401); // Expect 401 because we are not authenticated, but it means app is up
  });

  it('Swagger UI is accessible', async () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200);
  });
});
