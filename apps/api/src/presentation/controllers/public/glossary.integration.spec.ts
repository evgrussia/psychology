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
import { ListAvailableSlotsUseCase } from '../../../application/booking/use-cases/ListAvailableSlotsUseCase';
import { StartBookingUseCase } from '../../../application/booking/use-cases/StartBookingUseCase';
import { SubmitIntakeUseCase } from '../../../application/booking/use-cases/SubmitIntakeUseCase';
import { UpdateBookingConsentsUseCase } from '../../../application/booking/use-cases/UpdateBookingConsentsUseCase';
import { GetBookingStatusUseCase } from '../../../application/booking/use-cases/GetBookingStatusUseCase';
import { CreatePaymentUseCase } from '../../../application/booking/use-cases/CreatePaymentUseCase';
import { CreateWaitlistRequestUseCase } from '../../../application/booking/use-cases/CreateWaitlistRequestUseCase';
import { GetNoSlotsModelUseCase } from '../../../application/booking/use-cases/GetNoSlotsModelUseCase';
import { GetBookingAlternativesUseCase } from '../../../application/booking/use-cases/GetBookingAlternativesUseCase';
import { CreateDeepLinkUseCase } from '../../../application/telegram/use-cases/CreateDeepLinkUseCase';
import { NotFoundException } from '@nestjs/common';
import { GlossaryTermCategory } from '../../../domain/content/value-objects/ContentEnums';

describe('PublicController - Glossary (Integration)', () => {
  let app: INestApplication;
  let listUseCase: ListPublicGlossaryTermsUseCase;
  let getUseCase: GetPublicGlossaryTermUseCase;

  const mockTerms = [
    {
      slug: 'test-term-1',
      title: 'Test Term 1',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Test definition 1',
    },
    {
      slug: 'test-term-2',
      title: 'Test Term 2',
      category: GlossaryTermCategory.state,
      shortDefinition: 'Test definition 2',
    },
  ];

  const mockTerm = {
    slug: 'test-term-1',
    title: 'Test Term 1',
    category: GlossaryTermCategory.concept,
    shortDefinition: 'Test definition 1',
    bodyMarkdown: '# Test content',
    metaDescription: 'Test meta description',
    keywords: 'test, keyword',
    synonyms: ['synonym1'],
    relatedContent: [],
  };

  beforeEach(async () => {
    const mockListUseCase = {
      execute: jest.fn().mockResolvedValue(mockTerms),
    };

    const mockGetUseCase = {
      execute: jest.fn().mockResolvedValue(mockTerm),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        {
          provide: GetHomepageModelUseCase,
          useValue: { execute: jest.fn() },
        },
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
          useValue: mockListUseCase,
        },
        {
          provide: GetPublicGlossaryTermUseCase,
          useValue: mockGetUseCase,
        },
        {
          provide: ListServicesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetServiceBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListAvailableSlotsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: StartBookingUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SubmitIntakeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateBookingConsentsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetBookingStatusUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateWaitlistRequestUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetNoSlotsModelUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateDeepLinkUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetBookingAlternativesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    listUseCase = module.get<ListPublicGlossaryTermsUseCase>(ListPublicGlossaryTermsUseCase);
    getUseCase = module.get<GetPublicGlossaryTermUseCase>(GetPublicGlossaryTermUseCase);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /public/glossary', () => {
    it('should return 200 with list of glossary terms', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/glossary')
        .expect(200);

      expect(response.body).toEqual(mockTerms);
      expect(listUseCase.execute).toHaveBeenCalledWith({
        category: undefined,
        search: undefined,
      });
    });

    it('should filter by category', async () => {
      await request(app.getHttpServer())
        .get('/public/glossary?category=concept')
        .expect(200);

      expect(listUseCase.execute).toHaveBeenCalledWith({ category: GlossaryTermCategory.concept });
    });

    it('should search by query', async () => {
      await request(app.getHttpServer())
        .get('/public/glossary?search=test')
        .expect(200);

      expect(listUseCase.execute).toHaveBeenCalledWith({ search: 'test' });
    });
  });

  describe('GET /public/glossary/:slug', () => {
    it('should return 200 with glossary term', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/glossary/test-term-1')
        .expect(200);

      expect(response.body).toEqual(mockTerm);
      expect(getUseCase.execute).toHaveBeenCalledWith('test-term-1');
    });

    it('should return 404 if term not found', async () => {
      (getUseCase.execute as jest.Mock).mockRejectedValueOnce(
        new NotFoundException('Glossary term with slug non-existent not found')
      );

      await request(app.getHttpServer())
        .get('/public/glossary/non-existent')
        .expect(404);
    });
  });
});
