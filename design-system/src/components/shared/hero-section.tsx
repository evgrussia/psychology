import * as React from "react";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

export interface HeroSectionProps extends React.ComponentProps<"section"> {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: React.ReactNode;
  secondaryCTA?: React.ReactNode;
  badge?: string;
  image?: string;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  image,
  className,
  ...props
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 px-8 py-12 md:py-24 text-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="max-w-3xl flex-1 space-y-6 text-center md:text-left">
          {badge && <Badge className="mb-2">{badge}</Badge>}
          {subtitle && (
            <p className="text-sm font-semibold tracking-wider uppercase text-primary mb-2">
              {subtitle}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
              {description}
            </p>
          )}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-4">
              {primaryCTA}
              {secondaryCTA}
            </div>
          )}
        </div>
        {image && (
          <div className="flex-1 w-full max-w-[500px] aspect-[16/9] relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
