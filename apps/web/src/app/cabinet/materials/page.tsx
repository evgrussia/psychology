'use client';

import React from 'react';
import Link from 'next/link';
import { CabinetPageLayout } from '../CabinetPageLayout';
import { getCabinetMaterials } from '../cabinetApi';
import { Button, Card } from '@psychology/design-system';
import { track } from '@/lib/tracking';

export default function CabinetMaterialsPage() {
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [materials, setMaterials] = React.useState<any>(null);

  React.useEffect(() => {
    track('lk_opened', { page_path: '/cabinet/materials' });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getCabinetMaterials();
        if (!isMounted) return;
        setMaterials(data);
        setUnauthorized(false);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.message === 'unauthorized') {
          setUnauthorized(true);
        } else {
          setError('Не удалось загрузить материалы.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CabinetPageLayout
      title="Материалы после встреч"
      description="Ссылки и файлы, которые мы обсуждали на консультациях."
    >
      {loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Загружаем материалы...
        </div>
      )}

      {!loading && unauthorized && (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Войдите, чтобы открыть материалы</h2>
          <p className="text-muted-foreground">
            Материалы доступны только авторизованным клиентам.
          </p>
          <div>
            <Button asChild>
              <Link href="/login">Войти в кабинет</Link>
            </Button>
          </div>
        </Card>
      )}

      {!loading && !unauthorized && error && (
        <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          {error}
        </div>
      )}

      {!loading && !unauthorized && !error && (
        <div className="space-y-4">
          {materials?.items?.length ? (
            materials.items.map((material: any) => (
              <Card key={material.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {material.material_type === 'file' ? 'Файл' : 'Ссылка'}
                  </div>
                  <div className="text-lg font-semibold text-foreground">{material.title}</div>
                  {material.description && (
                    <div className="text-sm text-muted-foreground mt-2">{material.description}</div>
                  )}
                </div>
                {material.url && (
                  <Button asChild variant="outline">
                    <a href={material.url} target="_blank" rel="noreferrer">
                      Открыть
                    </a>
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-6 text-muted-foreground">
              После консультаций здесь появятся материалы и рекомендации.
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/cabinet/appointments">Посмотреть встречи</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </CabinetPageLayout>
  );
}
