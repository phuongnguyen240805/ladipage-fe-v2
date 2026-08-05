"use client";

import { ChevronDown, HelpCircle, Inbox, X } from "lucide-react";
import type { ReactNode } from "react";

export function SettingsCard({
  title,
  subtitle,
  children,
  className = "",
  actions,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-[#151918] ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={title || subtitle || actions ? "px-5 pb-5 pt-4 sm:px-7 sm:pb-7" : "p-5 sm:p-7"}>{children}</div>
    </section>
  );
}

export function DetailConfigItem({
  icon,
  title,
  description,
  children,
  subRows,
  last = false,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  subRows?: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`${last ? "" : "border-b border-slate-200 dark:border-white/[0.08]"} py-5 first:pt-1 last:pb-1`}>
      <div className="grid gap-4 md:grid-cols-[32px_minmax(0,1fr)_auto] md:items-start">
        <div className="hidden h-7 w-7 items-center justify-center text-slate-500 dark:text-slate-300 md:flex [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <span>{title}</span>
            {description && <HelpCircle className="h-3.5 w-3.5 text-slate-400" />}
          </div>
          {description && <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</div>}
          {subRows && <div className="mt-3 max-w-[690px] divide-y divide-slate-200 dark:divide-white/[0.08]">{subRows}</div>}
        </div>
        {children && <div className="flex min-h-8 items-center justify-start md:justify-end">{children}</div>}
      </div>
    </div>
  );
}

export function SettingsToggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-lime-500" : "bg-slate-200 dark:bg-[#2b3130]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function SettingsSelect({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative inline-flex min-w-[120px] ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-lime-500 dark:border-white/10 dark:bg-[#161b1a] dark:text-slate-200"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

export function SettingsButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-lime-500 text-slate-950 hover:bg-lime-400",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#171c1a] dark:text-slate-200 dark:hover:bg-white/[0.05]",
    ghost: "text-lime-700 hover:bg-lime-500/10 dark:text-lime-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${styles[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SettingsEmptyState({ title = "Trống", description }: { title?: string; description?: string }) {
  return (
    <div className="flex min-h-[290px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 text-slate-400 dark:border-white/15"><Inbox className="h-7 w-7" /></div>
      <div className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
      {description && <div className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{description}</div>}
    </div>
  );
}

export function SettingsModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161a19]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[calc(88vh-132px)] overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-white/[0.08]">{footer}</div>}
      </div>
    </div>
  );
}
