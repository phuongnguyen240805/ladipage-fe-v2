"use client";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

type FeedbackWindow = Window & {
  showToast?: (message: string, type?: ToastType, options?: Record<string, unknown>) => void;
  showLoadingToast?: (message: string, key?: string) => void;
  hideLoadingToast?: (key?: string) => void;
};

export function showClientToast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;

  const feedbackWindow = window as FeedbackWindow;
  if (typeof feedbackWindow.showToast === "function") {
    feedbackWindow.showToast(message, type);
    return;
  }

  if (type === "error") {
    console.error(message);
    return;
  }

  if (type === "warning") {
    console.warn(message);
    return;
  }

  console.info(message);
}

export function showClientLoading(message: string, key = "facebook-ads") {
  if (typeof window === "undefined") return;

  const feedbackWindow = window as FeedbackWindow;
  if (typeof feedbackWindow.showLoadingToast === "function") {
    feedbackWindow.showLoadingToast(message, key);
    return;
  }

  showClientToast(message, "loading");
}

export function hideClientLoading(key = "facebook-ads") {
  if (typeof window === "undefined") return;

  const feedbackWindow = window as FeedbackWindow;
  if (typeof feedbackWindow.hideLoadingToast === "function") {
    feedbackWindow.hideLoadingToast(key);
  }
}
