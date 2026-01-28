/**
 * Очередь модерации UGC: список + действия «одобрить» / «отклонить» / «ответить».
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MessageSquare, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import * as adminApi from '@/api/endpoints/admin';
import type { AdminModerationItem } from '@/api/types/admin';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function AdminModeration() {
  const [data, setData] = useState<AdminModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [answerModal, setAnswerModal] = useState<AdminModerationItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .getAdminModeration({ status: statusFilter })
      .then((res) => setData(res.data ?? []))
      .catch(() => {
        setData([]);
        toast.error('Не удалось загрузить очередь модерации');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleModerate = (itemId: string, status: 'approved' | 'rejected') => {
    adminApi
      .moderateUGCItem(itemId, status)
      .then(() => {
        toast.success(status === 'approved' ? 'Одобрено' : 'Отклонено');
        load();
      })
      .catch((err: { message?: string }) => toast.error(err?.message ?? 'Ошибка'));
  };

  const handleAnswer = () => {
    if (!answerModal || !answerText.trim()) {
      toast.error('Введите текст ответа');
      return;
    }
    setSubmitting(true);
    adminApi
      .answerUGCQuestion(answerModal.id, answerText.trim())
      .then(() => {
        toast.success('Ответ сохранён');
        setAnswerModal(null);
        setAnswerText('');
        load();
      })
      .catch((err: { message?: string }) => toast.error(err?.message ?? 'Ошибка'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Ожидают</SelectItem>
            <SelectItem value="approved">Одобренные</SelectItem>
            <SelectItem value="rejected">Отклонённые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-gray-100">
        <CardHeader>
          <h3 className="font-semibold text-[#2D3748] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Модерация UGC
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[#718096] py-8 text-center">Загрузка…</p>
          ) : data.length === 0 ? (
            <p className="text-[#718096] py-8 text-center">Нет элементов</p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#2D3748]">
                      {item.content_type} · {item.status}
                    </p>
                    <p className="text-sm text-[#718096] truncate">{item.content || '—'} · {formatDate(item.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(item.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Одобрить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerate(item.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {item.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnswerModal(item)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Ответить
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!answerModal} onOpenChange={(open) => !open && (setAnswerModal(null), setAnswerText(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответ на вопрос</DialogTitle>
          </DialogHeader>
          {answerModal && (
            <>
              <p className="text-sm text-[#718096]">Элемент: {answerModal.content_type} · {answerModal.id}</p>
              <Textarea
                placeholder="Текст ответа"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAnswerModal(null); setAnswerText(''); }}>
              Отмена
            </Button>
            <Button onClick={handleAnswer} disabled={submitting || !answerText.trim()}>
              {submitting ? 'Отправка…' : 'Отправить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
