'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';

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
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !quiz ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !quiz ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Квиз не найден</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/interactive/quizzes">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Редактирование: {quiz.title}</h1>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={!canEdit || saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {canEdit && quiz.status !== 'published' && (
              <Button onClick={handlePublish} disabled={publishing} variant="outline">
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
            <Button onClick={() => setShowPreview(!showPreview)} variant="secondary">
              {showPreview ? 'Скрыть превью' : 'Показать превью'}
            </Button>
          </div>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Превью квиза</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Версия:</span>
                    <Select
                      value={previewVersion}
                      onValueChange={(value) => setPreviewVersion(value as 'draft' | 'published')}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="published">Опубликовано</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {previewLoading && <div className="text-sm text-muted-foreground">Загрузка превью...</div>}
                {previewError && (
                  <Alert variant="destructive">
                    <AlertDescription>{previewError}</AlertDescription>
                  </Alert>
                )}
                {previewQuiz?.config && (
                  <Card>
                    <CardContent className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">{previewQuiz.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Вопросов: {previewQuiz.config.questions.length}
                      </p>
                      <div className="space-y-2">
                        {previewQuiz.config.questions.map((q, idx) => (
                          <div key={q.id} className="p-3 bg-muted/40 rounded">
                            <p className="font-medium text-foreground">
                              {idx + 1}. {q.text}
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {q.options.map((opt, optIdx) => (
                                <li key={optIdx}>
                                  • {opt.text} (значение: {opt.value})
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-semibold mb-2">Пороги:</h4>
                        {previewQuiz.config.thresholds.map((t, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            {t.level}: {t.minScore} - {t.maxScore}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Тема (код)</Label>
                <Input
                  type="text"
                  value={quiz.topicCode || ''}
                  onChange={(e) => setQuiz({ ...quiz, topicCode: e.target.value || null })}
                  placeholder="anxiety, burnout, etc."
                />
              </div>

              {quiz.config && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Вопросы</h2>
                    {quiz.config.questions.map((question, qIdx) => (
                      <div key={question.id} className="rounded border border-border p-4 space-y-3">
                        <div className="space-y-2">
                          <Label>Текст вопроса {qIdx + 1}</Label>
                          <Input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Варианты ответов</Label>
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex gap-2">
                              <Input
                                type="number"
                                value={option.value}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, 'value', parseInt(e.target.value))}
                                className="w-20"
                                placeholder="Значение"
                              />
                              <Input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, 'text', e.target.value)}
                                className="flex-1"
                                placeholder="Текст варианта"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Пороги</h2>
                    {quiz.config.thresholds.map((threshold, idx) => (
                      <div key={idx} className="rounded border border-border p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Уровень</Label>
                            <Select
                              value={threshold.level}
                              onValueChange={(value) => updateThreshold(idx, 'level', value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Min Score</Label>
                            <Input
                              type="number"
                              value={threshold.minScore}
                              onChange={(e) => updateThreshold(idx, 'minScore', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Score</Label>
                            <Input
                              type="number"
                              value={threshold.maxScore}
                              onChange={(e) => updateThreshold(idx, 'maxScore', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Результаты</h2>
                    {quiz.config.results.map((result, idx) => (
                      <div key={idx} className="rounded border border-border p-4 space-y-3">
                        <div className="space-y-2">
                          <Label>Уровень</Label>
                          <Select
                            value={result.level}
                            onValueChange={(value) => updateResult(idx, 'level', value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Заголовок</Label>
                          <Input
                            type="text"
                            value={result.title}
                            onChange={(e) => updateResult(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Описание</Label>
                          <Textarea
                            value={result.description}
                            onChange={(e) => updateResult(idx, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Рекомендации &quot;Прямо сейчас&quot; (каждая с новой строки)</Label>
                          <Textarea
                            value={result.recommendations.now.join('\n')}
                            onChange={(e) =>
                              updateResultRecommendation(idx, 'now', e.target.value.split('\n').filter((s) => s.trim()))
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Рекомендации &quot;На этой неделе&quot; (каждая с новой строки)</Label>
                          <Textarea
                            value={result.recommendations.week.join('\n')}
                            onChange={(e) =>
                              updateResultRecommendation(idx, 'week', e.target.value.split('\n').filter((s) => s.trim()))
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Когда обратиться к специалисту</Label>
                          <Textarea
                            value={result.recommendations.whenToSeekHelp || ''}
                            onChange={(e) =>
                              updateResultRecommendation(idx, 'whenToSeekHelp', e.target.value || undefined)
                            }
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Текст CTA</Label>
                          <Input
                            type="text"
                            value={result.ctaText || ''}
                            onChange={(e) => updateResult(idx, 'ctaText', e.target.value || undefined)}
                            placeholder="Получить план в Telegram"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}
