import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200/70 dark:bg-zinc-800/50", className)}
      {...props}
    />
  );
}

export { Skeleton };
