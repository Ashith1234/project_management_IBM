import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-200',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-200',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500',
    };

    const sizes = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
    };

    return (
        <button
            ref={ref}
            disabled={isLoading}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
