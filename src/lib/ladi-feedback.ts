import { create } from "zustand";

export type LadiToastType = "success" | "error" | "info" | "warning";

export interface LadiToast {
  id: string;
  type: LadiToastType;
  message: string;
  description?: string;
  duration: number;
}

export interface LadiConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface LadiConfirmState extends LadiConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

interface LadiFeedbackState {
  toasts: LadiToast[];
  confirm: LadiConfirmState | null;
  pushToast: (toast: Omit<LadiToast, "id">) => string;
  dismissToast: (id: string) => void;
  openConfirm: (options: LadiConfirmOptions, resolve: (value: boolean) => void) => void;
  resolveConfirm: (value: boolean) => void;
}

const genId = () =>
  `ldf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useLadiFeedbackStore = create<LadiFeedbackState>((set, get) => ({
  toasts: [],
  confirm: null,
  pushToast: (toast) => {
    const id = genId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  openConfirm: (options, resolve) => {
    // If a confirm is already open, reject it before replacing.
    const current = get().confirm;
    if (current) current.resolve(false);
    set({ confirm: { ...options, id: genId(), resolve } });
  },
  resolveConfirm: (value) => {
    const current = get().confirm;
    if (!current) return;
    current.resolve(value);
    set({ confirm: null });
  },
}));

const DEFAULT_DURATION = 4000;

type ToastArg = string | { message: string; description?: string; duration?: number };

function normalize(arg: ToastArg): Omit<LadiToast, "id" | "type"> {
  if (typeof arg === "string") return { message: arg, duration: DEFAULT_DURATION };
  return {
    message: arg.message,
    description: arg.description,
    duration: arg.duration ?? DEFAULT_DURATION,
  };
}

function emit(type: LadiToastType, arg: ToastArg): string {
  return useLadiFeedbackStore.getState().pushToast({ type, ...normalize(arg) });
}

/** Imperative toast API themed for LadiPage. Call from anywhere (no hook needed). */
export const ladiToast = {
  success: (arg: ToastArg) => emit("success", arg),
  error: (arg: ToastArg) => emit("error", arg),
  info: (arg: ToastArg) => emit("info", arg),
  warning: (arg: ToastArg) => emit("warning", arg),
  dismiss: (id: string) => useLadiFeedbackStore.getState().dismissToast(id),
};

/**
 * Promise-based confirmation dialog. Replaces window.confirm().
 * Usage: if (await ladiConfirm({ title, description, destructive: true })) { ... }
 */
export function ladiConfirm(options: LadiConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    useLadiFeedbackStore.getState().openConfirm(options, resolve);
  });
}
