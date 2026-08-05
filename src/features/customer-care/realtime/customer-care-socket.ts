import type { CustomerCareMessage } from "@liora/api-types";

export type CustomerCareRealtimeEvent =
  | { type: "message.created"; message: CustomerCareMessage }
  | { type: "typing.started"; conversationId: string; userName: string }
  | { type: "typing.stopped"; conversationId: string };

/**
 * Contract placeholder for the backend realtime adapter.
 * The demo UI works with local mock data; replace this adapter when the
 * customer-care gateway is available.
 */
export class CustomerCareSocket {
  private listeners = new Set<(event: CustomerCareRealtimeEvent) => void>();

  connect() {}
  disconnect() {
    this.listeners.clear();
  }
  subscribe(listener: (event: CustomerCareRealtimeEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emitForDemo(event: CustomerCareRealtimeEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const customerCareSocket = new CustomerCareSocket();
