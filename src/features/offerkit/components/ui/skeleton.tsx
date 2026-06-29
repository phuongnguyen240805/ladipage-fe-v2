/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { cn } from "@/features/offerkit/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
