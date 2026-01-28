'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentModuleTileProps {
  title: string;
  description: string;
  duration: string;
  progress?: number;
  status?: 'locked' | 'available' | 'in-progress' | 'completed';
  category?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export function ContentModuleTile({
  title,
  description,
  duration,
  progress = 0,
  status = 'available',
  category,
  imageUrl,
  onClick,
}: ContentModuleTileProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />;
      default:
        return <PlayCircle className="w-5 h-5 text-primary" aria-hidden="true" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-600 dark:bg-green-500">
            Пройдено
          </Badge>
        );
      case 'locked':
        return <Badge variant="secondary">Заблокировано</Badge>;
      case 'in-progress':
        return <Badge variant="default">В процессе</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        status === 'locked' ? 'opacity-60' : ''
      }`}
    >
      {/* Image Header */}
      {imageUrl && (
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3">{getStatusBadge()}</div>
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* Category */}
        {category && (
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {category}
          </span>
        )}

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{duration}</span>
          </div>
          {status === 'in-progress' && progress > 0 && (
            <span className="text-primary font-medium">{progress}% пройдено</span>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'in-progress' && progress > 0 && (
          <Progress value={progress} className="h-2" />
        )}

        {/* CTA Button */}
        <Button
          className="w-full"
          disabled={status === 'locked'}
          variant={status === 'completed' ? 'outline' : 'default'}
          onClick={onClick}
        >
          <span className="mr-2">{getStatusIcon()}</span>
          {status === 'locked' && 'Недоступно'}
          {status === 'completed' && 'Пройти снова'}
          {status === 'in-progress' && 'Продолжить'}
          {status === 'available' && 'Начать'}
        </Button>
      </CardContent>
    </Card>
  );
}
