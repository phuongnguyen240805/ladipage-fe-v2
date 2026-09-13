"use client";

import { io, type Socket } from "socket.io-client";
import type { CustomerCareSyncEvent } from "@liora/api-types";

export type CustomerCareRealtimeEvent = CustomerCareSyncEvent;

const SERVER_EVENTS = [
  "channel.status.changed",
  "conversation.created",
  "conversation.updated",
  "conversation.removed",
  "conversation.read.updated",
  "contact.updated",
  "contact.presence.updated",
  "message.created",
  "message.updated",
  "message.delivery.updated",
  "message.recalled",
  "typing.started",
  "typing.stopped",
] as const;

function socketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:7002")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
}

async function issueRealtimeTicket(): Promise<string> {
  const response = await fetch("/api/backend/account/realtime-ticket", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to create realtime session");

  const raw = (await response.json()) as {
    data?: { ticket?: unknown };
    ticket?: unknown;
  };
  const ticket = raw.data?.ticket ?? raw.ticket;
  if (typeof ticket !== "string" || ticket.length < 20) {
    throw new Error("Invalid realtime session response");
  }
  return ticket;
}

export class CustomerCareSocket {
  private socket: Socket | null = null;
  private listeners = new Set<(event: CustomerCareRealtimeEvent) => void>();
  private stateListeners = new Set<(connected: boolean) => void>();

  connect(): void {
    if (this.socket) {
      if (!this.socket.connected) this.socket.connect();
      return;
    }

    const socket = io(`${socketBaseUrl()}/customer-care`, {
      // Socket.IO invokes this callback for the initial connection and every
      // reconnect, so a short-lived scoped ticket is always fetched fresh.
      auth: (done) => {
        void issueRealtimeTicket()
          .then((ticket) => done({ token: ticket }))
          .catch(() => done({ token: "" }));
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 10_000,
    });

    this.socket = socket;
    socket.on("connect", () => {
      this.stateListeners.forEach((listener) => listener(true));
    });
    socket.on("disconnect", () => {
      this.stateListeners.forEach((listener) => listener(false));
    });

    for (const type of SERVER_EVENTS) {
      socket.on(type, (event: CustomerCareSyncEvent | Record<string, unknown>) => {
        const normalized = normalizeEvent(type, event);
        this.listeners.forEach((listener) => listener(normalized));
      });
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit("conversation.join", { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit("conversation.leave", { conversationId });
  }

  typingStart(conversationId: string): void {
    this.socket?.emit("typing.start", { conversationId });
  }

  typingStop(conversationId: string): void {
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

function normalizeEvent(
  type: string,
  event: CustomerCareSyncEvent | Record<string, unknown>,
): CustomerCareSyncEvent {
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
