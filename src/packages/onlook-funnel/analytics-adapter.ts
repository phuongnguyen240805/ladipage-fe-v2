import { FunnelEventName } from "./constants";

export interface FunnelAnalyticsEvent {
  name: FunnelEventName | (string & {});
  distinctId: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export interface AnalyticsAdapter {
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  capture: (name: FunnelAnalyticsEvent["name"], properties?: Record<string, unknown>) => void;
  getEvents?: () => FunnelAnalyticsEvent[];
}

export interface AnalyticsAdapterOptions {
  distinctId: string;
  enabled?: boolean;
  onCapture?: (event: FunnelAnalyticsEvent) => void;
}

export function createAnalyticsAdapter(options: AnalyticsAdapterOptions): AnalyticsAdapter {
  const events: FunnelAnalyticsEvent[] = [];
  const enabled = options.enabled ?? true;

  return {
    identify: (distinctId, properties) => {
      if (!enabled) return;
      options.onCapture?.({
        name: "funnelx.identify",
        distinctId,
        properties,
        timestamp: Date.now(),
      });
    },
    capture: (name, properties) => {
      if (!enabled) return;
      const event = {
        name,
        distinctId: options.distinctId,
        properties,
        timestamp: Date.now(),
      };
      events.push(event);
      options.onCapture?.(event);
    },
    getEvents: () => [...events],
  };
}
