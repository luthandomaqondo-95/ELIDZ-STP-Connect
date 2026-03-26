"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { EyeOff, Eye, ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// Floating Label Input
// ============================================================================

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
    ({ className, type, label, defaultValue, setShowPassword, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)
        const [isFilled, setIsFilled] = React.useState(
            (value !== undefined) ? (String(value) !== "") : (defaultValue !== undefined) ? String(defaultValue) !== "" : false,
        )
        const inputRef = React.useRef<HTMLInputElement | null>(null)
        const shouldFloatLabel =
            isFocused ||
            isFilled ||
            type === "date" ||
            type === "datetime-local" ||
            type === "month" ||
            type === "time" ||
            type === "week"

        const handleRef = (instance: HTMLInputElement | null) => {
            inputRef.current = instance
            if (typeof ref === "function") {
                ref(instance)
            } else if (ref) {
                ref.current = instance
            }
        }

        const handleLabelClick = () => {
            inputRef.current?.focus()
        }

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true)
            props.onFocus?.(e)
        }

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false)
            props.onBlur?.(e)
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setIsFilled(e.target.value !== "")
            props.onChange?.(e)
        }

        React.useEffect(() => {
            if (value !== undefined) {
                setIsFilled(String(value) !== "")
            }
            if (defaultValue !== undefined) {
                setIsFilled(String(defaultValue) !== "")
            }
        }, [value, defaultValue])

        return (
            <div className="relative">
                <div className="relative">
                    <div className="relative">
                        <input
                            {...props}
                            type={type}
                            className={cn(
                                "flex h-10 w-full rounded-lg border border-input bg-background px-3 pt-2 pb-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                props.error && "border-red-500 focus-visible:ring-red-500",
                                className,
                            )}
                            ref={handleRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={value}
                            defaultValue={defaultValue}
                            placeholder={
                                type === "date" ||
                                type === "datetime-local" ||
                                type === "month" ||
                                type === "time" ||
                                type === "week"
                                    ? ""
                                    : (isFilled ? "" : (isFocused ? (props.placeholder || label) : ""))
                            }
                        />
                        {setShowPassword && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute w-4 h-4 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {(type !== "password") ? <EyeOff /> : <Eye />}
                            </Button>
                        )}
                    </div>
                    <label
                        className={cn(
                            "absolute left-3 pointer-events-none transition-all duration-200 ease-in-out px-1 z-10",
                            shouldFloatLabel
                                ? "text-xs bg-background top-0 -translate-y-1/2"
                                : "text-base text-muted-foreground top-1/2 -translate-y-1/2",
                            isFocused && !props.error && "text-primary",
                            props.error && "text-red-500",
                        )}
                        onClick={handleLabelClick}
                    >
                        {label}
                    </label>
                </div>
                {props.error && <p className="text-red-500/50 text-xs mt-1">{props.error}</p>}
            </div>
        )
    },
)

FloatingLabelInput.displayName = "FloatingLabelInput"

// ============================================================================
// Floating Label Textarea
// ============================================================================

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string
    error?: string
}

