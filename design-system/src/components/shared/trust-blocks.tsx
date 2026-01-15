import { Card, CardContent } from '../ui/card';
import { Shield, Award, Heart, Users, type LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';
import type { ReactElement } from 'react';

interface TrustItem {
  id: string;
  title: string;
  description: string;
  icon?: string | LucideIcon;
}

interface TrustBlocksProps {
  viewport: 'mobile' | 'desktop';
  compact?: boolean;
  className?: string;
  title?: string;
  items?: TrustItem[];
}

const trustItems: TrustItem[] = [
  {
    id: 'licensed',
    title: 'Лицензированный специалист',
    description: 'Подтвержденная квалификация и опыт практики.',
    icon: Shield,
  },
  {
    id: 'evidence',
    title: 'Доказательные методики',
    description: 'КПТ, ACT и другие подходы с доказанной эффективностью.',
    icon: Award,
  },
  {
    id: 'care',
    title: 'Бережный подход',
    description: 'Поддержка, эмпатия и внимание к вашей истории.',
    icon: Heart,
  },
  {
    id: 'community',
    title: 'Сообщество поддержки',
    description: 'Безопасное пространство для роста и восстановления.',
    icon: Users,
  },
];

export function TrustBlocks({
  viewport,
  compact = false,
  className,
  title,
  items,
}: TrustBlocksProps): ReactElement {
  const displayItems = items || trustItems;
  
  if (compact) {
    return (
      <div className={cn(`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`, className)}>
        {displayItems.map((item) => (
          <div key={item.id} className="text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              {typeof item.icon === 'string' ? (
                <span className="text-2xl">{item.icon}</span>
              ) : item.icon ? (
                <item.icon className="w-6 h-6" />
              ) : null}
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
    <div className={cn("space-y-12", className)}>
      {title && (
        <h2 className="text-3xl font-bold text-center">{title}</h2>
      )}
      <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {displayItems.map((item) => (
          <Card key={item.id} className="border-2">
            <CardContent className="p-5 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                {typeof item.icon === 'string' ? (
                  <span className="text-3xl">{item.icon}</span>
                ) : item.icon ? (
                  <item.icon className="w-7 h-7" />
                ) : null}
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
    </div>
  );
}
