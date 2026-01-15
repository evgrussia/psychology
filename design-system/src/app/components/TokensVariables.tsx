import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function TokensVariables() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorTokens = {
    base: [
      { name: '--background', light: '#FAFBFC', dark: '#0F1419', description: 'Основной фон приложения' },
      { name: '--foreground', light: '#1A1D2E', dark: '#F9FAFB', description: 'Основной цвет текста' },
      { name: '--card', light: '#FFFFFF', dark: '#1A1D2E', description: 'Фон карточек' },
      { name: '--card-foreground', light: '#1A1D2E', dark: '#F9FAFB', description: 'Текст на карточках' },
    ],
    brand: [
      { name: '--primary', light: '#5B7C99', dark: '#7B9FBD', description: 'Основной брендовый цвет' },
      { name: '--primary-foreground', light: '#FFFFFF', dark: '#0F1419', description: 'Текст на primary' },
      { name: '--secondary', light: '#F1F3F5', dark: '#252936', description: 'Вторичный цвет' },
      { name: '--secondary-foreground', light: '#1A1D2E', dark: '#F9FAFB', description: 'Текст на secondary' },
    ],
    semantic: [
      { name: '--success', light: '#10B981', dark: '#34D399', description: 'Успешное действие' },
      { name: '--warning', light: '#F59E0B', dark: '#FBBF24', description: 'Предупреждение' },
      { name: '--danger', light: '#EF4444', dark: '#F87171', description: 'Ошибка или опасность' },
      { name: '--info', light: '#3B82F6', dark: '#60A5FA', description: 'Информация' },
    ],
    ui: [
      { name: '--border', light: '#E5E7EB', dark: '#2D3240', description: 'Цвет границ' },
      { name: '--input', light: '#FFFFFF', dark: '#1A1D2E', description: 'Фон полей ввода' },
      { name: '--muted', light: '#F7F8FA', dark: '#1E2838', description: 'Приглушённый фон' },
      { name: '--muted-foreground', light: '#6B7280', dark: '#9CA3AF', description: 'Приглушённый текст' },
      { name: '--focus', light: '#5B7C99', dark: '#7B9FBD', description: 'Цвет фокуса (WCAG AA)' },
    ],
  };

  const spacingTokens = [
    { name: '--space-0', value: '0px', usage: 'Нет отступа' },
    { name: '--space-1', value: '4px', usage: 'Минимальный отступ' },
    { name: '--space-2', value: '8px', usage: 'Базовая единица' },
    { name: '--space-3', value: '12px', usage: 'Малый отступ' },
    { name: '--space-4', value: '16px', usage: 'Стандартный отступ' },
    { name: '--space-5', value: '20px', usage: 'Средний отступ' },
    { name: '--space-6', value: '24px', usage: 'Увеличенный отступ' },
    { name: '--space-8', value: '32px', usage: 'Большой отступ' },
    { name: '--space-10', value: '40px', usage: 'Очень большой отступ' },
    { name: '--space-12', value: '48px', usage: 'Экстра большой' },
    { name: '--space-16', value: '64px', usage: 'Максимальный' },
  ];

  const radiusTokens = [
    { name: '--radius-sm', value: '8px', usage: 'Малое скругление' },
    { name: '--radius-md', value: '12px', usage: 'Среднее скругление' },
    { name: '--radius-lg', value: '16px', usage: 'Большое скругление' },
    { name: '--radius-xl', value: '24px', usage: 'Экстра большое' },
    { name: '--radius-pill', value: '9999px', usage: 'Полное скругление (таблетка)' },
  ];

  const elevationTokens = [
    { name: '--elevation-0', value: 'none', usage: 'Нет тени, плоский' },
    { name: '--elevation-1', value: '0 1px 3px rgba(0,0,0,0.08)', usage: 'Минимальная высота' },
    { name: '--elevation-2', value: '0 4px 6px rgba(0,0,0,0.08)', usage: 'Карточки, кнопки' },
    { name: '--elevation-3', value: '0 10px 15px rgba(0,0,0,0.08)', usage: 'Dropdown, popover' },
    { name: '--elevation-4', value: '0 20px 25px rgba(0,0,0,0.08)', usage: 'Модальные окна' },
  ];

  const typographyTokens = [
    { name: 'Display', size: '36px', weight: '700', lineHeight: '1.25', usage: 'Героический заголовок' },
    { name: 'H1', size: '30px', weight: '700', lineHeight: '1.25', usage: 'Главный заголовок страницы' },
    { name: 'H2', size: '24px', weight: '600', lineHeight: '1.25', usage: 'Заголовки секций' },
    { name: 'H3', size: '20px', weight: '600', lineHeight: '1.5', usage: 'Подзаголовки' },
    { name: 'H4', size: '18px', weight: '500', lineHeight: '1.5', usage: 'Малые заголовки' },
    { name: 'Body', size: '16px', weight: '400', lineHeight: '1.75', usage: 'Основной текст' },
    { name: 'Caption', size: '14px', weight: '400', lineHeight: '1.5', usage: 'Вторичный текст' },
    { name: 'Overline', size: '12px', weight: '500', lineHeight: '1.5', usage: 'Метки, теги' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tokens & Variables</h1>
        <p className="text-muted-foreground">
          CSS-переменные и токены дизайн-системы с поддержкой светлой и тёмной темы
        </p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="colors">Цвета</TabsTrigger>
          <TabsTrigger value="spacing">Отступы</TabsTrigger>
          <TabsTrigger value="radius">Радиусы</TabsTrigger>
          <TabsTrigger value="elevation">Тени</TabsTrigger>
          <TabsTrigger value="typography">Типографика</TabsTrigger>
        </TabsList>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-6 mt-6">
          {Object.entries(colorTokens).map(([category, tokens]) => (
            <section key={category}>
              <h3 className="text-xl font-semibold text-foreground mb-4 capitalize">
                {category === 'base' && 'Базовые цвета'}
                {category === 'brand' && 'Брендовые цвета'}
                {category === 'semantic' && 'Семантические цвета'}
                {category === 'ui' && 'UI элементы'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tokens.map((token) => (
                  <Card key={token.name}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex gap-2">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: token.light }}
                            title="Light mode"
                          />
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: token.dark }}
                            title="Dark mode"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <code className="text-sm font-mono text-primary">{token.name}</code>
                            <button
                              onClick={() => copyToken(`var(${token.name})`)}
                              className="p-1 hover:bg-muted rounded"
                              aria-label="Copy token"
                            >
                              {copiedToken === `var(${token.name})` ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{token.description}</p>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="font-mono">{token.light}</Badge>
                            <Badge variant="outline" className="font-mono">{token.dark}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </TabsContent>

        {/* Spacing */}
        <TabsContent value="spacing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale (8pt Grid System)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spacingTokens.map((token) => (
                  <div key={token.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div
                      className="bg-primary/20 rounded"
                      style={{ width: token.value, height: '32px', minWidth: '4px' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono font-semibold text-foreground">{token.name}</code>
                          <Badge variant="secondary" className="font-mono">{token.value}</Badge>
                        </div>
                        <button
                          onClick={() => copyToken(`var(${token.name})`)}
                          className="p-2 hover:bg-muted rounded"
                        >
                          {copiedToken === `var(${token.name})` ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{token.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Border Radius */}
        <TabsContent value="radius" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Border Radius Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {radiusTokens.map((token) => (
                  <div key={token.name} className="text-center">
                    <div
                      className="w-full h-32 bg-primary/20 mb-3 mx-auto"
                      style={{ borderRadius: token.value, maxWidth: '200px' }}
                    />
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono font-semibold text-foreground">{token.name}</code>
                      <button
                        onClick={() => copyToken(`var(${token.name})`)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {copiedToken === `var(${token.name})` ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <Badge variant="secondary" className="font-mono mb-2">{token.value}</Badge>
                    <p className="text-xs text-muted-foreground">{token.usage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elevation */}
        <TabsContent value="elevation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Elevation (Box Shadows)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                {elevationTokens.map((token, idx) => (
                  <div key={token.name} className="text-center">
                    <div
                      className="w-full h-32 bg-card rounded-lg mb-3 flex items-center justify-center"
                      style={{
                        boxShadow: token.value,
                        border: idx === 0 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <span className="text-2xl font-bold text-muted-foreground">{idx}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono font-semibold text-foreground">{token.name}</code>
                      <button
                        onClick={() => copyToken(`var(${token.name})`)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {copiedToken === `var(${token.name})` ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{token.usage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale (Inter Family)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {typographyTokens.map((token) => (
                  <div key={token.name} className="border-b border-border pb-6 last:border-0">
                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">{token.name}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">{token.size}</Badge>
                          <Badge variant="outline">Weight {token.weight}</Badge>
                          <Badge variant="outline">LH {token.lineHeight}</Badge>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground mb-2">{token.usage}</p>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: token.size,
                        fontWeight: token.weight,
                        lineHeight: token.lineHeight,
                      }}
                    >
                      Съешь ещё этих мягких французских булок, да выпей чаю
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Example */}
      <section>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Использование токенов в CSS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
              <p className="text-muted-foreground mb-2">/* В CSS файлах */</p>
              <p className="text-foreground">.my-element &#123;</p>
              <p className="text-foreground ml-4">background: var(--primary);</p>
              <p className="text-foreground ml-4">color: var(--primary-foreground);</p>
              <p className="text-foreground ml-4">padding: var(--space-4);</p>
              <p className="text-foreground ml-4">border-radius: var(--radius-lg);</p>
              <p className="text-foreground ml-4">box-shadow: var(--elevation-2);</p>
              <p className="text-foreground">&#125;</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
              <p className="text-muted-foreground mb-2">/* В Tailwind утилитах */</p>
              <p className="text-foreground">&lt;div className="bg-primary text-primary-foreground p-4 rounded-lg"&gt;</p>
              <p className="text-foreground ml-4">Используйте готовые Tailwind классы</p>
              <p className="text-foreground">&lt;/div&gt;</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
