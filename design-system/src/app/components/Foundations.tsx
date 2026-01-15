import { Type, Grid3x3, Palette, Circle } from 'lucide-react';

export function Foundations() {
  const spacingScale = [
    { name: 'space-0', value: '0px', token: '--space-0' },
    { name: 'space-1', value: '4px', token: '--space-1' },
    { name: 'space-2', value: '8px', token: '--space-2' },
    { name: 'space-3', value: '12px', token: '--space-3' },
    { name: 'space-4', value: '16px', token: '--space-4' },
    { name: 'space-5', value: '20px', token: '--space-5' },
    { name: 'space-6', value: '24px', token: '--space-6' },
    { name: 'space-8', value: '32px', token: '--space-8' },
    { name: 'space-10', value: '40px', token: '--space-10' },
    { name: 'space-12', value: '48px', token: '--space-12' },
    { name: 'space-16', value: '64px', token: '--space-16' },
  ];

  const radiusScale = [
    { name: 'sm', value: '8px', token: '--radius-sm' },
    { name: 'md', value: '12px', token: '--radius-md' },
    { name: 'lg', value: '16px', token: '--radius-lg' },
    { name: 'xl', value: '24px', token: '--radius-xl' },
    { name: 'pill', value: '9999px', token: '--radius-pill' },
  ];

  const typeScale = [
    { name: 'Display', size: '36px', weight: '700', lineHeight: '1.25', token: 'text-4xl' },
    { name: 'H1', size: '30px', weight: '700', lineHeight: '1.25', token: 'text-3xl' },
    { name: 'H2', size: '24px', weight: '600', lineHeight: '1.25', token: 'text-2xl' },
    { name: 'H3', size: '20px', weight: '600', lineHeight: '1.5', token: 'text-xl' },
    { name: 'H4', size: '18px', weight: '500', lineHeight: '1.5', token: 'text-lg' },
    { name: 'Body', size: '16px', weight: '400', lineHeight: '1.75', token: 'text-base' },
    { name: 'Caption', size: '14px', weight: '400', lineHeight: '1.5', token: 'text-sm' },
    { name: 'Overline', size: '12px', weight: '500', lineHeight: '1.5', token: 'text-xs' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Foundations</h1>
        <p className="text-muted-foreground">
          Базовые элементы дизайн-системы: сетка, типографика, цвета и формы
        </p>
      </div>

      {/* Grid & Spacing */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Grid3x3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Сетка и отступы</h2>
            <p className="text-sm text-muted-foreground">8pt Grid System + 4pt increments</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {spacingScale.map((space) => (
              <div key={space.name} className="text-center">
                <div className="bg-primary/20 rounded-lg mb-2 flex items-center justify-center"
                  style={{ height: space.value, minHeight: '24px' }}>
                </div>
                <p className="text-xs font-medium text-foreground">{space.name}</p>
                <p className="text-xs text-muted-foreground">{space.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Принцип:</strong> Все отступы кратны 4px или 8px. Базовая единица — 8px. 
              Используется для margins, paddings, gaps между элементами.
            </p>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Circle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Радиусы скругления</h2>
            <p className="text-sm text-muted-foreground">Единый токен radius/*</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="grid md:grid-cols-5 gap-6">
            {radiusScale.map((radius) => (
              <div key={radius.name} className="text-center">
                <div 
                  className="w-full h-24 bg-primary/20 mb-3 mx-auto"
                  style={{ borderRadius: radius.value, maxWidth: '96px' }}
                />
                <p className="text-sm font-medium text-foreground">{radius.name}</p>
                <p className="text-xs text-muted-foreground">{radius.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Типографика</h2>
            <p className="text-sm text-muted-foreground">Inter с отличной поддержкой кириллицы</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Стиль</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Размер</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Вес</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Высота строки</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Пример</th>
                </tr>
              </thead>
              <tbody>
                {typeScale.map((type) => (
                  <tr key={type.name} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{type.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{type.size}</td>
                    <td className="p-4 text-sm text-muted-foreground">{type.weight}</td>
                    <td className="p-4 text-sm text-muted-foreground">{type.lineHeight}</td>
                    <td className="p-4">
                      <span style={{ 
                        fontSize: type.size, 
                        fontWeight: type.weight,
                        lineHeight: type.lineHeight 
                      }}>
                        Пример текста Aa
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Цветовая палитра</h2>
            <p className="text-sm text-muted-foreground">Тёплая, дружелюбная, вдохновлённая психологическими сервисами</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Брендовые цвета</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="h-20 rounded-lg mb-2" style={{ backgroundColor: '#17A2B8' }} />
                <p className="text-sm font-medium text-foreground">Primary</p>
                <p className="text-xs text-muted-foreground">#17A2B8 — Бирюзовый</p>
              </div>
              <div>
                <div className="h-20 rounded-lg mb-2 border border-border" style={{ backgroundColor: '#FFF5F2' }} />
                <p className="text-sm font-medium text-foreground">Secondary</p>
                <p className="text-xs text-muted-foreground">#FFF5F2 — Коралловый фон</p>
              </div>
              <div>
                <div className="h-20 rounded-lg mb-2 border border-border" style={{ backgroundColor: '#E6F7F9' }} />
                <p className="text-sm font-medium text-foreground">Accent</p>
                <p className="text-xs text-muted-foreground">#E6F7F9 — Мягкий мятный</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Семантические цвета</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: '#0FA968' }} />
                <p className="text-sm font-medium text-foreground">Success</p>
                <p className="text-xs text-muted-foreground">#0FA968</p>
              </div>
              <div>
                <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: '#F59E42' }} />
                <p className="text-sm font-medium text-foreground">Warning</p>
                <p className="text-xs text-muted-foreground">#F59E42</p>
              </div>
              <div>
                <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: '#E74C3C' }} />
                <p className="text-sm font-medium text-foreground">Danger</p>
                <p className="text-xs text-muted-foreground">#E74C3C</p>
              </div>
              <div>
                <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: '#17A2B8' }} />
                <p className="text-sm font-medium text-foreground">Info</p>
                <p className="text-xs text-muted-foreground">#17A2B8</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elevation */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Высоты (Elevation)</h2>
          <p className="text-sm text-muted-foreground">Тени для создания визуальной иерархии</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="grid md:grid-cols-5 gap-6">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className="text-center">
                <div 
                  className="h-24 bg-card rounded-lg mb-3 flex items-center justify-center"
                  style={{ 
                    boxShadow: `var(--elevation-${level})`,
                    border: level === 0 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <span className="text-2xl font-bold text-muted-foreground">{level}</span>
                </div>
                <p className="text-sm font-medium text-foreground">Elevation {level}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}