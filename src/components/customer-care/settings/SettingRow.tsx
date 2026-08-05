"use client";

import { HelpCircle } from "lucide-react";

export function SettingRow({
  icon,
  title,
  description,
  children,
  disabled = false,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-5 dark:border-white/10 ${disabled ? "opacity-50" : ""}`}>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-300 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          {description && <HelpCircle className="h-3.5 w-3.5 text-slate-300" />}
        </div>
        {description && <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function ControlledSwitch({
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-lime-500" : "bg-slate-200 dark:bg-white/10"} disabled:cursor-not-allowed`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}
