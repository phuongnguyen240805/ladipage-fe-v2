"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { createLiquidMotion, paintLiquidRect } from "./liquid-motion";

/** Two independently settling drops merge through an SVG alpha filter.
 * Only the decoration is filtered; labels stay sharp. No idle render loop.
 */
export function LiquidTrack({ children, activeKey, className = "", label }: {
  children: ReactNode; activeKey: string; className?: string; label: string;
}) {
  const id = useId().replace(/:/g, "");
  const rail = useRef<HTMLDivElement>(null);
  const front = useRef<SVGRectElement>(null);
  const trail = useRef<SVGRectElement>(null);
  const rim = useRef<SVGRectElement>(null);
  const retarget = useRef<(element: HTMLElement, instant?: boolean) => void>(() => {});

  useEffect(() => {
    const container = rail.current;
    if (!container) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hovered: HTMLElement | null = null;
    const movement = createLiquidMotion((lead, tail) => {
      paintLiquidRect(front.current, lead); paintLiquidRect(trail.current, tail); paintLiquidRect(rim.current, lead);
    }, () => motion.matches);
    const target = (element: HTMLElement, instant = false) => {
      const bounds = element.getBoundingClientRect();
      const parent = container.getBoundingClientRect();
      movement.move({ x: bounds.left - parent.left, y: bounds.top - parent.top, width: bounds.width, height: bounds.height }, instant);
    };
    retarget.current = target;
    const selected = () => container.querySelector<HTMLElement>("[data-liquid-active='true']") ?? container.querySelector<HTMLElement>("[data-liquid-item]");
    const restore = () => {
      const focused = document.activeElement instanceof HTMLElement && container.contains(document.activeElement)
        ? document.activeElement.closest<HTMLElement>("[data-liquid-item]") : null;
      const element = focused ?? selected();
      if (element) target(element);
    };
    const interact = (event: Event) => {
      if (event instanceof PointerEvent && event.type === "pointerover" && event.pointerType === "touch") return;
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-liquid-item]") : null;
      if (!element || !container.contains(element) || element.matches(":disabled, [aria-disabled='true']")) return;
      if (event.type === "pointerover") hovered = element;
      target(element);
    };
    const leave = () => { hovered = null; restore(); };
    const blur = (event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !container.contains(event.relatedTarget)) restore(); };
    const refresh = () => { const element = hovered ?? selected(); if (element) target(element, true); };
    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    container.querySelectorAll("[data-liquid-item]").forEach((element) => observer.observe(element));
    container.addEventListener("pointerover", interact);
    container.addEventListener("pointerdown", interact);
    container.addEventListener("focusin", interact);
    container.addEventListener("pointerleave", leave);
    container.addEventListener("focusout", blur);
    motion.addEventListener("change", refresh);
    refresh();
    return () => {
      movement.stop(); observer.disconnect(); retarget.current = () => {};
      container.removeEventListener("pointerover", interact);
      container.removeEventListener("pointerdown", interact);
      container.removeEventListener("focusin", interact);
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("focusout", blur);
      motion.removeEventListener("change", refresh);
    };
  }, []);

  useEffect(() => {
    const element = rail.current?.querySelector<HTMLElement>("[data-liquid-active='true']");
    if (element) retarget.current(element);
  }, [activeKey]);

  return (
    <div className={`liquid-track ${className}`} role="group" aria-label={label}>
      <div className="liquid-track-scroll">
        <div ref={rail} className="liquid-track-rail">
          <svg className="liquid-track-water" aria-hidden="true" focusable="false">
            <defs>
              <filter id={`${id}-merge`} x="-20%" y="-80%" width="140%" height="260%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
              </filter>
              <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0.7" y2="1">
                <stop className="liquid-water-top" offset="0" />
                <stop className="liquid-water-bottom" offset="1" />
              </linearGradient>
              <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="white" stopOpacity=".95" />
                <stop offset=".55" stopColor="white" stopOpacity=".12" />
                <stop offset="1" stopColor="white" stopOpacity=".5" />
              </linearGradient>
            </defs>
            <g filter={`url(#${id}-merge)`} fill={`url(#${id}-water)`}>
              <rect ref={trail} /><rect ref={front} />
            </g>
            <rect ref={rim} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.4" />
          </svg>
          {children}
        </div>
      </div>
    </div>
  );
}
