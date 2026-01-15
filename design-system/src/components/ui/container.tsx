import * as React from "react";
import { cn } from "./utils";

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full max-w-(--container-max-width) px-(--container-padding)",
        className
      )}
      {...props}
    />
  );
}

export { Container };
