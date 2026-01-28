'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/ui/utils';

export interface QuizCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimated_time_minutes: number;
  className?: string;
}

export function QuizCard({
  id,
  slug,
  title,
  description,
  estimated_time_minutes,
  className,
}: QuizCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{estimated_time_minutes} мин</span>
          </div>
          <Button asChild>
            <Link href={`/quiz/${slug}`}>Начать</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
