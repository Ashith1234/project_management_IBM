import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-lg">
                {children}
            </div>
            <div className="fixed inset-0 -z-10" onClick={onClose} />
        </div>
    )
}

const DialogContent = ({ children, className }) => (
    <div className={cn("relative bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden", className)}>
        {children}
    </div>
)

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
)

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight text-slate-900",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 bg-slate-50/50",
            className
        )}
        {...props}
    />
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