const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
    ({ className, label, defaultValue, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)
        const [isFilled, setIsFilled] = React.useState(
            (value !== undefined) ? (String(value) !== "") : (defaultValue !== undefined) ? String(defaultValue) !== "" : false,
        )
        const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

        const handleRef = (instance: HTMLTextAreaElement | null) => {
            textareaRef.current = instance
            if (typeof ref === "function") {
                ref(instance)
            } else if (ref) {
                ref.current = instance
            }
        }

        const handleLabelClick = () => {
            textareaRef.current?.focus()
        }

        const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(true)
            props.onFocus?.(e)
        }

        const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(false)
            props.onBlur?.(e)
        }

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setIsFilled(e.target.value !== "")
            props.onChange?.(e)
        }

        React.useEffect(() => {
            if (value !== undefined) {
                setIsFilled(String(value) !== "")
            }
            if (defaultValue !== undefined) {
                setIsFilled(String(defaultValue) !== "")
            }
        }, [value, defaultValue])

        return (
            <div className="relative">
                <div className="relative">
                    <textarea
                        {...props}
                        className={cn(
                            "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 pt-4 pb-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                            props.error && "border-red-500 focus-visible:ring-red-500",
                            className,
                        )}
                        ref={handleRef}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={value}
                        defaultValue={defaultValue}
                        placeholder={(isFilled) ? "" : (isFocused ? (props.placeholder || label) : "")}
                    />
                    <label
                        className={cn(
                            "absolute left-3 pointer-events-none transition-all duration-200 ease-in-out px-1 z-10",
                            isFocused || isFilled
                                ? "text-xs bg-background top-0 -translate-y-1/2"
                                : "text-base text-muted-foreground top-4",
                            isFocused && !props.error && "text-primary",
                            props.error && "text-red-500",
                        )}
                        onClick={handleLabelClick}
                    >
                        {label}
                    </label>
                </div>
                {props.error && <p className="text-red-500/50 text-xs mt-1">{props.error}</p>}
            </div>
        )
    },
)

FloatingLabelTextarea.displayName = "FloatingLabelTextarea"

// ============================================================================
// Floating Label Select
// ============================================================================

export interface FloatingSelectProps {
    label: string
    error?: string
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    children: React.ReactNode
}

const FloatingLabelSelect = React.forwardRef<HTMLButtonElement, FloatingSelectProps>(
    ({ label, error, value, defaultValue, onValueChange, placeholder, disabled, className, children }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [isFilled, setIsFilled] = React.useState(
            value !== undefined ? value !== "" : defaultValue !== undefined ? defaultValue !== "" : false
        )

        React.useEffect(() => {
            if (value !== undefined) {
                setIsFilled(value !== "")
            }
        }, [value])

        const handleValueChange = (newValue: string) => {
            setIsFilled(newValue !== "")
            onValueChange?.(newValue)
        }

        return (
            <div className="relative">
                <SelectPrimitive.Root
                    value={value}
                    defaultValue={defaultValue}
                    onValueChange={handleValueChange}
                    onOpenChange={setIsOpen}
                    disabled={disabled}
                >
                    <SelectPrimitive.Trigger
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                            error && "border-red-500 focus:ring-red-500",
                            className,
                        )}
                    >
                        <SelectPrimitive.Value placeholder={isOpen ? (placeholder || "") : ""} />
                        <SelectPrimitive.Icon asChild>
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </SelectPrimitive.Icon>
                    </SelectPrimitive.Trigger>
                    <SelectPrimitive.Portal>
                        <SelectPrimitive.Content
                            className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                            position="popper"
                        >
                            <SelectScrollUpButton />
                            <SelectPrimitive.Viewport className="p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]">
                                {children}
                            </SelectPrimitive.Viewport>
                            <SelectScrollDownButton />
                        </SelectPrimitive.Content>
                    </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
                <label
                    className={cn(
                        "absolute left-3 pointer-events-none transition-all duration-200 ease-in-out px-1 z-10",
                        isOpen || isFilled
                            ? "text-xs bg-background top-0 -translate-y-1/2"
                            : "text-base text-muted-foreground top-1/2 -translate-y-1/2",
                        isOpen && !error && "text-primary",
                        error && "text-red-500",
                    )}
                >
                    {label}
                </label>
                {error && <p className="text-red-500/50 text-xs mt-1">{error}</p>}
            </div>
        )
    },
)

FloatingLabelSelect.displayName = "FloatingLabelSelect"

// Helper to render icon - supports both React nodes and string URLs
function renderIcon(icon: React.ReactNode | string | undefined) {
    if (!icon) return null
    if (typeof icon === "string") {
        return <img src={icon || "/placeholder.svg"} alt="" className="h-4 w-4 object-contain rounded-sm" />
    }
    return icon
}

