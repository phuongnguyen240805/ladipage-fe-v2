"use client";

import { useEffect, useRef, useState } from "react";
import { FUNNELX_EVENTS } from "./constants";
import { useFunnel } from "./provider";

export function useTimeOnPage(thresholdMs = 5000, enabled = true) {
  const [fired, setFired] = useState(false);
  const { analytics, setAttributes } = useFunnel();

  useEffect(() => {
    if (!enabled || fired) return;
    const timer = window.setTimeout(() => {
      setFired(true);
      setAttributes({ time_on_page_ms: thresholdMs });
      analytics.capture(FUNNELX_EVENTS.triggerFired, { trigger: "time_on_page", thresholdMs });
    }, thresholdMs);
    return () => window.clearTimeout(timer);
  }, [analytics, enabled, fired, setAttributes, thresholdMs]);

  return fired;
}

export function useScrollProgress(threshold = 50, enabled = true) {
  const [progress, setProgress] = useState(0);
  const firedRef = useRef(false);
  const { analytics, setAttributes } = useFunnel();

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      setProgress(nextProgress);
      setAttributes({ scroll_progress: nextProgress });

      if (!firedRef.current && nextProgress >= threshold) {
        firedRef.current = true;
        analytics.capture(FUNNELX_EVENTS.triggerFired, { trigger: "scroll_progress", threshold, progress: nextProgress });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [analytics, enabled, setAttributes, threshold]);

  return progress;
}

export function useExitIntent(enabled = true) {
  const [fired, setFired] = useState(false);
  const { analytics, setAttributes } = useFunnel();

  useEffect(() => {
    if (!enabled || fired) return;
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      setFired(true);
      setAttributes({ exit_intent: true });
      analytics.capture(FUNNELX_EVENTS.triggerFired, { trigger: "exit_intent" });
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [analytics, enabled, fired, setAttributes]);

  return fired;
}

export function useInactivityTracker(thresholdMs = 15000, enabled = true) {
  const [inactive, setInactive] = useState(false);
  const { analytics, setAttributes } = useFunnel();

  useEffect(() => {
    if (!enabled) return;
    let timer: number;
    const reset = () => {
      setInactive(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setInactive(true);
        setAttributes({ inactive_ms: thresholdMs });
        analytics.capture(FUNNELX_EVENTS.triggerFired, { trigger: "inactivity", thresholdMs });
      }, thresholdMs);
    };

    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [analytics, enabled, setAttributes, thresholdMs]);

  return inactive;
}

export function useClickTracker(selector = "[data-funnel-track]", enabled = true) {
  const { analytics, setAttributes } = useFunnel();

  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(selector) : null;
      if (!target) return;
      const id = target.getAttribute("data-funnel-track") ?? target.id ?? selector;
      setAttributes({ last_clicked: id });
      analytics.capture(FUNNELX_EVENTS.triggerFired, { trigger: "click", target: id });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [analytics, enabled, selector, setAttributes]);
}
