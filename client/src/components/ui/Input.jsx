import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ className, type = 'text', error, label, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={twMerge(
                    "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    error && "border-rose-500 focus:ring-rose-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <span className="text-xs text-rose-500 mt-1 block">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
