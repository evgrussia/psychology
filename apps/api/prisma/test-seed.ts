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

  // --- Test Topics ---
  const topics = [
    { code: 'anxiety', title: 'Тревога' },
    { code: 'burnout', title: 'Выгорание' },
    { code: 'relationships', title: 'Отношения' },
    { code: 'work', title: 'Работа' },
    { code: 'family', title: 'Семья' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { code: topic.code },
      update: { is_active: true },
      create: {
        code: topic.code,
        title: topic.title,
        is_active: true,
      },
    });
  }

  // --- Quizzes ---
  await prisma.interactiveDefinition.upsert({
    where: { interactive_type_slug: { interactive_type: 'quiz', slug: 'anxiety' } },
    update: { status: 'published' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      interactive_type: 'quiz',
      slug: 'anxiety',
      title: 'Тест на тревогу (GAD-7)',
      topic_code: 'anxiety',
      status: 'published',
      published_at: new Date(),
      definition_json: {
        questions: Array(7).fill({ id: 'q', text: 'Q', options: [{ value: 3, text: 'V' }] }),
        thresholds: [{ level: 'high', minScore: 0, maxScore: 21 }],
        results: [{ level: 'high', title: 'H', description: 'D', recommendations: { now: [], week: [] } }]
      }
    }
  });

  // --- Navigators ---
  await prisma.interactiveDefinition.upsert({
    where: { interactive_type_slug: { interactive_type: 'navigator', slug: 'state-navigator' } },
    update: { status: 'published' },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      interactive_type: 'navigator',
      slug: 'state-navigator',
      title: 'Навигатор состояния',
      status: 'published',
      published_at: new Date(),
      definition_json: {
        initial_step_id: 'step_1',
        steps: [
          {
            step_id: 'step_1',
            question_text: 'Q1',
            choices: [{ choice_id: 'c1', text: 'C1', next_step_id: null, result_profile_id: 'res_1' }]
          }
        ],
        result_profiles: [{ id: 'res_1', title: 'R1', description: 'D1', recommendations: { now: [], week: [] } }]
      }
    }
  });

  // --- Boundaries Scripts ---
  await prisma.interactiveDefinition.upsert({
    where: { interactive_type_slug: { interactive_type: 'boundaries', slug: 'default' } },
    update: { status: 'published' },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      interactive_type: 'boundaries',
      slug: 'default',
      title: 'Скрипты границ',
      status: 'published',
      published_at: new Date(),
      definition_json: {
        scenarios: [{ id: 'work', name: 'Работа' }, { id: 'family', name: 'Семья' }],
        tones: [{ id: 'soft', name: 'Мягко' }],
        goals: [{ id: 'refuse', name: 'Отказать' }],
        matrix: [{
          scenario_id: 'work', tone_id: 'soft', goal_id: 'refuse',
          variants: [{ variant_id: 'v1', text: 'No' }]
        }],
        safety_block: { text: 'Safe' }
      }
    }
  });

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
