/**
 * Дашборд админки: сводка — лиды за период, ближайшие встречи, очередь модерации.
 */

import { useEffect, useState } from 'react';
import { Users, Calendar, MessageSquare } from 'lucide-react';
import * as adminApi from '@/api/endpoints/admin';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

export default function AdminDashboard() {
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  const [appointmentsCount, setAppointmentsCount] = useState<number | null>(null);
  const [moderationCount, setModerationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getAdminLeads({ per_page: 1 }).then((r) => r.pagination?.total ?? 0),
      adminApi.getAdminAppointments({ per_page: 1 }).then((r) => r.pagination?.total ?? 0),
      adminApi.getAdminModeration({ status: 'pending' }).then((r) => r.data?.length ?? 0),
    ])
      .then(([leads, appointments, moderation]) => {
        setLeadsCount(leads);
        setAppointmentsCount(appointments);
        setModerationCount(moderation);
      })
      .catch(() => {
        setLeadsCount(0);
        setAppointmentsCount(0);
        setModerationCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Лиды',
      value: loading ? '—' : String(leadsCount ?? 0),
      description: 'Всего в системе',
      icon: Users,
      gradient: 'from-[#A8B5FF] to-[#C8F5E8]',
    },
    {
      title: 'Встречи',
      value: loading ? '—' : String(appointmentsCount ?? 0),
      description: 'Бронирования',
      icon: Calendar,
      gradient: 'from-[#7FD99A] to-[#C8F5E8]',
    },
    {
      title: 'Модерация',
      value: loading ? '—' : String(moderationCount ?? 0),
      description: 'Ожидают проверки',
      icon: MessageSquare,
      gradient: 'from-[#FFD4B5] to-[#FFB5C5]',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#2D3748]">Сводка</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ title, value, description, icon: Icon, gradient }) => (
          <Card key={title} className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#718096]">{title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#2D3748]">{value}</p>
              <p className="text-xs text-[#718096] mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
