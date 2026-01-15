import * as React from "react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";

interface CTABlockProps extends React.ComponentProps<typeof Card> {
  title: string;
  description?: string;
  primaryCTA?: React.ReactNode;
  secondaryCTA?: React.ReactNode;
  className?: string;
}

export function CTABlock({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  className,
  ...props
}: CTABlockProps) {
  return (
    <Card
      className={cn(
        "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20",
        className
      )}
      {...props}
    >
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {primaryCTA}
              {secondaryCTA}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
