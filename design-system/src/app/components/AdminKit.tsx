import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, 
  CheckCircle2, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  Users, FileText, Calendar, TrendingUp, BarChart3, UserCheck
} from 'lucide-react';

export function AdminKit() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === mockData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockData.map(item => item.id));
    }
  };

  const mockData = [
    { 
      id: '1', 
      title: 'Медитация помогла мне...', 
      author: 'Анна И.', 
      date: '12.01.2026',
      status: 'pending',
      category: 'Отзыв'
    },
    { 
      id: '2', 
      title: 'Вопрос о дыхательных практиках', 
      author: 'Михаил П.', 
      date: '12.01.2026',
      status: 'approved',
      category: 'Вопрос'
    },
    { 
      id: '3', 
      title: 'Спасибо за курс!', 
      author: 'Елена С.', 
      date: '11.01.2026',
      status: 'approved',
      category: 'Отзыв'
    },
    { 
      id: '4', 
      title: 'Неприемлемый контент...', 
      author: 'User456', 
      date: '11.01.2026',
      status: 'rejected',
      category: 'Пост'
    },
    { 
      id: '5', 
      title: 'Как справиться со стрессом?', 
      author: 'Дмитрий К.', 
      date: '10.01.2026',
      status: 'pending',
      category: 'Вопрос'
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'На проверке', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Одобрено', variant: 'default' as const, icon: CheckCircle2, color: '#6B9B7E' },
      rejected: { label: 'Отклонено', variant: 'destructive' as const, icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge 
        variant={config.variant}
        className={config.color ? `bg-[${config.color}] hover:bg-[${config.color}]/90` : ''}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Kit</h1>
        <p className="text-muted-foreground">
          Компоненты для административной панели (desktop-first)
        </p>
      </div>

      {/* Dashboard Cards */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Dashboard Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Активные пользователи</p>
              <p className="text-3xl font-bold text-foreground mb-1">2,845</p>
              <p className="text-xs text-green-600">+12.5% от прошлой недели</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <Clock className="w-5 h-5 text-[#D4A574]" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">На модерации</p>
              <p className="text-3xl font-bold text-foreground mb-1">47</p>
              <p className="text-xs text-muted-foreground">Требуют проверки</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#6B9B7E]/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#6B9B7E]" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Записи на сегодня</p>
              <p className="text-3xl font-bold text-foreground mb-1">18</p>
              <p className="text-xs text-green-600">+3 от вчера</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Завершено сессий</p>
              <p className="text-3xl font-bold text-foreground mb-1">1,234</p>
              <p className="text-xs text-muted-foreground">В этом месяце</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filters Bar */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Filters & Search</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Поиск по содержимому..." 
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="pending">На проверке</SelectItem>
                    <SelectItem value="approved">Одобрено</SelectItem>
                    <SelectItem value="rejected">Отклонено</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="review">Отзывы</SelectItem>
                    <SelectItem value="question">Вопросы</SelectItem>
                    <SelectItem value="post">Посты</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Table */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Content Moderation Table</h2>
          <p className="text-sm text-muted-foreground">
            Таблица с sortable headers, row states, bulk actions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>UGC на модерации</CardTitle>
                <CardDescription>Управление пользовательским контентом</CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Одобрить ({selectedItems.length})
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      Отклонить
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === mockData.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Содержимое</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={selectedItems.includes(item.id) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {item.title}
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Показано <strong>1-5</strong> из <strong>47</strong> записей
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
                  <span className="flex items-center px-2">...</span>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">10</Button>
                </div>
                <Button variant="outline" size="sm">
                  Далее
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Status Pills & Labels */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Status Pills & Labels</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Статусы контента</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#6B9B7E] hover:bg-[#6B9B7E]/90">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Опубликовано
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Черновик
                  </Badge>
                  <Badge className="bg-[#D4A574] hover:bg-[#D4A574]/90 text-[#2D2817]">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Требует проверки
                  </Badge>
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Архив
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-3">Статусы пользователей</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#6B9B7E] hover:bg-[#6B9B7E]/90">Активен</Badge>
                  <Badge variant="secondary">Неактивен</Badge>
                  <Badge className="bg-[#D4A574] hover:bg-[#D4A574]/90 text-[#2D2817]">Ожидает подтверждения</Badge>
                  <Badge variant="destructive">Заблокирован</Badge>
                  <Badge variant="outline">Premium</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-3">Приоритеты</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="destructive">Высокий</Badge>
                  <Badge className="bg-[#D4A574] hover:bg-[#D4A574]/90 text-[#2D2817]">Средний</Badge>
                  <Badge variant="secondary">Низкий</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Side Panel Preview */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Side Panel / Drawer</h2>
          <p className="text-sm text-muted-foreground">
            Панель для детальной информации и редактирования
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Список элементов</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Основной контент с возможностью открытия side panel для детальной информации
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Детали записи</CardTitle>
                  <CardDescription>ID: #12345</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Автор</p>
                <p className="text-sm text-muted-foreground">Анна Иванова</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Дата создания</p>
                <p className="text-sm text-muted-foreground">12 января 2026</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Статус</p>
                {getStatusBadge('pending')}
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <Button size="sm" className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Одобрить
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <XCircle className="w-4 h-4 mr-2" />
                  Отклонить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
