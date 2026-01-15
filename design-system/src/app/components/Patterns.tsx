import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Home, User, Calendar, Settings, Menu, ChevronDown, 
  AlertCircle, CheckCircle2, Info, XCircle, FileX, Loader2,
  Search, Bell
} from 'lucide-react';

export function Patterns() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Patterns</h1>
        <p className="text-muted-foreground">
          Готовые паттерны интерфейса: навигация, формы, состояния, модальные окна
        </p>
      </div>

      {/* Navigation Patterns */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Навигация</h2>
          <p className="text-sm text-muted-foreground">
            Паттерны навигации для mobile и desktop
          </p>
        </div>

        <div className="space-y-6">
          {/* Bottom Navigation (Mobile) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bottom Navigation (Mobile)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
                  <div className="h-64 bg-muted/30 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Контент приложения</p>
                  </div>
                  <div className="flex items-center justify-around p-4 border-t border-border bg-background">
                    {[
                      { icon: Home, label: 'Главная', active: true },
                      { icon: Calendar, label: 'Расписание', active: false },
                      { icon: User, label: 'Профиль', active: false },
                      { icon: Settings, label: 'Настройки', active: false },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-muted min-w-[44px] min-h-[44px]"
                        >
                          <Icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Bar (Mobile) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Bar (Mobile)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto bg-card border-2 border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                  <button className="p-2 hover:bg-muted rounded-lg min-w-[44px] min-h-[44px]">
                    <Menu className="w-5 h-5 text-foreground" />
                  </button>
                  <h3 className="font-semibold text-foreground">Заголовок</h3>
                  <button className="p-2 hover:bg-muted rounded-lg relative min-w-[44px] min-h-[44px]">
                    <Bell className="w-5 h-5 text-foreground" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                  </button>
                </div>
                <div className="h-48 bg-muted/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Контент</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side Navigation (Desktop) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Side Navigation (Desktop/Admin)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0 border-2 border-border rounded-xl overflow-hidden">
                <div className="w-64 bg-background border-r border-border p-4 space-y-2">
                  <div className="mb-6">
                    <h4 className="font-bold text-foreground">Logo</h4>
                    <p className="text-xs text-muted-foreground">Подзаголовок</p>
                  </div>
                  {[
                    { icon: Home, label: 'Главная', active: true },
                    { icon: Calendar, label: 'Календарь', active: false },
                    { icon: User, label: 'Пользователи', active: false },
                    { icon: Settings, label: 'Настройки', active: false },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          item.active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 bg-muted/30 p-6 min-h-[300px]">
                  <p className="text-sm text-muted-foreground">Основной контент</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Patterns */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Формы</h2>
          <p className="text-sm text-muted-foreground">
            Паттерны для форм с валидацией и обратной связью
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Valid Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Форма с валидацией</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" placeholder="Введите ваше имя" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-valid">Email</Label>
                <Input
                  id="email-valid"
                  type="email"
                  placeholder="example@email.com"
                  className="border-success focus:ring-success"
                />
                <p className="text-sm text-success flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Email корректен
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-error">Пароль</Label>
                <Input
                  id="password-error"
                  type="password"
                  placeholder="••••••••"
                  className="border-danger focus:ring-danger"
                  aria-invalid="true"
                  aria-describedby="password-error-msg"
                />
                <p id="password-error-msg" className="text-sm text-danger flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Пароль должен быть не менее 8 символов
                </p>
              </div>
              <Button className="w-full">Отправить</Button>
            </CardContent>
          </Card>

          {/* Multi-step Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Многошаговая форма</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Шаг 2 из 3</span>
                  <span className="text-primary font-medium">66%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '66%' }} />
                </div>
              </div>
              
              {/* Steps indicator */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Личные данные</span>
                </div>
                <div className="flex-1 h-0.5 bg-primary mx-2" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="text-xs text-foreground font-medium mt-1">Контакты</span>
                </div>
                <div className="flex-1 h-0.5 bg-muted mx-2" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Подтверждение</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>Телефон</Label>
                <Input placeholder="+7 (___) ___-__-__" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">Назад</Button>
                <Button className="flex-1">Далее</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Empty/Error/Loading States */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Состояния: Empty / Error / Loading</h2>
          <p className="text-sm text-muted-foreground">
            Стандартные состояния для различных сценариев
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Empty State */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FileX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Пока нет данных</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Начните добавлять записи, и они появятся здесь
              </p>
              <Button variant="outline">Создать запись</Button>
            </CardContent>
          </Card>

          {/* Error State */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ошибка загрузки</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Не удалось загрузить данные. Проверьте подключение к интернету
              </p>
              <Button variant="outline">Повторить попытку</Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          <Card>
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
              <div className="text-center pt-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Загрузка...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback Messages */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Сообщения обратной связи</h2>
          <p className="text-sm text-muted-foreground">
            Alert компоненты для различных типов сообщений
          </p>
        </div>

        <div className="space-y-4">
          <Alert className="border-success/50 bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Успешно!</AlertTitle>
            <AlertDescription>
              Ваши изменения были сохранены. Данные синхронизированы.
            </AlertDescription>
          </Alert>

          <Alert className="border-info/50 bg-info/5">
            <Info className="h-4 w-4 text-info" />
            <AlertTitle className="text-info">Информация</AlertTitle>
            <AlertDescription>
              Обновление доступно. Рекомендуем обновить приложение до последней версии.
            </AlertDescription>
          </Alert>

          <Alert className="border-warning/50 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Внимание</AlertTitle>
            <AlertDescription>
              Ваша подписка истекает через 3 дня. Продлите её, чтобы сохранить доступ ко всем функциям.
            </AlertDescription>
          </Alert>

          <Alert className="border-danger/50 bg-danger/5">
            <XCircle className="h-4 w-4 text-danger" />
            <AlertTitle className="text-danger">Ошибка</AlertTitle>
            <AlertDescription>
              Не удалось выполнить операцию. Пожалуйста, попробуйте позже или обратитесь в поддержку.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Search Pattern */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Поиск</h2>
          <p className="text-sm text-muted-foreground">
            Паттерн поиска с фильтрами
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, автору или содержимому..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <ChevronDown className="w-4 h-4 mr-2" />
                Фильтры
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                Все
              </button>
              <button className="px-3 py-1 rounded-full bg-muted text-foreground text-sm hover:bg-muted/80">
                Статьи
              </button>
              <button className="px-3 py-1 rounded-full bg-muted text-foreground text-sm hover:bg-muted/80">
                Видео
              </button>
              <button className="px-3 py-1 rounded-full bg-muted text-foreground text-sm hover:bg-muted/80">
                Курсы
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabs Pattern */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Вкладки (Tabs)</h2>
          <p className="text-sm text-muted-foreground">
            Организация контента по категориям
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="details">Детали</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <h3 className="font-semibold text-foreground">Обзор</h3>
                <p className="text-sm text-muted-foreground">
                  Общая информация и статистика по выбранному элементу.
                </p>
              </TabsContent>
              <TabsContent value="details" className="space-y-4 mt-4">
                <h3 className="font-semibold text-foreground">Подробности</h3>
                <p className="text-sm text-muted-foreground">
                  Детальная информация, метаданные и дополнительные сведения.
                </p>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4 mt-4">
                <h3 className="font-semibold text-foreground">Настройки</h3>
                <p className="text-sm text-muted-foreground">
                  Параметры и конфигурация элемента.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
