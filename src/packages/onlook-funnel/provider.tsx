"use client";

import React, { createContext, useContext, useMemo } from "react";
import { AnalyticsAdapter, createAnalyticsAdapter } from "./analytics-adapter";
import { buildFunnelAttributes, getFunnelDistinctId } from "./identity";
import { createGrowthBookAdapter, FunnelFeatureMap, GrowthBookLikeAdapter } from "./growthbook-adapter";

export interface FunnelProviderProps {
  children: React.ReactNode;
  distinctId?: string;
  attributes?: Record<string, unknown>;
  features?: FunnelFeatureMap;
  trackingEnabled?: boolean;
  analytics?: AnalyticsAdapter;
  growthbook?: GrowthBookLikeAdapter;
  onEvent?: Parameters<typeof createAnalyticsAdapter>[0]["onCapture"];
}

export interface FunnelContextValue {
  distinctId: string;
  analytics: AnalyticsAdapter;
  growthbook: GrowthBookLikeAdapter;
  attributes: Record<string, unknown>;
  setAttributes: (attributes: Record<string, unknown>) => void;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function FunnelProvider({
  children,
  distinctId,
  attributes,
  features,
  trackingEnabled = true,
  analytics,
  growthbook,
  onEvent,
}: FunnelProviderProps) {
  const value = useMemo<FunnelContextValue>(() => {
    const nextDistinctId = distinctId ?? getFunnelDistinctId();
    const nextAttributes = buildFunnelAttributes(attributes);
    const nextAnalytics = analytics ?? createAnalyticsAdapter({
      distinctId: nextDistinctId,
      enabled: trackingEnabled,
      onCapture: onEvent,
    });
    const nextGrowthbook = growthbook ?? createGrowthBookAdapter({
      features,
      attributes: nextAttributes,
      analytics: nextAnalytics,
    });

    nextAnalytics.identify(nextDistinctId, nextAttributes);

    return {
      distinctId: nextDistinctId,
      analytics: nextAnalytics,
      growthbook: nextGrowthbook,
      attributes: nextAttributes,
      setAttributes: nextGrowthbook.setAttributes,
    };
  }, [analytics, attributes, distinctId, features, growthbook, onEvent, trackingEnabled]);

  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>;
}

export function useFunnel() {
  const context = useContext(FunnelContext);
  if (!context) {
    throw new Error("useFunnel must be used inside FunnelProvider");
  }
  return context;
}
