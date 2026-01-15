import * as React from "react";
import { AlertCircle, Phone } from "lucide-react";
import { cn } from "../ui/utils";

interface CrisisBannerProps extends React.ComponentProps<"div"> {
  title?: string;
  phone?: string;
  message?: string;
  className?: string;
}

export function CrisisBanner({
  title = "Нужна немедленная помощь?",
  phone = "8-800-2000-122",
  message = "Если вы находитесь в кризисной ситуации, пожалуйста, обратитесь за помощью.",
  className,
  ...props
}: CrisisBannerProps) {
  return (
    <div
      className={cn(
        "bg-destructive text-destructive-foreground p-6 rounded-xl flex flex-col md:flex-row items-center gap-6",
        className
      )}
      {...props}
    >
      <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="opacity-90">{message}</p>
      </div>
      <a
        href={`tel:${phone.replace(/\D/g, "")}`}
        className="flex items-center gap-2 bg-white text-destructive px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
      >
        <Phone className="w-5 h-5" />
        {phone}
      </a>
    </div>
  );
}
