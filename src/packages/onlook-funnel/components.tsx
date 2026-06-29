"use client";

import React, { useEffect, useState } from "react";
import { FUNNELX_EVENTS, FunnelFeatureFlag } from "./constants";
import { useFunnel } from "./provider";
import { useExitIntent, useInactivityTracker, useScrollProgress, useTimeOnPage } from "./triggers";

type TriggerMode = "immediate" | "time_on_page" | "scroll_progress" | "exit_intent" | "inactivity";

function useTriggerGate(mode: TriggerMode = "immediate", threshold?: number) {
  const time = useTimeOnPage(threshold ?? 5000, mode === "time_on_page");
  const scroll = useScrollProgress(threshold ?? 50, mode === "scroll_progress");
  const exit = useExitIntent(mode === "exit_intent");
  const inactive = useInactivityTracker(threshold ?? 15000, mode === "inactivity");

  if (mode === "immediate") return true;
  if (mode === "time_on_page") return time;
  if (mode === "scroll_progress") return scroll >= (threshold ?? 50);
  if (mode === "exit_intent") return exit;
  return inactive;
}

export interface ConditionalRenderProps {
  feature?: FunnelFeatureFlag;
  trigger?: TriggerMode;
  threshold?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ feature, trigger, threshold, children, fallback = null }: ConditionalRenderProps) {
  const { growthbook, analytics } = useFunnel();
  const triggerPassed = useTriggerGate(trigger, threshold);
  const featureOn = feature ? growthbook.isOn(feature) : true;
  const shouldShow = triggerPassed && featureOn;

  useEffect(() => {
    if (shouldShow) {
      analytics.capture(FUNNELX_EVENTS.conditionalShown, { feature, trigger });
    }
  }, [analytics, feature, shouldShow, trigger]);

  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

export interface FunnelPopupProps extends ConditionalRenderProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onConvert?: () => void;
}

export function FunnelPopup({ title, description, ctaLabel = "Continue", onConvert, ...gate }: FunnelPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const { analytics } = useFunnel();

  if (dismissed) return null;

  return (
    <ConditionalRender {...gate}>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
            <button
              onClick={() => {
                setDismissed(true);
                analytics.capture(FUNNELX_EVENTS.popupDismissed, { title });
              }}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              x
            </button>
          </div>
          <button
            onClick={() => {
              analytics.capture(FUNNELX_EVENTS.conversion, { source: "popup", title });
              onConvert?.();
            }}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </ConditionalRender>
  );
}

export function StickyBar({ children, ...gate }: ConditionalRenderProps) {
  const { analytics } = useFunnel();

  useEffect(() => {
    analytics.capture(FUNNELX_EVENTS.stickyBarShown, { feature: gate.feature });
  }, [analytics, gate.feature]);

  return (
    <ConditionalRender {...gate}>
      <div className="fixed inset-x-0 bottom-0 z-[9998] border-t border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        {children}
      </div>
    </ConditionalRender>
  );
}
