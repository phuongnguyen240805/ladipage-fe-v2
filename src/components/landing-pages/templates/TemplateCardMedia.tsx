"use client";

import React, { useEffect, useRef, useState } from "react";
import { TemplateItem } from "../dung-chung/types";
import { loadTemplateEditorData } from "./template-service";
import { TemplateUiPreview } from "./TemplateUiPreview";

type PreviewPhase = "idle" | "loading" | "live" | "fallback";

const previewCache = new Map<string, unknown | null>();
const previewInflight = new Map<string, Promise<unknown | null>>();

function hasSections(data: unknown): data is { sections: unknown[] } {
  return Boolean(data && typeof data === "object" && Array.isArray((data as { sections?: unknown }).sections));
}

function canHoverFinePointer() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resetTemplateCardPreviewCache() {
  previewCache.clear();
  previewInflight.clear();
}

export function loadTemplateCardPreview(template: TemplateItem): Promise<unknown | null> {
  if (hasSections(template.editor_data)) return Promise.resolve(template.editor_data);

  const key = template.id;
  if (previewCache.has(key)) return Promise.resolve(previewCache.get(key) ?? null);

  let pending = previewInflight.get(key);
  if (!pending) {
    pending = loadTemplateEditorData({
      id: template.id,
      editor_data: template.editor_data,
      editor_data_url: template.editor_data_url,
      render_url: template.render_url,
      name: template.name,
    })
      .then((data) => {
        const resolved = hasSections(data) ? data : null;
        previewCache.set(key, resolved);
        previewInflight.delete(key);
        return resolved;
      })
      .catch(() => {
        previewCache.set(key, null);
        previewInflight.delete(key);
        return null;
      });
    previewInflight.set(key, pending);
  }

  return pending;
}

export function TemplateCardMedia({
  template,
  children,
}: {
  template: TemplateItem;
  children?: React.ReactNode;
}) {
  const initialData = hasSections(template.editor_data) ? template.editor_data : null;
  const [editorData, setEditorData] = useState<unknown>(initialData);
  const [phase, setPhase] = useState<PreviewPhase>(initialData ? "live" : "idle");
  const [hovered, setHovered] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<() => void>(() => undefined);
  const leaveRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const target = node.closest("article") ?? node;
    const onEnter = () => enterRef.current();
    const onLeave = () => leaveRef.current();
    target.addEventListener("mouseenter", onEnter);
    target.addEventListener("mouseleave", onLeave);
    return () => {
      target.removeEventListener("mouseenter", onEnter);
      target.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const startLoad = () => {
    if (startedRef.current || phase === "live" || phase === "fallback") return;
    startedRef.current = true;
    setPhase("loading");
    void loadTemplateCardPreview(template).then((data) => {
      if (!mountedRef.current) return;
      if (data) {
        setEditorData(data);
        setPhase("live");
        return;
      }
      setPhase("fallback");
    });
  };

  const handleEnter = () => {
    if (!canHoverFinePointer()) return;
    setHovered(true);
    setAllowMotion(!prefersReducedMotion());
    startLoad();
  };

  const handleLeave = () => {
    setHovered(false);
  };

  enterRef.current = handleEnter;
  leaveRef.current = handleLeave;

  const liveTemplate = editorData ? { ...template, editor_data: editorData } : template;
  const showSkeleton = hovered && phase === "loading";

  return (
    <div
      ref={rootRef}
      className="relative aspect-[4/3.35] overflow-hidden bg-slate-100 dark:bg-slate-900"
    >
      <div className="absolute inset-0">
        {phase === "live" && editorData ? (
          <TemplateUiPreview template={liveTemplate} mode="card" playing={hovered && allowMotion} />
        ) : (
          <img
            src={template.image}
            alt={template.name}
            className="h-full w-full object-cover object-top"
          />
        )}
        {showSkeleton ? (
          <div className="ladi-skeleton absolute inset-0 z-[1]" role="status" aria-live="polite">
            <span className="sr-only">Đang tải xem trước template</span>
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
