import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  CheckCircle2, Eye, Keyboard, MousePointer, Smartphone, 
  AlertCircle, Info, Shield, Focus, Type, Contrast 
} from 'lucide-react';

export function A11yNotes() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accessibility Notes</h1>
            <p className="text-muted-foreground">WCAG 2.2 Level AA Compliance</p>
          </div>
        </div>
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Обязательное требование</AlertTitle>
          <AlertDescription>
            Все компоненты дизайн-системы соответствуют стандартам доступности WCAG 2.2 уровня AA.
            Это обеспечивает использование продукта людьми с различными особенностями восприятия.
          </AlertDescription>
        </Alert>
      </div>

      {/* Color Contrast */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Contrast className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Контрастность цветов</h2>
            <p className="text-sm text-muted-foreground">
              Минимальные требования: 4.5:1 для обычного текста, 3:1 для крупного текста и UI элементов
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Текстовый контраст
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Обычный текст (16px):</p>
                <div className="space-y-2">
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-foreground">Основной текст на фоне (≥4.5:1) ✓</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground">Вторичный текст (≥4.5:1) ✓</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">Крупный текст (≥18px или ≥14px bold):</p>
                <div className="p-3 bg-primary rounded-lg">
                  <p className="text-xl text-primary-foreground">Белый текст на primary (≥3:1) ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Контраст UI элементов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Интерактивные элементы:</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button>Primary (≥3:1) ✓</Button>
                    <Button variant="outline">Outline (≥3:1) ✓</Button>
                  </div>
                  <Input placeholder="Поле ввода с контрастной границей (≥3:1) ✓" />
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Важно</AlertTitle>
                <AlertDescription className="text-sm">
                  Все границы, иконки и графические элементы интерфейса имеют контраст не менее 3:1
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Focus States */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Focus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Фокус-состояния</h2>
            <p className="text-sm text-muted-foreground">
              Заметные индикаторы фокуса для навигации с клавиатуры
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Правила для фокус-индикаторов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  Спецификация
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Толщина: 2px (var(--focus-ring-width))</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Отступ: 2px (var(--focus-ring-offset))</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Цвет: var(--focus) с контрастом ≥3:1</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Применяется ко всем интерактивным элементам</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Примеры</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Нажмите Tab для фокуса:</p>
                    <Button>Кнопка с фокусом</Button>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Все интерактивные элементы:</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Кнопка</Button>
                      <a href="#" className="px-3 py-2 text-sm rounded-md border border-border hover:bg-muted">Ссылка</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="border-info/50 bg-info/5">
              <Info className="h-4 w-4 text-info" />
              <AlertTitle>Автоматическое применение</AlertTitle>
              <AlertDescription className="text-sm">
                Фокус-индикаторы применяются автоматически через CSS :focus-visible псевдокласс.
                Стили определены в theme.css и применяются ко всем элементам.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Touch Targets */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Кликабельные зоны</h2>
            <p className="text-sm text-muted-foreground">
              Минимальный размер для сенсорных устройств — 44×44px (WCAG 2.2 Level AA)
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Требования к размерам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="p-4 bg-success/10 rounded-lg mb-3 text-center">
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-success/20 rounded-lg border-2 border-success border-dashed">
                    <MousePointer className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-xs text-success mt-2 font-medium">44×44px минимум</p>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Mobile (≤768px)</h4>
                <p className="text-sm text-muted-foreground">
                  Все кнопки, ссылки и интерактивные элементы имеют минимальный размер 44×44px
                </p>
              </div>

              <div>
                <div className="p-4 bg-primary/10 rounded-lg mb-3 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg border-2 border-primary border-dashed">
                    <MousePointer className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-primary mt-2 font-medium">Адаптивно</p>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Desktop (≥768px)</h4>
                <p className="text-sm text-muted-foreground">
                  На десктопе размеры могут быть меньше, но остаются удобными для клика мышью
                </p>
              </div>

              <div>
                <div className="p-4 bg-warning/10 rounded-lg mb-3 text-center">
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-warning/20 rounded-lg border-2 border-warning border-dashed">
                    <span className="text-lg">8px</span>
                  </div>
                  <p className="text-xs text-warning mt-2 font-medium">Отступы</p>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Spacing</h4>
                <p className="text-sm text-muted-foreground">
                  Минимум 8px между соседними интерактивными элементами
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-3">Примеры корректных размеров:</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small (44×44 на mobile)</Button>
                <Button>Default (44+ на mobile)</Button>
                <Button size="lg">Large (56+ на mobile)</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Typography & Readability */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Читабельность текста</h2>
            <p className="text-sm text-muted-foreground">
              Правила для комфортного чтения
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Размеры шрифтов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Основной текст: 16px (100% base size) ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Минимальный размер на mobile: 14px ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Высота строки (line-height): 1.5–1.75 для body ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Максимальная ширина текстового блока: 75ch ✓</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Семантическая разметка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Правильные HTML-теги (h1-h6, p, ul, ol) ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>ARIA-атрибуты для интерактивных элементов ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Alt-тексты для всех изображений ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Labels для всех полей ввода ✓</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Error States & Feedback */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Состояния ошибок и обратная связь</h2>
          <p className="text-sm text-muted-foreground">
            Понятные и доступные сообщения об ошибках
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Правила отображения ошибок</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">✓ Правильно</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input 
                      type="email" 
                      placeholder="example@email.com"
                      className="border-danger focus:ring-danger"
                      aria-invalid="true"
                      aria-describedby="email-error"
                    />
                    <p id="email-error" className="text-sm text-danger flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Введите корректный email адрес
                    </p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                    <li>• Цветовой индикатор + иконка + текст</li>
                    <li>• aria-invalid и aria-describedby</li>
                    <li>• Конкретное описание проблемы</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">✗ Неправильно</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input 
                      type="email" 
                      placeholder="example@email.com"
                      className="border-danger"
                    />
                    <p className="text-xs text-danger">Ошибка</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                    <li>• Только цвет (не видно для дальтоников)</li>
                    <li>• Нет ARIA-атрибутов</li>
                    <li>• Неинформативное сообщение</li>
                  </ul>
                </div>
              </div>
            </div>

            <Alert className="border-success/50 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle>Ключевые принципы</AlertTitle>
              <AlertDescription className="text-sm">
                Информация не должна передаваться только цветом. Используйте комбинацию: 
                цвет + иконка + текст + ARIA-атрибуты для полной доступности.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Quick Reference */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Краткая справка</h2>
          <p className="text-sm text-muted-foreground">
            Основные требования WCAG 2.2 AA для быстрой проверки
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Визуальное
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>✓ Контраст текста ≥4.5:1</li>
                <li>✓ Контраст UI ≥3:1</li>
                <li>✓ Не только цвет</li>
                <li>✓ Масштабирование до 200%</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" />
                Клавиатура
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>✓ Все функции с клавиатуры</li>
                <li>✓ Видимый фокус (2px)</li>
                <li>✓ Логичный порядок табов</li>
                <li>✓ Без ловушек фокуса</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Сенсорный ввод
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>✓ Минимум 44×44px</li>
                <li>✓ Отступы между элементами</li>
                <li>✓ Жесты не обязательны</li>
                <li>✓ Orientation support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="pb-8">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Дополнительные ресурсы</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground mb-2">Стандарты и документация:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• WCAG 2.2 Guidelines (W3C)</li>
                  <li>• ARIA Authoring Practices Guide</li>
                  <li>• WebAIM Contrast Checker</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Инструменты тестирования:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• axe DevTools (browser extension)</li>
                  <li>• WAVE Web Accessibility Tool</li>
                  <li>• Screen readers (NVDA, JAWS, VoiceOver)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
