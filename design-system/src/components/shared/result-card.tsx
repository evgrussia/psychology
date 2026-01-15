import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { cn } from "../ui/utils";

interface ResultStep {
  title: string;
  items: string[];
}

interface ResultCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  description: string;
  score?: number | string;
  recommendation?: string;
  steps?: ResultStep[];
  icon?: React.ReactNode;
  level?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

export function ResultCard({
  title,
  description,
  score,
  recommendation,
  steps,
  icon,
  level,
  className,
  children,
  ...props
}: ResultCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className={cn(
        "bg-muted/50",
        level === 'high' && "bg-destructive/10"
      )}>
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            {score !== undefined && (
              <CardDescription className="text-lg font-bold text-primary mt-1">
                Результат: {score}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-foreground leading-relaxed">
          {description}
        </p>
        
        {steps && steps.length > 0 && (
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-3">{step.title}</h4>
                <ul className="space-y-2">
                  {step.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {recommendation && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-semibold text-primary mb-1 text-sm uppercase tracking-wider">
              Рекомендация
            </h4>
            <p className="text-sm text-muted-foreground">
              {recommendation}
            </p>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
