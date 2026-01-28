'use client';

import { useQuery } from '@tanstack/react-query';
import { cabinetService } from '@/services/api/cabinet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { FileText, Download, ExternalLink } from 'lucide-react';

export default function MaterialsPage() {
  const { track } = useTracking();

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['materials'],
    queryFn: () => cabinetService.getMaterials(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои материалы</h1>

        {materials && materials.length === 0 && (
          <EmptyState
            message="У вас пока нет доступных материалов"
            action={{
              label: 'Посмотреть ресурсы',
              onClick: () => (window.location.href = '/resources'),
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials?.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  {material.title}
                </CardTitle>
                <CardDescription>{material.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {material.description && (
                  <p className="text-sm text-muted-foreground">{material.description}</p>
                )}
                <div className="flex gap-2">
                  {material.download_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(material.download_url, '_blank');
                        track('material_downloaded', {
                          material_id: material.id,
                          material_type: material.type,
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      Скачать
                    </Button>
                  )}
                  {material.view_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={() =>
                        track('material_viewed', {
                          material_id: material.id,
                          material_type: material.type,
                        })
                      }
                    >
                      <Link href={material.view_url}>
                        <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                        Открыть
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
