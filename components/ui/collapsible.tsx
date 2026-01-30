"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    className?: string
    children?: React.ReactNode
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
    ({ open, onOpenChange, disabled, className, children, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(open || false)

        React.useEffect(() => {
            if (open !== undefined) {
                setIsOpen(open)
            }
        }, [open])

        const handleOpenChange = (newOpen: boolean) => {
            if (disabled) return
            if (onOpenChange) {
                onOpenChange(newOpen)
            } else {
                setIsOpen(newOpen)
            }
        }

        return (
            <div
                ref={ref}
                data-state={isOpen ? "open" : "closed"}
                className={className}
                {...props}
            >
                <CollapsibleContext.Provider value={{ isOpen, onOpenChange: handleOpenChange, disabled }}>
                    {children}
                </CollapsibleContext.Provider>
            </div>
        )
    }
)
Collapsible.displayName = "Collapsible"

interface CollapsibleContextValue {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    disabled?: boolean
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined)

const useCollapsible = () => {
    const context = React.useContext(CollapsibleContext)
    if (!context) {
        throw new Error("useCollapsible must be used within a Collapsible")
    }
    return context
}

const CollapsibleTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, className, asChild, onClick, ...props }, ref) => {
    const { isOpen, onOpenChange, disabled } = useCollapsible()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        onOpenChange(!isOpen)
    }

    if (asChild) {
        return (
            <React.Fragment>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            ref,
                            "data-state": isOpen ? "open" : "closed",
                            "data-disabled": disabled ? "" : undefined,
                            onClick: handleClick,
                            ...props,
                        })
                    }
                    return child
                })}
            </React.Fragment>
        )
    }

    return (
        <button
            ref={ref}
            type="button"
            onClick={handleClick}
            data-state={isOpen ? "open" : "closed"}
            data-disabled={disabled ? "" : undefined}
            className={className}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
    const { isOpen } = useCollapsible()

    return (
        <div
            ref={ref}
            data-state={isOpen ? "open" : "closed"}
            className={cn(
                "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
                className
            )}
            style={{
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? 'visible' : 'hidden'
            }}
            {...props}
        >
            {children}
        </div>
    )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
