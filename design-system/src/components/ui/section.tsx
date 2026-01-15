import * as React from "react";
import { cn } from "./utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn(
        "py-12 md:py-24",
        className
      )}
      {...props}
    />
  );
}

export { Section };
