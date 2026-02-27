import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500",
        outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
        ghost: "text-zinc-700 hover:bg-zinc-100"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 rounded-lg",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} disabled={props.disabled || loading} {...props}>
      {loading ? "처리 중..." : children}
    </button>
  );
}
