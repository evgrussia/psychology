import { Test, TestingModule } from '@nestjs/testing';
import { GetBoundaryScriptsUseCase } from './GetBoundaryScriptsUseCase';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { NotFoundException } from '@nestjs/common';

describe('GetBoundaryScriptsUseCase', () => {
  let useCase: GetBoundaryScriptsUseCase;
  let definitionRepository: any;

  beforeEach(async () => {
    definitionRepository = {
      findByTypeAndSlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBoundaryScriptsUseCase,
        {
          provide: 'IInteractiveDefinitionRepository',
          useValue: definitionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBoundaryScriptsUseCase>(GetBoundaryScriptsUseCase);
  });

  it('should return boundary scripts definition when found', async () => {
    const mockConfig = {
      scenarios: [],
      tones: [],
      goals: [],
      matrix: [],
      safety_block: { text: 'test' },
    };

    const mockDefinition = InteractiveDefinition.reconstitute({
      id: 'test-id',
      type: InteractiveType.BOUNDARIES,
      slug: 'test-slug',
      title: 'Test Title',
      topicCode: 'test-topic',
      status: InteractiveStatus.PUBLISHED,
      config: mockConfig,
      publishedAt: new Date(),
    });

    definitionRepository.findByTypeAndSlug.mockResolvedValue(mockDefinition);

    const result = await useCase.execute({ slug: 'test-slug' });

    expect(result).toEqual({
      id: 'test-id',
      slug: 'test-slug',
      title: 'Test Title',
      config: mockConfig,
    });
    expect(definitionRepository.findByTypeAndSlug).toHaveBeenCalledWith(
      InteractiveType.BOUNDARIES,
      'test-slug',
    );
  });

  it('should throw NotFoundException when not found', async () => {
    definitionRepository.findByTypeAndSlug.mockResolvedValue(null);

    await expect(useCase.execute({ slug: 'non-existent' })).rejects.toThrow(NotFoundException);
  });

  it('should preserve stable variant_id in config', async () => {
    const mockConfig = {
      scenarios: [{ id: 'work', name: 'Работа' }],
      tones: [{ id: 'soft', name: 'Мягко' }],
      goals: [{ id: 'refuse', name: 'Отказать' }],
      matrix: [
        {
          scenario_id: 'work',
          tone_id: 'soft',
          goal_id: 'refuse',
          variants: [
            { variant_id: 'script_work_refuse_soft_v1', text: 'Извините, но я не могу' },
            { variant_id: 'script_work_refuse_soft_v2', text: 'К сожалению, сейчас не могу' },
          ],
        },
      ],
      safety_block: { text: 'test' },
    };

    const mockDefinition = InteractiveDefinition.reconstitute({
      id: 'test-id',
      type: InteractiveType.BOUNDARIES,
      slug: 'test-slug',
      title: 'Test Title',
      topicCode: 'test-topic',
      status: InteractiveStatus.PUBLISHED,
      config: mockConfig,
      publishedAt: new Date(),
    });

    definitionRepository.findByTypeAndSlug.mockResolvedValue(mockDefinition);

    const result = await useCase.execute({ slug: 'test-slug' });

    // Verify variant_id is preserved and stable
    expect(result.config.matrix[0].variants[0].variant_id).toBe('script_work_refuse_soft_v1');
    expect(result.config.matrix[0].variants[1].variant_id).toBe('script_work_refuse_soft_v2');
    expect(result.config.matrix[0].variants[0]).toHaveProperty('variant_id');
    expect(result.config.matrix[0].variants[0]).toHaveProperty('text');
  });

  it('should correctly map selection to variants via matrix', async () => {
    const mockConfig = {
      scenarios: [{ id: 'work', name: 'Работа' }, { id: 'family', name: 'Семья' }],
      tones: [{ id: 'soft', name: 'Мягко' }, { id: 'firm', name: 'Твёрдо' }],
      goals: [{ id: 'refuse', name: 'Отказать' }, { id: 'ask', name: 'Попросить' }],
      matrix: [
        {
          scenario_id: 'work',
          tone_id: 'soft',
          goal_id: 'refuse',
          variants: [{ variant_id: 'script_work_refuse_soft_v1', text: 'Test variant 1' }],
        },
        {
          scenario_id: 'family',
          tone_id: 'firm',
          goal_id: 'ask',
          variants: [{ variant_id: 'script_family_ask_firm_v1', text: 'Test variant 2' }],
        },
      ],
      safety_block: { text: 'test' },
    };

    const mockDefinition = InteractiveDefinition.reconstitute({
      id: 'test-id',
      type: InteractiveType.BOUNDARIES,
      slug: 'test-slug',
      title: 'Test Title',
      topicCode: 'test-topic',
      status: InteractiveStatus.PUBLISHED,
      config: mockConfig,
      publishedAt: new Date(),
    });

    definitionRepository.findByTypeAndSlug.mockResolvedValue(mockDefinition);

    const result = await useCase.execute({ slug: 'test-slug' });

    // Verify matrix structure allows correct mapping
    const workSoftRefuse = result.config.matrix.find(
      (m) => m.scenario_id === 'work' && m.tone_id === 'soft' && m.goal_id === 'refuse',
    );
    expect(workSoftRefuse).toBeDefined();
    expect(workSoftRefuse?.variants).toHaveLength(1);
    expect(workSoftRefuse?.variants[0].variant_id).toBe('script_work_refuse_soft_v1');

    const familyFirmAsk = result.config.matrix.find(
      (m) => m.scenario_id === 'family' && m.tone_id === 'firm' && m.goal_id === 'ask',
    );
    expect(familyFirmAsk).toBeDefined();
    expect(familyFirmAsk?.variants).toHaveLength(1);
    expect(familyFirmAsk?.variants[0].variant_id).toBe('script_family_ask_firm_v1');
  });
});
