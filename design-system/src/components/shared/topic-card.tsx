import * as React from "react";
import { Card, CardContent } from "../ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";

interface TopicCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TopicCard({
  title,
  description,
  href,
  icon,
  onClick,
  className,
  ...props
}: TopicCardProps) {
  const content = (
    <CardContent className="p-6 h-full flex flex-col">
      <div className="flex items-start gap-4 mb-4 flex-1">
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-auto">
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </CardContent>
  );

  const wrapperProps = {
    className: cn("hover:shadow-lg transition-shadow cursor-pointer group", className),
    onClick,
    ...props,
  };

  if (href) {
    return (
      <a href={href} className="block no-underline">
        <Card {...wrapperProps}>{content}</Card>
      </a>
    );
  }

  return <Card {...wrapperProps}>{content}</Card>;
}
