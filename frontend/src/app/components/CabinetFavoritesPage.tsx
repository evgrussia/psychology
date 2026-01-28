/**
 * Моя аптечка — список избранного (статьи, ресурсы, ритуалы).
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Heart, FileText, BookOpen, Sparkles, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import * as cabinetApi from '@/api/endpoints/cabinet';
import type { FavoriteItem, FavoriteResourceType } from '@/api/types/cabinet';
import { showApiError } from '@/lib/errorToast';

interface CabinetFavoritesPageProps {
  onBack?: () => void;
  onNavigateToArticle?: (slug: string) => void;
  onNavigateToResource?: (slug: string) => void;
}

const typeMeta: Record<FavoriteResourceType, { label: string; icon: typeof FileText; color: string }> = {
  article: { label: 'Статья', icon: FileText, color: 'from-[#A8B5FF] to-[#C8F5E8]' },
  resource: { label: 'Ресурс', icon: BookOpen, color: 'from-[#7FD99A] to-[#C8F5E8]' },
  ritual: { label: 'Ритуал', icon: Sparkles, color: 'from-[#FFD4B5] to-[#FFC97F]' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CabinetFavoritesPage({
  onBack,
  onNavigateToArticle,
  onNavigateToResource,
}: CabinetFavoritesPageProps) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(() => {
    setLoading(true);
    setError(null);
    cabinetApi
      .getFavorites()
      .then((res) => setItems(res.data ?? []))
      .catch((err) => {
        showApiError(err);
        setError(err?.message ?? 'Не удалось загрузить аптечку');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await cabinetApi.removeFavorite(id);
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      showApiError(err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleOpen = (item: FavoriteItem) => {
    if (item.resource_type === 'article' && onNavigateToArticle) {
      onNavigateToArticle(item.resource_id);
    } else if ((item.resource_type === 'resource' || item.resource_type === 'ritual') && onNavigateToResource) {
      onNavigateToResource(item.resource_id);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            В кабинет
          </button>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[#A8B5FF] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          В кабинет
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB5C5] to-[#FFD4B5] flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748]">Моя аптечка</h1>
              <p className="text-sm text-[#718096] mt-0.5">
                Сохранённые статьи и практики для поддержки
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadFavorites}
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
            >
              Повторить
            </button>
          </motion.div>
        )}

        {!error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 sm:p-12 text-center"
          >
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2D3748] font-medium mb-1">Аптечка пуста</p>
            <p className="text-sm text-[#718096]">
              Добавляйте сюда статьи и практики кнопкой «В аптечку» на страницах материалов.
            </p>
          </motion.div>
        )}

        {!error && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => {
              const meta = typeMeta[item.resource_type] ?? typeMeta.article;
              const Icon = meta.icon;
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2D3748] truncate">{item.resource_id}</p>
                    <p className="text-xs text-[#718096]">{meta.label} · {formatDate(item.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpen(item)}
                      className="p-2 rounded-lg text-[#718096] hover:bg-[#A8B5FF]/10 hover:text-[#A8B5FF] transition-colors"
                      title="Открыть"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="p-2 rounded-lg text-[#718096] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Удалить из аптечки"
                    >
                      {removingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
