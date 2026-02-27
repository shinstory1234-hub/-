import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700", className)} {...props} />;
}
