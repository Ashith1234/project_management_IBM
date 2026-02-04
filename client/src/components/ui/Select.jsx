import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ value, onChange, options = [], placeholder = "Select...", className }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={cn(!value && "text-slate-500")}>{selectedLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 hover:bg-slate-100 cursor-pointer",
                                    value === option.value && "bg-slate-100"
                                )}
                            >
                                {value === option.value && (
                                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-sm text-slate-500">No options found.</div>
                    )}
                </div>
            )}
        </div>
    )
}

export { Select }
