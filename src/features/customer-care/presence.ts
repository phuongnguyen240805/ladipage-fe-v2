"use client";

import { useEffect, useState } from "react";
import type { CustomerCarePresence } from "@liora/api-types";

export function usePresenceNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

export function formatCustomerPresence(
  presence: CustomerCarePresence | undefined,
  now = Date.now(),
): string | null {
  if (!presence || presence.state === "unknown") return null;
  if (presence.state === "online") return "Đang hoạt động";

  const timestamp = presence.lastActiveAt ? new Date(presence.lastActiveAt).getTime() : NaN;
  if (!Number.isFinite(timestamp)) return "Ngoại tuyến";

  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Vừa hoạt động";
  if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;

  const date = new Date(timestamp);
  const current = new Date(now);
  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
    return `Hoạt động hôm qua lúc ${time}`;
  }

  return `Hoạt động ${new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

export function isCustomerOnline(presence: CustomerCarePresence | undefined) {
  return presence?.state === "online";
}
