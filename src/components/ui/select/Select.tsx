"use client";

import React, { forwardRef } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

/* -------------------------------------------------------------------------------------------------
 * Compound Components
 * -----------------------------------------------------------------------------------------------*/

export const Select = SelectPrimitive.Root;

export const SelectGroup = SelectPrimitive.Group;

export const SelectLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SelectLabel({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none ${className}`}
      {...props}
    />
  );
});

export const SelectSeparator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SelectSeparator({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
});

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "xs" | "sm" | "md";
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    { className = "", size = "sm", children, ...props },
    ref,
  ) {
    const sizeClasses =
      size === "md"
        ? "h-10 px-3 text-sm"
        : size === "xs"
          ? "h-7 px-2 text-xs gap-1.5"
          : "h-9 px-3 text-sm";

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={`group/trigger flex w-full items-center justify-between gap-2 rounded-lg border border-kedi-navy/15 bg-white font-medium text-kedi-navy outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-kedi-navy/30 focus:border-kedi-yellow focus:ring-2 focus:ring-kedi-yellow/15 data-[popup-open]:border-kedi-yellow data-[popup-open]:ring-2 data-[popup-open]:ring-kedi-yellow/15 data-[open]:border-kedi-yellow data-[open]:ring-2 data-[open]:ring-kedi-yellow/15 dark:border-white/20 dark:bg-kedi-navy dark:text-white dark:hover:border-kedi-yellow/40 dark:focus:border-kedi-yellow dark:data-[popup-open]:border-kedi-yellow dark:data-[open]:border-kedi-yellow disabled:cursor-not-allowed disabled:opacity-50 select-none ${sizeClasses} ${className}`}
        {...props}
      >
        <span className="truncate">{children}</span>
        <SelectPrimitive.Icon className="flex items-center text-slate-400 dark:text-slate-500 transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180 group-data-[open]/trigger:rotate-180">
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);

export const SelectValue = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(function SelectValue({ className = "", placeholder, ...props }, ref) {
  return (
    <SelectPrimitive.Value
      ref={ref}
      placeholder={
        placeholder ? (
          <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
        ) : undefined
      }
      className={`truncate ${className}`}
      {...props}
    />
  );
});

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup> {
  align?: "start" | "end" | "center";
  sideOffset?: number;
  positionerClassName?: string;
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    {
      className = "",
      positionerClassName = "",
      align = "start",
      sideOffset = 4,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          align={align}
          sideOffset={sideOffset}
          alignItemWithTrigger={false}
          className={`isolate z-50 outline-none ${positionerClassName}`}
        >
          <SelectPrimitive.Popup
            ref={ref}
            className={`z-50 max-h-72 min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-[#13141f] dark:text-slate-100 dark:shadow-2xl dark:shadow-kedi-navy/60 outline-none transition-all duration-100 ${className}`}
            {...props}
          >
            {children}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    );
  },
);

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  indicator?: boolean;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem(
    { className = "", indicator = true, children, ...props },
    ref,
  ) {
    return (
      <SelectPrimitive.Item
        ref={ref}
        className={`relative flex h-9 cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-kedi-navy outline-none transition-colors data-[highlighted]:bg-brand-50 data-[highlighted]:text-kedi-navy dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white data-[selected]:bg-kedi-yellow data-[selected]:text-kedi-navy dark:data-[selected]:bg-kedi-yellow dark:data-[selected]:text-kedi-navy data-[selected]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-40 ${className}`}
        {...props}
      >
        <SelectPrimitive.ItemText className="truncate">
          {children}
        </SelectPrimitive.ItemText>
        {indicator && (
          <SelectPrimitive.ItemIndicator className="ml-2 flex items-center text-kedi-navy dark:text-kedi-yellow">
            <Check className="h-3.5 w-3.5" />
          </SelectPrimitive.ItemIndicator>
        )}
      </SelectPrimitive.Item>
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * CustomSelect Convenience Component
 * -----------------------------------------------------------------------------------------------*/

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: "xs" | "sm" | "md";
  name?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn...",
  disabled = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  size = "sm",
  name,
  id,
}) => {
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue: string | null) => {
        if (nextValue !== null && onChange) {
          onChange(nextValue);
        }
      }}
      disabled={disabled}
      name={name}
      id={id}
    >
      <div className={`relative ${className}`}>
        <SelectTrigger size={size} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </div>
    </Select>
  );
};

export default CustomSelect;
