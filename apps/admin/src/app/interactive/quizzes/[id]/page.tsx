'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  text: string;
  options: { value: number; text: string }[];
}

interface QuizThreshold {
  level: 'low' | 'moderate' | 'high';
  minScore: number;
  maxScore: number;
}

interface QuizResult {
  level: 'low' | 'moderate' | 'high';
  title: string;
  description: string;
  recommendations: {
    now: string[];
    week: string[];
    whenToSeekHelp?: string;
  };
  ctaText?: string;
}

interface QuizConfig {
  questions: QuizQuestion[];
  thresholds: QuizThreshold[];
  results: QuizResult[];
  crisisTrigger?: {
    questionId?: string;
    thresholdScore?: number;
  };
}

interface QuizDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  config: QuizConfig | null;
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [quiz, setQuiz] = useState<QuizDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/admin/interactive/definitions/${id}`, {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      const data = await response.json();
      setQuiz(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quiz) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/admin/interactive/definitions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          title: quiz.title,
          topicCode: quiz.topicCode,
          config: quiz.config,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save quiz');
      }
      alert('Сохранено успешно');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!quiz) return;
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/admin/interactive/definitions/${id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to publish quiz');
      }
      alert('Опубликовано успешно');
      fetchQuiz();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    if (!quiz?.config) return;
    const newQuestions = [...quiz.config.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz({ ...quiz, config: { ...quiz.config, questions: newQuestions } });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, field: 'value' | 'text', value: any) => {
    if (!quiz?.config) return;
    const newQuestions = [...quiz.config.questions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options: newOptions };
    setQuiz({ ...quiz, config: { ...quiz.config, questions: newQuestions } });
  };

  const updateThreshold = (index: number, field: keyof QuizThreshold, value: any) => {
    if (!quiz?.config) return;
    const newThresholds = [...quiz.config.thresholds];
    newThresholds[index] = { ...newThresholds[index], [field]: value };
    setQuiz({ ...quiz, config: { ...quiz.config, thresholds: newThresholds } });
  };

  const updateResult = (index: number, field: keyof QuizResult, value: any) => {
    if (!quiz?.config) return;
    const newResults = [...quiz.config.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setQuiz({ ...quiz, config: { ...quiz.config, results: newResults } });
  };

  const updateResultRecommendation = (resultIndex: number, field: 'now' | 'week' | 'whenToSeekHelp', value: any) => {
    if (!quiz?.config) return;
    const newResults = [...quiz.config.results];
    newResults[resultIndex] = {
      ...newResults[resultIndex],
      recommendations: { ...newResults[resultIndex].recommendations, [field]: value },
    };
    setQuiz({ ...quiz, config: { ...quiz.config, results: newResults } });
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error && !quiz) return <div className="p-8 text-red-500">Ошибка: {error}</div>;
  if (!quiz) return <div className="p-8">Квиз не найден</div>;

  return (
    <div className="p-8">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/admin/interactive/quizzes" style={{ color: '#3498db' }}>← Назад к списку</Link>
        <h1 className="text-2xl font-bold mt-4">Редактирование: {quiz.title}</h1>
        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {quiz.status !== 'published' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {showPreview ? 'Скрыть превью' : 'Показать превью'}
        </button>
      </div>

      {showPreview && quiz.config && (
        <div className="mb-8 p-4 bg-gray-50 rounded border">
          <h2 className="text-xl font-bold mb-4">Превью квиза</h2>
          <div className="bg-white p-6 rounded">
            <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 mb-4">Вопросов: {quiz.config.questions.length}</p>
            <div className="space-y-2">
              {quiz.config.questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{idx + 1}. {q.text}</p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, optIdx) => (
                      <li key={optIdx} className="text-sm text-gray-600">
                        • {opt.text} (значение: {opt.value})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Пороги:</h4>
              {quiz.config.thresholds.map((t, idx) => (
                <div key={idx} className="text-sm">
                  {t.level}: {t.minScore} - {t.maxScore}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input
            type="text"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Тема (код)</label>
          <input
            type="text"
            value={quiz.topicCode || ''}
            onChange={(e) => setQuiz({ ...quiz, topicCode: e.target.value || null })}
            className="w-full px-3 py-2 border rounded"
            placeholder="anxiety, burnout, etc."
          />
        </div>

        {quiz.config && (
          <>
            <div>
              <h2 className="text-xl font-bold mb-4">Вопросы</h2>
              {quiz.config.questions.map((question, qIdx) => (
                <div key={question.id} className="mb-6 p-4 border rounded">
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Текст вопроса {qIdx + 1}</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Варианты ответов</label>
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex gap-2 mb-2">
                        <input
                          type="number"
                          value={option.value}
                          onChange={(e) => updateQuestionOption(qIdx, optIdx, 'value', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="Значение"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateQuestionOption(qIdx, optIdx, 'text', e.target.value)}
                          className="flex-1 px-3 py-1 border rounded"
                          placeholder="Текст варианта"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Пороги</h2>
              {quiz.config.thresholds.map((threshold, idx) => (
                <div key={idx} className="mb-4 p-4 border rounded">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Уровень</label>
                      <select
                        value={threshold.level}
                        onChange={(e) => updateThreshold(idx, 'level', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Min Score</label>
                      <input
                        type="number"
                        value={threshold.minScore}
                        onChange={(e) => updateThreshold(idx, 'minScore', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Score</label>
                      <input
                        type="number"
                        value={threshold.maxScore}
                        onChange={(e) => updateThreshold(idx, 'maxScore', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Результаты</h2>
              {quiz.config.results.map((result, idx) => (
                <div key={idx} className="mb-6 p-4 border rounded">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Уровень</label>
                    <select
                      value={result.level}
                      onChange={(e) => updateResult(idx, 'level', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Заголовок</label>
                    <input
                      type="text"
                      value={result.title}
                      onChange={(e) => updateResult(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Описание</label>
                    <textarea
                      value={result.description}
                      onChange={(e) => updateResult(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Рекомендации "Прямо сейчас" (каждая с новой строки)</label>
                    <textarea
                      value={result.recommendations.now.join('\n')}
                      onChange={(e) => updateResultRecommendation(idx, 'now', e.target.value.split('\n').filter(s => s.trim()))}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Рекомендации "На этой неделе" (каждая с новой строки)</label>
                    <textarea
                      value={result.recommendations.week.join('\n')}
                      onChange={(e) => updateResultRecommendation(idx, 'week', e.target.value.split('\n').filter(s => s.trim()))}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Когда обратиться к специалисту</label>
                    <textarea
                      value={result.recommendations.whenToSeekHelp || ''}
                      onChange={(e) => updateResultRecommendation(idx, 'whenToSeekHelp', e.target.value || undefined)}
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Текст CTA</label>
                    <input
                      type="text"
                      value={result.ctaText || ''}
                      onChange={(e) => updateResult(idx, 'ctaText', e.target.value || undefined)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Получить план в Telegram"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
