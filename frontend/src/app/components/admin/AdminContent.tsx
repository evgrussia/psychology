/**
 * Список контента из GET admin/content/ с переходом к публикации (publish API).
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Send } from 'lucide-react';
import * as adminApi from '@/api/endpoints/admin';
import type { AdminContentItem } from '@/api/types/admin';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AdminContent() {
  const [data, setData] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishModal, setPublishModal] = useState<AdminContentItem | null>(null);
  const [checklist, setChecklist] = useState({
    hasDisclaimers: false,
    toneChecked: false,
    hasCta: false,
    hasInternalLinks: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .getAdminContent()
      .then((res) => setData(res.data ?? []))
      .catch(() => {
        setData([]);
        toast.error('Не удалось загрузить контент');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handlePublish = () => {
    if (!publishModal) return;
    const allChecked =
      checklist.hasDisclaimers && checklist.toneChecked && checklist.hasCta && checklist.hasInternalLinks;
    if (!allChecked) {
      toast.error('Отметьте все пункты чеклиста перед публикацией');
      return;
    }
    setSubmitting(true);
    adminApi
      .publishContentItem(publishModal.id, checklist)
      .then(() => {
        toast.success('Контент опубликован');
        setPublishModal(null);
        setChecklist({
          hasDisclaimers: false,
          toneChecked: false,
          hasCta: false,
          hasInternalLinks: false,
        });
        load();
      })
      .catch((err: { message?: string }) => {
        toast.error(err?.message ?? 'Ошибка публикации');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-100">
        <CardHeader>
          <h3 className="font-semibold text-[#2D3748] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Контент
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[#718096] py-8 text-center">Загрузка…</p>
          ) : data.length === 0 ? (
            <p className="text-[#718096] py-8 text-center">Нет контента</p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-[#2D3748]">{item.title}</p>
                    <p className="text-sm text-[#718096]">
                      {item.slug} · {item.status} · {formatDate(item.created_at)}
                    </p>
                  </div>
                  {item.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPublishModal(item)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Опубликовать
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!publishModal} onOpenChange={(open) => !open && setPublishModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Публикация контента</DialogTitle>
          </DialogHeader>
          {publishModal && (
            <>
              <p className="text-sm text-[#718096]">{publishModal.title}</p>
              <div className="space-y-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.hasDisclaimers}
                    onCheckedChange={(v) => setChecklist((c) => ({ ...c, hasDisclaimers: !!v }))}
                  />
                  <span>Дисклеймеры</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.toneChecked}
                    onCheckedChange={(v) => setChecklist((c) => ({ ...c, toneChecked: !!v }))}
                  />
                  <span>Тон проверен</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.hasCta}
                    onCheckedChange={(v) => setChecklist((c) => ({ ...c, hasCta: !!v }))}
                  />
                  <span>CTA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.hasInternalLinks}
                    onCheckedChange={(v) => setChecklist((c) => ({ ...c, hasInternalLinks: !!v }))}
                  />
                  <span>Перелинковка (2–5)</span>
                </label>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishModal(null)}>
              Отмена
            </Button>
            <Button onClick={handlePublish} disabled={submitting}>
              {submitting ? 'Публикация…' : 'Опубликовать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
