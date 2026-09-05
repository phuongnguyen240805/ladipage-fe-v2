"use client";

import React, { useEffect } from "react";
import {
  useLadiFeedbackStore,
  type LadiToast,
  type LadiToastType,
} from "@/lib/ladi-feedback";

const TOAST_ICONS: Record<LadiToastType, React.ReactElement> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const TOAST_ACCENT: Record<LadiToastType, string> = {
  success: "text-lime-500 dark:text-lime-300",
  error: "text-rose-500 dark:text-rose-300",
  warning: "text-amber-500 dark:text-amber-300",
  info: "text-sky-500 dark:text-sky-300",
};

function ToastCard({ toast }: { toast: LadiToast }) {
  const dismissToast = useLadiFeedbackStore((s) => s.dismissToast);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 w-full max-w-sm rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-lg animate-fadeIn"
    >
      <span className={`flex-shrink-0 mt-0.5 ${TOAST_ACCENT[toast.type]}`}>
        {TOAST_ICONS[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white break-words">
          {toast.message}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 break-words">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        aria-label="Đóng thông báo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ToastViewport() {
  const toasts = useLadiFeedbackStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[10000] flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ConfirmDialog() {
  const confirm = useLadiFeedbackStore((s) => s.confirm);
  const resolveConfirm = useLadiFeedbackStore((s) => s.resolveConfirm);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolveConfirm(false);
      if (e.key === "Enter") resolveConfirm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm, resolveConfirm]);

  if (!confirm) return null;

  const destructive = confirm.destructive ?? false;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() => resolveConfirm(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-fadeIn"
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full ${
              destructive
                ? "text-rose-500 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40"
                : "text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30"
            }`}
          >
            {destructive ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {confirm.title}
            </h3>
            {confirm.description && (
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                {confirm.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            onClick={() => resolveConfirm(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
          >
            {confirm.cancelLabel ?? "Hủy"}
          </button>
          <button
            onClick={() => resolveConfirm(true)}
            autoFocus
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition cursor-pointer ${
              destructive
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-lime-500 hover:bg-lime-600"
            }`}
          >
            {confirm.confirmLabel ?? "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LadiFeedbackProvider() {
  return (
    <>
      <ToastViewport />
      <ConfirmDialog />
    </>
  );
}
