import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ defaultValue, children, className }) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    // Context pattern simplified for brevity since we aren't using a large state lib
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
    });

    return <div className={cn("w-full", className)}>{childrenWithProps}</div>
}

const TabsList = ({ activeTab, setActiveTab, children, className }) => {
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                isActive: activeTab === child.props.value,
                onClick: () => setActiveTab(child.props.value)
            });
        }
        return child;
    });

    return (
        <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)}>
            {childrenWithProps}
        </div>
    )
}

const TabsTrigger = ({ isActive, value, onClick, children, className }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-slate-950 shadow-sm" : "hover:bg-gray-200/50",
                className
            )}
        >
            {children}
        </button>
    )
}

const TabsContent = ({ activeTab, value, children, className }) => {
    if (activeTab !== value) return null;
    return (
        <div className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)}>
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
