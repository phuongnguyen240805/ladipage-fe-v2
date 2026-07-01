"use client";

import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";
import { formatApiErrorBody } from "@/lib/format-api-error";
import type { BuilderMessage } from "./builder-message-protocol";

export async function openLandingBuilder(options: {
  pageId: string;
  mode?: "new-tab" | "iframe-modal" | "same-tab";
  container?: string;
}): Promise<void> {
  const mode = options.mode ?? "new-tab";
  const headers = await getPlatformAuthHeaders();

  const response = await fetch("/api/builder/session", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ pageId: options.pageId }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(formatApiErrorBody(result, "Cannot create builder session."));
  }

  const { builderUrl } = (await response.json()) as {
    builderUrl: string;
    token: string;
    expiresAt: string;
  };

  if (mode === "new-tab") {
    window.open(builderUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (mode === "same-tab") {
    window.location.href = builderUrl;
    return;
  }

  const host =
    (options.container ? document.querySelector<HTMLElement>(options.container) : null) ??
    document.body;

  const overlay = document.createElement("div");
  overlay.dataset.easyManagerBuilderModal = "true";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483647",
    "background:#020617",
  ].join(";");

  const iframe = document.createElement("iframe");
  iframe.src = builderUrl;
  iframe.allow = "clipboard-read; clipboard-write";
  iframe.style.cssText = "width:100%;height:100%;border:0;display:block;";
  overlay.appendChild(iframe);
  host.appendChild(overlay);

  const close = () => overlay.remove();
  const onMessage = (event: MessageEvent<BuilderMessage>) => {
    if (event.origin !== window.location.origin) return;
    const message = event.data;
    if (!message || message.pageId !== options.pageId) return;

    if (message.type === "EM_BUILDER_CLOSE") {
      close();
      window.removeEventListener("message", onMessage);
    }

    if (message.type === "EM_BUILDER_PUBLISHED") {
      window.dispatchEvent(
        new CustomEvent("easy-manager:builder-published", {
          detail: message,
        })
      );
    }
  };

  window.addEventListener("message", onMessage);
}
