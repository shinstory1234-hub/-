import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}
