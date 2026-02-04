import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// A simplified DatePicker. 
// Note: For industry grade, typically we'd use a library like 'react-day-picker' inside a popover.
// Since I cannot install bulky new deps easily without potential conflits, I'll use a native date input styled to look custom, 
// or basic HTML5 which effectively is robust across browsers now.

const DatePicker = ({ date, setDate, className }) => {
    // Handling date as string "YYYY-MM-DD" for HTML input compatibility if strictly simple, 
    // but user requested "industry grade" so we should try to mask the native picker.

    // We will use a hybrid approach: A nice trigger that opens the hidden native picker.
    const inputRef = React.useRef(null);

    const handleDivClick = () => {
        if (inputRef.current) inputRef.current.showPicker();
    }

    return (
        <div className={cn("relative", className)}>
            <div
                onClick={handleDivClick}
                className={cn(
                    "flex h-10 w-full items-center justify-start text-left font-normal rounded-md border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:bg-slate-50",
                    !date && "text-slate-500"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(new Date(date), "PPP") : <span>Pick a date</span>}
            </div>
            <input
                ref={inputRef}
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                style={{ visibility: 'hidden' }} // We only trigger it programmatically or via label if needed
                onChange={(e) => setDate(e.target.value)}
                value={date ? new Date(date).toISOString().split('T')[0] : ''}
            />
            {/* Note: showPicker() is supported in modern browsers. 
                 Fallback: user clicks the invisible input on top if we removed pointer-events-none, 
                 but that messes up the custom UI. 
                 For this environment, proper library like 'react-day-picker' is best but let's stick to this wrapper for zero-dep complexity.
             */}
        </div>
    )
}

export { DatePicker }
