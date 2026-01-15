import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PublicController } from './public.controller';
import { GetHomepageModelUseCase } from '../../../application/public/use-cases/GetHomepageModelUseCase';
import { GetPageBySlugUseCase } from '../../../application/public/use-cases/GetPageBySlugUseCase';
import { GetContentBySlugUseCase } from '../../../application/public/use-cases/GetContentBySlugUseCase';
import { ListContentItemsUseCase } from '../../../application/public/use-cases/ListContentItemsUseCase';
import { GetTopicsUseCase } from '../../../application/public/use-cases/GetTopicsUseCase';
import { GetTopicLandingUseCase } from '../../../application/public/use-cases/GetTopicLandingUseCase';
import { ListCuratedCollectionsUseCase } from '../../../application/public/use-cases/ListCuratedCollectionsUseCase';
import { GetCuratedCollectionUseCase } from '../../../application/public/use-cases/GetCuratedCollectionUseCase';
import { ListPublicGlossaryTermsUseCase } from '../../../application/public/use-cases/ListPublicGlossaryTermsUseCase';
import { GetPublicGlossaryTermUseCase } from '../../../application/public/use-cases/GetPublicGlossaryTermUseCase';
import { ListServicesUseCase } from '../../../application/public/use-cases/ListServicesUseCase';
import { GetServiceBySlugUseCase } from '../../../application/public/use-cases/GetServiceBySlugUseCase';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';
import { HomepageDto } from '../../../application/public/dto/homepage.dto';

describe('PublicController (Integration)', () => {
  let app: INestApplication;
  let getHomepageModelUseCase: GetHomepageModelUseCase;

  const mockHomepageData: HomepageDto = {
    topics: [
      { code: 'anxiety', title: 'Тревога' },
      { code: 'burnout', title: 'Выгорание' },
      { code: 'relationships', title: 'Отношения' },
    ],
    featured_interactives: [
      {
        id: '1',
        type: 'quiz',
        slug: 'anxiety-quiz',
        title: 'Квиз по тревоге',
        topicCode: 'anxiety',
      },
    ],
    trust_blocks: [
      {
        id: 'confidentiality',
        title: 'Конфиденциальность',
        description: 'Ваши данные под защитой',
      },
      {
        id: 'how_it_works',
        title: 'Как это работает',
        description: '3 шага к балансу',
      },
      {
        id: 'boundaries',
        title: 'Профессиональные границы',
        description: 'Работа в партнерстве',
      },
    ],
  };

  beforeEach(async () => {
    const mockUseCaseProvider = {
      provide: GetHomepageModelUseCase,
      useValue: {
        execute: jest.fn().mockResolvedValue(mockHomepageData),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        mockUseCaseProvider,
        {
          provide: GetPageBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetContentBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListContentItemsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTopicsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTopicLandingUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListCuratedCollectionsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCuratedCollectionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListPublicGlossaryTermsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetPublicGlossaryTermUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListServicesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetServiceBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    getHomepageModelUseCase = module.get<GetHomepageModelUseCase>(
      GetHomepageModelUseCase,
    );
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /public/homepage', () => {
    it('should return 200 with homepage data', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.body).toEqual(mockHomepageData);
    });

    it('should return topics array', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.body.topics).toBeDefined();
      expect(Array.isArray(response.body.topics)).toBe(true);
      expect(response.body.topics.length).toBe(3);
    });

    it('should return featured_interactives array', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.body.featured_interactives).toBeDefined();
      expect(Array.isArray(response.body.featured_interactives)).toBe(true);
    });

    it('should return trust_blocks array with 3 items', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.body.trust_blocks).toBeDefined();
      expect(Array.isArray(response.body.trust_blocks)).toBe(true);
      expect(response.body.trust_blocks.length).toBe(3);
    });

    it('should accept locale query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage?locale=ru')
        .expect(200);

      expect(getHomepageModelUseCase.execute).toHaveBeenCalledWith({
        locale: 'ru',
      });
    });

    it('should use default locale when not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(getHomepageModelUseCase.execute).toHaveBeenCalledWith({
        locale: 'ru',
      });
    });

    it('should return correct data structure for topics', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      const topic = response.body.topics[0];
      expect(topic).toHaveProperty('code');
      expect(topic).toHaveProperty('title');
      expect(typeof topic.code).toBe('string');
      expect(typeof topic.title).toBe('string');
    });

    it('should return correct data structure for interactives', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      if (response.body.featured_interactives.length > 0) {
        const interactive = response.body.featured_interactives[0];
        expect(interactive).toHaveProperty('id');
        expect(interactive).toHaveProperty('type');
        expect(interactive).toHaveProperty('slug');
        expect(interactive).toHaveProperty('title');
      }
    });

    it('should return correct data structure for trust blocks', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      const trustBlock = response.body.trust_blocks[0];
      expect(trustBlock).toHaveProperty('id');
      expect(trustBlock).toHaveProperty('title');
      expect(trustBlock).toHaveProperty('description');
    });

    it('should handle use case errors gracefully', async () => {
      jest
        .spyOn(getHomepageModelUseCase, 'execute')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(500);

      // NestJS should return 500 on unhandled errors
      expect(response.status).toBe(500);
    });

    it('should set correct content-type header', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not require authentication', async () => {
      // Endpoint должен быть публичным
      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should handle empty interactives gracefully', async () => {
      const dataWithoutInteractives = {
        ...mockHomepageData,
        featured_interactives: [],
      };

      jest
        .spyOn(getHomepageModelUseCase, 'execute')
        .mockResolvedValueOnce(dataWithoutInteractives);

      const response = await request(app.getHttpServer())
        .get('/public/homepage')
        .expect(200);

      expect(response.body.featured_interactives).toEqual([]);
    });
  });

  describe('GET /public/services', () => {
    it('should return list of services', async () => {
      const listServicesUseCase = app.get<ListServicesUseCase>(ListServicesUseCase);
      jest.spyOn(listServicesUseCase, 'execute').mockResolvedValueOnce([
        {
          id: 'service-1',
          slug: 'intro-session',
          title: 'Ознакомительная сессия',
          format: ServiceFormat.online,
          duration_minutes: 50,
          price_amount: 4000,
          deposit_amount: 1000,
          offline_address: null,
          description_markdown: 'Описание',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/public/services')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].slug).toBe('intro-session');
    });
  });

  describe('GET /public/services/:slug', () => {
    it('should return service details by slug', async () => {
      const getServiceBySlugUseCase = app.get<GetServiceBySlugUseCase>(GetServiceBySlugUseCase);
      jest.spyOn(getServiceBySlugUseCase, 'execute').mockResolvedValueOnce({
        id: 'service-1',
        slug: 'intro-session',
        title: 'Ознакомительная сессия',
        format: ServiceFormat.online,
        duration_minutes: 50,
        price_amount: 4000,
        deposit_amount: 1000,
        offline_address: null,
        description_markdown: 'Описание',
        cancel_free_hours: 24,
        cancel_partial_hours: 12,
        reschedule_min_hours: 24,
        reschedule_max_count: 1,
      });

      const response = await request(app.getHttpServer())
        .get('/public/services/intro-session')
        .expect(200);

      expect(response.body.slug).toBe('intro-session');
      expect(response.body.cancel_free_hours).toBe(24);
    });
  });
});
