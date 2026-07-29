"use client";

import React from "react";

/**
 * Lightweight modal shell for commerce CRUD forms (mock).
 * Matches app dark-mode + lime brand; not tied to any data model.
 */
export function CommerceModal({
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = "Lưu",
  submitDisabled = false,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-99999 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-gray-150 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 6 6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-150 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-lime-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </>
  );
}

/** Labeled text/number input for modal forms. */
export function CommerceField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium focus:outline-none focus:border-lime-400"
      />
    </div>
  );
}
