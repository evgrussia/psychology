'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';

interface BoundaryScript {
  id: string;
  title: string;
  description: string;
  template: string;
  category: string;
}

// Mock data - в реальности будет API
const mockScripts: BoundaryScript[] = [
  {
    id: '1',
    title: 'Отказ от нежелательной просьбы',
    description: 'Ведите себя уверенно, но вежливо',
    template: 'Спасибо, что обратились ко мне. К сожалению, я не могу помочь в этой ситуации, потому что [причина]. Надеюсь, вы понимаете.',
    category: 'refusal',
  },
  {
    id: '2',
    title: 'Установление личных границ',
    description: 'Чётко обозначьте свои границы',
    template: 'Я понимаю, что [ситуация], но для меня важно [ваша граница]. Пожалуйста, уважайте это.',
    category: 'boundary',
  },
  {
    id: '3',
    title: 'Защита от токсичного поведения',
    description: 'Защитите себя от манипуляций',
    template: 'Я замечаю, что [поведение]. Это неприемлемо для меня. Если это продолжится, мне придётся [последствие].',
    category: 'protection',
  },
];

export default function BoundariesScriptsPage() {
  const { track } = useTracking();
  const [selectedScript, setSelectedScript] = useState<BoundaryScript | null>(null);
  const [customization, setCustomization] = useState({
    reason: '',
    boundary: '',
    behavior: '',
    consequence: '',
  });
  const [generatedScript, setGeneratedScript] = useState<string>('');

  const { data: scripts, isLoading, error } = useQuery({
    queryKey: ['boundary-scripts'],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockScripts;
    },
  });

  const handleScriptSelect = (script: BoundaryScript) => {
    setSelectedScript(script);
    setGeneratedScript('');
    track('boundary_script_selected', {
      script_id: script.id,
      category: script.category,
    });
  };

  const handleGenerate = () => {
    if (!selectedScript) return;

    let script = selectedScript.template;
    
    // Замена плейсхолдеров
    if (selectedScript.category === 'refusal' && customization.reason) {
      script = script.replace('[причина]', customization.reason);
    } else if (selectedScript.category === 'boundary') {
      if (customization.boundary) {
        script = script.replace('[ваша граница]', customization.boundary);
      }
      if (customization.reason) {
        script = script.replace('[ситуация]', customization.reason);
      }
    } else if (selectedScript.category === 'protection') {
      if (customization.behavior) {
        script = script.replace('[поведение]', customization.behavior);
      }
      if (customization.consequence) {
        script = script.replace('[последствие]', customization.consequence);
      }
    }

    setGeneratedScript(script);
    track('boundary_script_generated', {
      script_id: selectedScript.id,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Генератор скриптов границ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Список скриптов */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Выберите тип скрипта</h2>
            {scripts?.map((script) => (
              <Card
                key={script.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedScript?.id === script.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleScriptSelect(script)}
              >
                <CardHeader>
                  <CardTitle>{script.title}</CardTitle>
                  <CardDescription>{script.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Кастомизация и результат */}
          <div className="space-y-4">
            {selectedScript ? (
              <>
                <h2 className="text-xl font-semibold">Настройте скрипт</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedScript.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedScript.category === 'refusal' && (
                      <div>
                        <Label htmlFor="reason">Причина отказа</Label>
                        <Textarea
                          id="reason"
                          value={customization.reason}
                          onChange={(e) =>
                            setCustomization({ ...customization, reason: e.target.value })
                          }
                          placeholder="Например: у меня уже есть планы на это время"
                        />
                      </div>
                    )}

                    {selectedScript.category === 'boundary' && (
                      <>
                        <div>
                          <Label htmlFor="situation">Ситуация</Label>
                          <Input
                            id="situation"
                            value={customization.reason}
                            onChange={(e) =>
                              setCustomization({ ...customization, reason: e.target.value })
                            }
                            placeholder="Опишите ситуацию"
                          />
                        </div>
                        <div>
                          <Label htmlFor="boundary">Ваша граница</Label>
                          <Input
                            id="boundary"
                            value={customization.boundary}
                            onChange={(e) =>
                              setCustomization({ ...customization, boundary: e.target.value })
                            }
                            placeholder="Например: не работать после 18:00"
                          />
                        </div>
                      </>
                    )}

                    {selectedScript.category === 'protection' && (
                      <>
                        <div>
                          <Label htmlFor="behavior">Поведение</Label>
                          <Input
                            id="behavior"
                            value={customization.behavior}
                            onChange={(e) =>
                              setCustomization({ ...customization, behavior: e.target.value })
                            }
                            placeholder="Опишите недопустимое поведение"
                          />
                        </div>
                        <div>
                          <Label htmlFor="consequence">Последствие</Label>
                          <Input
                            id="consequence"
                            value={customization.consequence}
                            onChange={(e) =>
                              setCustomization({ ...customization, consequence: e.target.value })
                            }
                            placeholder="Например: прекратить общение"
                          />
                        </div>
                      </>
                    )}

                    <Button onClick={handleGenerate} className="w-full">
                      Сгенерировать скрипт
                    </Button>

                    {generatedScript && (
                      <Card className="bg-muted">
                        <CardHeader>
                          <CardTitle>Ваш скрипт</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap">{generatedScript}</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedScript);
                              track('boundary_script_copied', {
                                script_id: selectedScript.id,
                              });
                            }}
                          >
                            Копировать
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Выберите тип скрипта слева
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
