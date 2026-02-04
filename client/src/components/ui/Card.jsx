import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Card = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={twMerge("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={twMerge("font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
