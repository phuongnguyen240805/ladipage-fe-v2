"use client";

import { io, type Socket } from "socket.io-client";
import type { CustomerCareSyncEvent } from "@liora/api-types";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export type CustomerCareRealtimeEvent = CustomerCareSyncEvent;

const SERVER_EVENTS = [
  "channel.status.changed",
  "conversation.created",
  "conversation.updated",
  "conversation.removed",
  "conversation.read.updated",
  "contact.updated",
  "message.created",
  "message.updated",
  "message.delivery.updated",
  "message.recalled",
  "typing.started",
  "typing.stopped",
] as const;

function socketBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
}

export class CustomerCareSocket {
  private socket: Socket | null = null;
  private listeners = new Set<(event: CustomerCareRealtimeEvent) => void>();
  private stateListeners = new Set<(connected: boolean) => void>();

  connect() {
    const token = useAuthStore.getState().platform.nestToken;
    if (!token) return;
    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) this.socket.connect();
      return;
    }
    const socket = io(`${socketBaseUrl()}/customer-care`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 10_000,
    });
    this.socket = socket;
    socket.on("connect", () => this.stateListeners.forEach((listener) => listener(true)));
    socket.on("disconnect", () => this.stateListeners.forEach((listener) => listener(false)));
    socket.io.on("reconnect_attempt", () => {
      socket.auth = { token: useAuthStore.getState().platform.nestToken };
    });
    for (const type of SERVER_EVENTS) {
      socket.on(type, (event: CustomerCareSyncEvent | Record<string, unknown>) => {
        const normalized = normalizeEvent(type, event);
        this.listeners.forEach((listener) => listener(normalized));
      });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: string) {
    this.socket?.emit("conversation.join", { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit("conversation.leave", { conversationId });
  }

  typingStart(conversationId: string) {
    this.socket?.emit("typing.start", { conversationId });
  }

  typingStop(conversationId: string) {
    this.socket?.emit("typing.stop", { conversationId });
  }

  subscribe(listener: (event: CustomerCareRealtimeEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeConnection(listener: (connected: boolean) => void) {
    this.stateListeners.add(listener);
    listener(Boolean(this.socket?.connected));
    return () => this.stateListeners.delete(listener);
  }
}

function normalizeEvent(type: string, event: CustomerCareSyncEvent | Record<string, unknown>): CustomerCareSyncEvent {
  if (typeof event.sequence === "number" && typeof event.eventId === "string") {
    return event as CustomerCareSyncEvent;
  }
  return {
    eventId: String(event.eventId ?? `${type}:${Date.now()}`),
    sequence: Number(event.sequence ?? 0),
    type,
    aggregateId: typeof event.aggregateId === "string" ? event.aggregateId : null,
    occurredAt: String(event.occurredAt ?? new Date().toISOString()),
    data: (event.data && typeof event.data === "object" ? event.data : event) as Record<string, unknown>,
  };
}

export const customerCareSocket = new CustomerCareSocket();