// Select sub-components
function SelectItem({
    className,
    children,
    icon,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { icon?: React.ReactNode | string }) {
    return (
        <SelectPrimitive.Item
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>
                <span className="flex items-center gap-2">
                    {icon && <span className="h-4 w-4 shrink-0">{renderIcon(icon)}</span>}
                    {children}
                </span>
            </SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group {...props} />
}

function SelectLabel({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
            {...props}
        />
    )
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            className={cn("-mx-1 my-1 h-px bg-muted", className)}
            {...props}
        />
    )
}

function SelectScrollUpButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            className={cn("flex cursor-default items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronUpIcon className="h-4 w-4" />
        </SelectPrimitive.ScrollUpButton>
    )
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            className={cn("flex cursor-default items-center justify-center py-1", className)}
            {...props}
        >
            <ChevronDownIcon className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
    )
}

// ============================================================================
// Floating Label Dropdown
// ============================================================================

export interface FloatingDropdownProps {
    label: string
    error?: string
    value?: string
    placeholder?: string
    disabled?: boolean
    className?: string
    children: React.ReactNode
}

const FloatingLabelDropdown = React.forwardRef<HTMLButtonElement, FloatingDropdownProps>(
    ({ label, error, value, placeholder, disabled, className, children }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const isFilled = value !== undefined && value !== ""

        return (
            <div className="relative">
                <DropdownMenuPrimitive.Root onOpenChange={setIsOpen}>
                    <DropdownMenuPrimitive.Trigger
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-red-500 focus:ring-red-500",
                            className,
                        )}
                    >
                        <span className={cn(!isFilled && "text-muted-foreground")}>
                            {isFilled ? value : placeholder || ""}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </DropdownMenuPrimitive.Trigger>
                    <DropdownMenuPrimitive.Portal>
                        <DropdownMenuPrimitive.Content
                            sideOffset={4}
                            className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
                        >
                            {children}
                        </DropdownMenuPrimitive.Content>
                    </DropdownMenuPrimitive.Portal>
                </DropdownMenuPrimitive.Root>
                <label
                    className={cn(
                        "absolute left-3 pointer-events-none transition-all duration-200 ease-in-out px-1 z-10",
                        isOpen || isFilled
                            ? "text-xs bg-background top-0 -translate-y-1/2"
                            : "text-base text-muted-foreground top-1/2 -translate-y-1/2",
                        isOpen && !error && "text-primary",
                        error && "text-red-500",
                    )}
                >
                    {label}
                </label>
                {error && <p className="text-red-500/50 text-xs mt-1">{error}</p>}
            </div>
        )
    },
)

FloatingLabelDropdown.displayName = "FloatingLabelDropdown"

// Dropdown sub-components
function DropdownMenuItem({
    className,
    inset,
    icon,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean; icon?: React.ReactNode | string }) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                inset && "pl-8",
                className,
            )}
            {...props}
        >
            {icon && <span className="h-4 w-4 shrink-0">{renderIcon(icon)}</span>}
            {children}
        </DropdownMenuPrimitive.Item>
    )
}

function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    icon,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & { icon?: React.ReactNode | string }) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            className={cn(
                "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className,
            )}
            checked={checked}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <CheckIcon className="h-4 w-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {icon && <span className="h-4 w-4 shrink-0">{renderIcon(icon)}</span>}
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    )
}

function DropdownMenuRadioGroup({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup {...props} />
}

function DropdownMenuRadioItem({
    className,
    children,
    icon,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & { icon?: React.ReactNode | string }) {
    return (
        <DropdownMenuPrimitive.RadioItem
            className={cn(
                "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <CheckIcon className="h-4 w-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {icon && <span className="h-4 w-4 shrink-0">{renderIcon(icon)}</span>}
            {children}
        </DropdownMenuPrimitive.RadioItem>
    )
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
    return (
        <DropdownMenuPrimitive.Label
            className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
            {...props}
        />
    )
}

function DropdownMenuSeparator({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            className={cn("-mx-1 my-1 h-px bg-muted", className)}
            {...props}
        />
    )
}

export {
    FloatingLabelInput,
    FloatingLabelTextarea,
    FloatingLabelSelect,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
    FloatingLabelDropdown,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
}