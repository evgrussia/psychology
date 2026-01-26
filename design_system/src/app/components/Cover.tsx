import { Heart, Sparkles, Users, Shield } from 'lucide-react';

export function Cover() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 animate-in fade-in zoom-in duration-500">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Emotional Balance
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">Design System & UI Kit</p>
          <p className="text-sm text-muted-foreground">v1.1.0 • Январь 2026</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Назначение</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Единый дизайн-язык для пользовательской части (mobile-first, Telegram WebApp) 
                  и административной панели (desktop-first) продукта «Эмоциональный баланс».
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Доступность</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Полное соответствие WCAG 2.2 уровня AA: контраст текста и элементов, 
                  заметные фокус-состояния, читабельность, минимальные размеры кликабельных зон 44×44px.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-muted/20 rounded-2xl p-8 border border-border animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Принципы дизайна
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl">🧘</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Спокойствие</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Тёплая палитра, плавные переходы, достаточно «воздуха». 
                Дружелюбный и поддерживающий визуальный язык.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                <span className="text-xl">🤝</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Поддержка</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Понятные паттерны, помощь на каждом шаге, чёткие состояния 
                ошибок и успехов.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">Консистентность</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Единые токены, переиспользуемые компоненты, предсказуемое 
                поведение интерфейса.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center animate-in fade-in duration-700 delay-500">
          <p className="text-sm text-muted-foreground mb-4">
            Система разработана с использованием
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">8pt Grid System</span>
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">Inter Typography</span>
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">Design Tokens</span>
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">Component Variants</span>
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">Light/Dark Modes</span>
            <span className="px-4 py-2 bg-muted rounded-full font-medium hover:bg-muted/80 transition-colors">WCAG 2.2 AA</span>
          </div>
        </div>
      </div>
    </div>
  );
}