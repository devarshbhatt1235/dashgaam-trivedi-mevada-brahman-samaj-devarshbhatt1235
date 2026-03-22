import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Beautiful custom UI elements that override shadcn defaults for exceptional look
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "destructive" }>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "saffron-gradient hover:shadow-orange-500/40 hover:-translate-y-0.5",
      outline: "border-2 border-primary text-primary hover:bg-primary/5",
      ghost: "text-foreground hover:bg-orange-100",
      destructive: "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:-translate-y-0.5"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm transition-all duration-300",
          "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm transition-all duration-300",
          "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-semibold leading-none text-secondary", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("glass-panel rounded-2xl p-6", className)} 
    {...props}
  >
    {children}
  </motion.div>
);
