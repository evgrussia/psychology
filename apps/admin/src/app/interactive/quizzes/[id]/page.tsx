'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

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
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  const [quiz, setQuiz] = useState<QuizDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<'draft' | 'published'>('draft');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewQuiz, setPreviewQuiz] = useState<QuizDefinition | null>(null);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!showPreview) {
      return;
    }
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, previewVersion, id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        credentials: 'include',
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
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
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

  const fetchPreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const response = await fetch(
        `/api/admin/interactive/definitions/${id}/preview?version=${previewVersion}`,
        { credentials: 'include' },
      );
      if (!response.ok) {
        throw new Error(previewVersion === 'published'
          ? 'Опубликованная версия не найдена'
          : 'Не удалось загрузить черновик');
      }
      const data = await response.json();
      setPreviewQuiz(data);
    } catch (err: any) {
      setPreviewQuiz(null);
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
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

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error && !quiz ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : !quiz ? (
        <div className="p-8">Квиз не найден</div>
      ) : (
        <div className="p-8">
          <div style={{ marginBottom: '20px' }}>
            <Link href="/interactive/quizzes" style={{ color: '#3498db' }}>← Назад к списку</Link>
            <h1 className="text-2xl font-bold mt-4">Редактирование: {quiz.title}</h1>
            {error && <div className="mt-2 text-red-500">{error}</div>}
          </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={handleSave}
          disabled={!canEdit || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {canEdit && quiz.status !== 'published' && (
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

      {showPreview && (
        <div className="mb-8 p-4 bg-gray-50 rounded border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">Превью квиза</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Версия:</span>
              <select
                value={previewVersion}
                onChange={(event) => setPreviewVersion(event.target.value as 'draft' | 'published')}
                className="rounded border px-2 py-1"
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>
          </div>
          {previewLoading && <div className="text-sm text-muted-foreground">Загрузка превью...</div>}
          {previewError && <div className="text-sm text-red-500">{previewError}</div>}
          {previewQuiz?.config && (
            <div className="bg-white p-6 rounded">
              <h3 className="text-lg font-semibold mb-2">{previewQuiz.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Вопросов: {previewQuiz.config.questions.length}</p>
              <div className="space-y-2">
                {previewQuiz.config.questions.map((q, idx) => (
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
                {previewQuiz.config.thresholds.map((t, idx) => (
                  <div key={idx} className="text-sm">
                    {t.level}: {t.minScore} - {t.maxScore}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                        onChange={(e) => updateThreshold(idx, 'level', e.target.value as any)}
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
                      onChange={(e) => updateResult(idx, 'level', e.target.value as any)}
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
                    <label className="block text-sm font-medium mb-1">Рекомендации &quot;Прямо сейчас&quot; (каждая с новой строки)</label>
                    <textarea
                      value={result.recommendations.now.join('\n')}
                      onChange={(e) => updateResultRecommendation(idx, 'now', e.target.value.split('\n').filter(s => s.trim()))}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Рекомендации &quot;На этой неделе&quot; (каждая с новой строки)</label>
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
      )}
    </AdminAuthGuard>
  );
}
