import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ListAuditLogUseCase } from './ListAuditLogUseCase';
import { IAuditLogRepository } from '@domain/audit/repositories/IAuditLogRepository';
import { AuditLogEntry } from '@domain/audit/entities/AuditLogEntry';
import { ListAuditLogDto, AuditLogAction } from '../dto/audit-log.dto';

describe('ListAuditLogUseCase', () => {
  let useCase: ListAuditLogUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IAuditLogRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAuditLogUseCase,
        {
          provide: 'IAuditLogRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListAuditLogUseCase>(ListAuditLogUseCase);
    repository = module.get('IAuditLogRepository');
  });

  describe('execute', () => {
    it('should return audit log entries for owner', async () => {
      const dto: ListAuditLogDto = {
        page: 1,
        pageSize: 20,
      };

      const mockEntries = [
        AuditLogEntry.create({
          id: '1',
          actorUserId: 'user-1',
          actorRole: 'owner',
          action: AuditLogAction.ADMIN_PRICE_CHANGED,
          entityType: 'service',
          entityId: 'service-1',
          oldValue: { price_amount: 5000 },
          newValue: { price_amount: 6000 },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }),
      ];

      repository.findMany.mockResolvedValue({
        items: mockEntries,
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      const result = await useCase.execute(dto, 'user-1', ['owner']);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].action).toBe(AuditLogAction.ADMIN_PRICE_CHANGED);
      expect(result.pagination.total).toBe(1);
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({}),
        { page: 1, pageSize: 20 },
      );
    });

    it('should filter by actorUserId for assistant (only their own)', async () => {
      const dto: ListAuditLogDto = {
        page: 1,
        pageSize: 20,
      };

      repository.findMany.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      await useCase.execute(dto, 'assistant-user-1', ['assistant']);

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'assistant-user-1',
        }),
        { page: 1, pageSize: 20 },
      );
    });

    it('should throw ForbiddenException for editor role', async () => {
      const dto: ListAuditLogDto = {
        page: 1,
        pageSize: 20,
      };

      await expect(
        useCase.execute(dto, 'editor-user-1', ['editor']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should apply filters from DTO', async () => {
      const dto: ListAuditLogDto = {
        action: AuditLogAction.ADMIN_PRICE_CHANGED,
        entityType: 'service',
        entityId: 'service-1',
        fromDate: '2026-01-01T00:00:00Z',
        toDate: '2026-01-31T23:59:59Z',
        page: 2,
        pageSize: 10,
      };

      repository.findMany.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        pageSize: 10,
        totalPages: 0,
      });

      await useCase.execute(dto, 'user-1', ['owner']);

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditLogAction.ADMIN_PRICE_CHANGED,
          entityType: 'service',
          entityId: 'service-1',
          fromDate: expect.any(Date),
          toDate: expect.any(Date),
        }),
        { page: 2, pageSize: 10 },
      );
    });
  });
});
