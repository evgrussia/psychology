/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  durationMinutes: number;
  priceAmount: number;
  depositAmount: number | null;
  status: 'draft' | 'published' | 'archived';
  topicCode: string | null;
  updatedAt: string;
}

export default function ServicesPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/services', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить услуги');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : (
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Услуги</h1>
              <p className="text-sm text-gray-500">Каталог услуг, цены и правила бронирования.</p>
            </div>
            {canEdit && (
              <Link href="/services/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Создать услугу
              </Link>
            )}
          </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Формат</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Длительность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Депозит</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.format}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.durationMinutes} мин</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.priceAmount} ₽</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.depositAmount === null ? '—' : `${service.depositAmount} ₽`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : service.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.status === 'published' ? 'Опубликовано' : service.status === 'draft' ? 'Черновик' : 'Архив'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/services/${service.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Услуг пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}
