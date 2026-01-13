import { Test, TestingModule } from '@nestjs/testing';
import { WriteAuditLogUseCase } from './WriteAuditLogUseCase';
import { IAuditLogRepository } from '../../../domain/audit/repositories/IAuditLogRepository';
import { WriteAuditLogDto } from '../dto/audit-log.dto';

describe('WriteAuditLogUseCase', () => {
  let useCase: WriteAuditLogUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IAuditLogRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WriteAuditLogUseCase,
        {
          provide: 'IAuditLogRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<WriteAuditLogUseCase>(WriteAuditLogUseCase);
    repository = module.get('IAuditLogRepository');
  });

  describe('execute', () => {
    it('should save audit log entry with sanitized values', async () => {
      const dto: WriteAuditLogDto = {
        actorUserId: 'user-1',
        actorRole: 'owner',
        action: 'admin_price_changed',
        entityType: 'service',
        entityId: 'service-1',
        oldValue: {
          id: 'service-1',
          price_amount: 5000,
          description: 'Old description', // Should be removed
        },
        newValue: {
          id: 'service-1',
          price_amount: 6000,
          description: 'New description', // Should be removed
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      await useCase.execute(dto);

      expect(repository.save).toHaveBeenCalled();
      const savedEntry = (repository.save as jest.Mock).mock.calls[0][0];
      expect(savedEntry.actorUserId).toBe('user-1');
      expect(savedEntry.action).toBe('admin_price_changed');
      expect(savedEntry.oldValue).not.toHaveProperty('description');
      expect(savedEntry.newValue).not.toHaveProperty('description');
      expect(savedEntry.oldValue).toHaveProperty('id', 'service-1');
      expect(savedEntry.oldValue).toHaveProperty('price_amount', 5000);
      expect(savedEntry.newValue).toHaveProperty('price_amount', 6000);
    });

    it('should handle null values', async () => {
      const dto: WriteAuditLogDto = {
        actorUserId: 'user-1',
        actorRole: 'owner',
        action: 'admin_login',
        entityType: 'user',
        entityId: null,
        oldValue: null,
        newValue: null,
        ipAddress: null,
        userAgent: null,
      };

      await useCase.execute(dto);

      expect(repository.save).toHaveBeenCalled();
      const savedEntry = (repository.save as jest.Mock).mock.calls[0][0];
      expect(savedEntry.oldValue).toBeNull();
      expect(savedEntry.newValue).toBeNull();
    });

    it('should throw error if repository save fails', async () => {
      const dto: WriteAuditLogDto = {
        actorUserId: 'user-1',
        actorRole: 'owner',
        action: 'admin_price_changed',
        entityType: 'service',
        entityId: 'service-1',
        oldValue: null,
        newValue: null,
        ipAddress: null,
        userAgent: null,
      };

      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
    });
  });
});
