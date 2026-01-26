import { Card, CardContent } from './ui/card';
import { Shield, Award, Heart, Users } from 'lucide-react';

interface TrustBlocksProps {
  viewport: 'mobile' | 'desktop';
  compact?: boolean;
}

const trustItems = [
  {
    id: '1',
    icon: Shield,
    title: 'Доказательный подход',
    description: 'Методы основаны на КПТ, ACT и других научно подтверждённых техниках'
  },
  {
    id: '2',
    icon: Award,
    title: 'Профессионализм',
    description: 'Сертифицированный психолог с опытом работы более 8 лет'
  },
  {
    id: '3',
    icon: Heart,
    title: 'Безопасность',
    description: 'Конфиденциальность и этика в приоритете на каждом этапе'
  },
  {
    id: '4',
    icon: Users,
    title: '500+ клиентов',
    description: 'Помогли сотням людей вернуть эмоциональный баланс'
  }
];

export function TrustBlocks({ viewport, compact = false }: TrustBlocksProps) {
  if (compact) {
    return (
      <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {trustItems.map((item) => (
          <div key={item.id} className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-1">
              {item.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {trustItems.map((item) => (
        <Card key={item.id} className="border-2">
          <CardContent className="p-5 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-7 h-7" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              {item.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
