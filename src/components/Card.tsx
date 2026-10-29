"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const variants = {
      default: "bg-white border border-slate-200",
      outlined: "bg-white border-2 border-slate-300",
      elevated: "bg-white shadow-lg border-none",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`px-5 py-4 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  ),
);

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  ),
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  ),
);

CardFooter.displayName = "CardFooter";