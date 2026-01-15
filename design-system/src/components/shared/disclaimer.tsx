import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { cn } from "../ui/utils";

interface DisclaimerProps
  extends Omit<React.ComponentProps<typeof Alert>, "variant"> {
  title?: string;
  variant?: "default" | "destructive" | "info";
  showEmergencyLink?: boolean;
  children?: React.ReactNode;
}

export function Disclaimer({
  title = "Важная информация",
  variant = "info",
  showEmergencyLink = false,
  className,
  children,
  ...props
}: DisclaimerProps) {
  const Icon = variant === "destructive" ? AlertTriangle : Info;

  return (
    <Alert 
      variant={variant === "info" ? "default" : variant} 
      className={cn(variant === "info" && "bg-muted border-none", className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-relaxed">
        {children}
        {showEmergencyLink && (
          <div className="mt-3">
            <a 
              href="/emergency" 
              className="font-semibold underline hover:opacity-80 transition-opacity"
            >
              Экстренная помощь
            </a>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
