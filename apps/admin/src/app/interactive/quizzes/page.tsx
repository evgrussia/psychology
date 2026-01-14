'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuizDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
}

export default function QuizzesListPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:3001/api/admin/interactive/definitions?type=quiz', {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="text-2xl font-bold">Управление квизами</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тема</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Опубликовано</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.topicCode || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    quiz.status === 'published' ? 'bg-green-100 text-green-800' :
                    quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.status === 'published' ? 'Опубликовано' :
                     quiz.status === 'draft' ? 'Черновик' : 'Архив'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {quiz.publishedAt ? new Date(quiz.publishedAt).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/interactive/quizzes/${quiz.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Квизы пока не созданы
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
