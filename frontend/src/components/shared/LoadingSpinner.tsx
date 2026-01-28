import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary', className)} aria-hidden="true" />
      <span className="sr-only">Загрузка...</span>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 w-full bg-muted rounded-lg" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-4 w-1/2 bg-muted rounded" />
    </div>
  );
}
