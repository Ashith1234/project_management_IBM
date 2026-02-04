import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

const alertVariants = {
    default: "bg-slate-50 text-slate-900 border-slate-200",
    destructive: "border-red-500/50 text-red-600 bg-red-50",
    success: "border-emerald-500/50 text-emerald-600 bg-emerald-50",
    warning: "border-amber-500/50 text-amber-600 bg-amber-50",
    info: "border-blue-500/50 text-blue-600 bg-blue-50",
}

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(
            "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
            alertVariants[variant],
            className
        )}
        {...props}
    />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
