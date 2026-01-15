import { cn } from "./utils";
import type { ComponentProps, ReactElement } from "react";

function Skeleton({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
