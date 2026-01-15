import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle2, Info, Loader2, Heart, Star, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

export function Components() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <Toaster />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Components</h1>
        <p className="text-muted-foreground">
          Библиотека компонентов с вариантами, состояниями и автолейаутами
        </p>
      </div>

      {/* Buttons */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Buttons</h2>
          <p className="text-sm text-muted-foreground">
            Variants: primary, secondary, outline, ghost, destructive • Sizes: sm, md (default), lg
          </p>
        </div>

        <div className="space-y-6">
          {/* Variants */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Варианты</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Размеры</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* States */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Состояния</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
              <Button>
                <Heart className="mr-2 h-4 w-4" />
                With Icon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Inputs & Text Fields</h2>
          <p className="text-sm text-muted-foreground">
            States: default, focus, filled, error, disabled
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div>
              <Label htmlFor="input-default">Default Input</Label>
              <Input id="input-default" placeholder="Введите текст..." />
            </div>

            <div>
              <Label htmlFor="input-filled">Filled Input</Label>
              <Input id="input-filled" defaultValue="Заполненное поле" />
            </div>

            <div>
              <Label htmlFor="input-error" className="text-destructive">Error State</Label>
              <Input 
                id="input-error" 
                placeholder="Ошибка валидации" 
                className="border-destructive focus-visible:ring-destructive"
              />
              <p className="text-sm text-destructive mt-1">Это поле обязательно для заполнения</p>
            </div>

            <div>
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input id="input-disabled" placeholder="Недоступно" disabled />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div>
              <Label htmlFor="textarea">Textarea</Label>
              <Textarea id="textarea" placeholder="Многострочный текст..." rows={4} />
            </div>

            <div>
              <Label htmlFor="select">Select</Label>
              <Select>
                <SelectTrigger id="select">
                  <SelectValue placeholder="Выберите опцию..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Опция 1</SelectItem>
                  <SelectItem value="2">Опция 2</SelectItem>
                  <SelectItem value="3">Опция 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Checkboxes & Radios */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Checkboxes, Radios & Switches</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Checkboxes</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="check1" />
                <Label htmlFor="check1">Опция 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="check2" defaultChecked />
                <Label htmlFor="check2">Опция 2 (checked)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="check3" disabled />
                <Label htmlFor="check3" className="text-muted-foreground">Disabled</Label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Radio Buttons</h3>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="radio1" />
                <Label htmlFor="radio1">Опция 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="radio2" />
                <Label htmlFor="radio2">Опция 2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option3" id="radio3" disabled />
                <Label htmlFor="radio3" className="text-muted-foreground">Disabled</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Switches</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="switch1" />
                <Label htmlFor="switch1">Off</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="switch2" defaultChecked />
                <Label htmlFor="switch2">On</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="switch3" disabled />
                <Label htmlFor="switch3" className="text-muted-foreground">Disabled</Label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges & Tags */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Badges & Tags</h2>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-[#6B9B7E] hover:bg-[#6B9B7E]/90">Success</Badge>
            <Badge className="bg-[#D4A574] hover:bg-[#D4A574]/90 text-[#2D2817]">Warning</Badge>
            <Badge className="rounded-full">Pill Badge</Badge>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Cards</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Базовая карточка</CardTitle>
              <CardDescription>Описание карточки</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Контент карточки с различной информацией
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">С иконкой</CardTitle>
                  <CardDescription>Interactive card</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>С градиентом</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Специальный стиль для выделения
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Alerts & Feedback</h2>
        </div>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Информация</AlertTitle>
            <AlertDescription>
              Это информационное сообщение для пользователя
            </AlertDescription>
          </Alert>

          <Alert className="border-[#6B9B7E] bg-[#6B9B7E]/10">
            <CheckCircle2 className="h-4 w-4 text-[#6B9B7E]" />
            <AlertTitle className="text-[#6B9B7E]">Успех</AlertTitle>
            <AlertDescription>
              Операция успешно выполнена
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>
              Произошла ошибка при выполнении операции
            </AlertDescription>
          </Alert>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Toast Notifications</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.success('Успешно сохранено!')}>
                Success Toast
              </Button>
              <Button variant="outline" onClick={() => toast.error('Произошла ошибка')}>
                Error Toast
              </Button>
              <Button variant="secondary" onClick={() => toast('Информация', {
                description: 'Дополнительный текст сообщения'
              })}>
                Info Toast
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs & Segmented Control */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Tabs & Navigation</h2>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <Tabs defaultValue="tab1">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
              <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
              <TabsTrigger value="tab3">Вкладка 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p className="text-muted-foreground">Контент первой вкладки</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p className="text-muted-foreground">Контент второй вкладки</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p className="text-muted-foreground">Контент третьей вкладки</p>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Progress & Loading */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Progress & Loading States</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progress Bar</span>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <Progress value={65} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Complete</span>
                <span className="text-sm text-muted-foreground">100%</span>
              </div>
              <Progress value={100} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Skeleton Loaders</h3>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* List Items */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">List Items</h2>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
          <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Элемент списка с иконкой</p>
              <p className="text-sm text-muted-foreground">Дополнительная информация</p>
            </div>
            <Badge>Новое</Badge>
          </div>

          <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">С trailing meta</p>
              <p className="text-sm text-muted-foreground">15 минут назад</p>
            </div>
            <span className="text-sm text-muted-foreground">12:30</span>
          </div>

          <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Избранный элемент</p>
            </div>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
