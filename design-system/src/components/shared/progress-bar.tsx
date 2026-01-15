import * as React from "react";
import { Progress } from "../ui/progress";
import { cn } from "../ui/utils";

interface ProgressBarProps extends React.ComponentProps<"div"> {
  value: number;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
  ...props
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}
