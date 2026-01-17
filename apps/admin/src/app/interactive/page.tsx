import React from 'react';
import Link from 'next/link';
import { SectionPlaceholder } from '@/components/section-placeholder';

export default function InteractivePage() {
  return (
    <SectionPlaceholder
      title="Интерактивы"
      description="Тексты и параметры интерактивов (квизы, скрипты границ, ритуалы)."
    >
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/interactive/quizzes" className="rounded-md border px-3 py-1">
          Квизы
        </Link>
        <Link href="/interactive/boundaries" className="rounded-md border px-3 py-1">
          Скрипты границ
        </Link>
        <Link href="/interactive/rituals" className="rounded-md border px-3 py-1">
          Мини-ритуалы
        </Link>
      </div>
    </SectionPlaceholder>
  );
}
