"use client";

import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";
import { formatApiErrorBody } from "@/lib/format-api-error";
import type { BuilderMessage } from "./builder-message-protocol";

export async function waitForBuilderPagePersisted(
  pageId: string,
  sessionToken: string,
  maxWaitMs = 90_000,
): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  let lastStatus = 404;

  while (Date.now() < deadline) {
    const response = await fetch(`/api/builder/pages/${encodeURIComponent(pageId)}`, {
      method: "GET",
      credentials: "include",
      headers: { "x-builder-session": sessionToken },
    });
    if (response.ok) return;

    lastStatus = response.status;
    if (response.status !== 404) {
      const result = await response.json().catch(() => null);
      throw new Error(formatApiErrorBody(result, `Cannot load builder page (${response.status}).`));
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (lastStatus === 404) {
    throw new Error(
      "Landing page chưa được lưu vào database. Job AI có thể chưa chạy xong — kiểm tra ladipage-ai-worker hoặc đợi vài giây rồi thử lại.",
    );
  }
  throw new Error(`Không thể tải landing page (HTTP ${lastStatus}).`);
}

export async function openLandingBuilder(options: {
  pageId: string;
  mode?: "new-tab" | "iframe-modal" | "same-tab";
  container?: string;
  /** Chờ row landing_pages trên Supabase (bật cho trang AI async). Tắt cho blank/import đã tạo sync. */
  waitForPage?: boolean;
}): Promise<void> {
  const mode = options.mode ?? "new-tab";
  const waitForPage = options.waitForPage ?? true;
  const headers = await getPlatformAuthHeaders({ preferNest: true });

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

  const { builderUrl, token } = (await response.json()) as {
    builderUrl: string;
    token: string;
    expiresAt: string;
  };

  if (waitForPage && token) {
    await waitForBuilderPagePersisted(options.pageId, token);
  }

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
