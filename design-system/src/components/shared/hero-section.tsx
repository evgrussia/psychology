import * as React from "react";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

interface HeroSectionProps extends React.ComponentProps<"section"> {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: React.ReactNode;
  secondaryCTA?: React.ReactNode;
  badge?: string;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  className,
  ...props
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 px-8 py-12 md:py-24 text-center",
        className
      )}
      {...props}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {badge && <Badge className="mb-2">{badge}</Badge>}
        {subtitle && (
          <p className="text-sm font-semibold tracking-wider uppercase text-primary mb-2">
            {subtitle}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {(primaryCTA || secondaryCTA) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {primaryCTA}
            {secondaryCTA}
          </div>
        )}
      </div>
    </section>
  );
}
