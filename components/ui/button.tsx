import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground shadow-soft hover:brightness-105",
        outline: "border border-border bg-surface text-foreground hover:bg-surface-muted",
        ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        danger: "bg-danger text-white hover:brightness-95"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-full px-3 text-xs",
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
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
