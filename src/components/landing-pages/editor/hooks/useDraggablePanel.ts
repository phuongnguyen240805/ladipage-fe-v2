"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export const INSPECTOR_PANEL_STORAGE_KEY = "landing-builder:inspector-panel-position";
export const PAGE_SETTINGS_STORAGE_KEY = "landing-builder:page-settings-position";
export const LEFT_RAIL_STORAGE_KEY = "landing-builder:left-rail-position";

export const EDITOR_TOPBAR_HEIGHT = 64;
export const EDITOR_LEFT_RAIL_WIDTH = 56;
export const EDITOR_PANEL_EDGE_PADDING = 8;
export const EDITOR_PANEL_SNAP_THRESHOLD = 16;

const ESTIMATED_PANEL_HEIGHT = 480;

export interface PanelPosition {
  x: number;
  y: number;
}

export interface DraggablePanelBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface UseDraggablePanelOptions {
  id: string;
  defaultPosition: PanelPosition | (() => PanelPosition);
  panelRef: React.RefObject<HTMLElement | null>;
  panelWidth?: number;
  storageKey?: string;
  topbarHeight?: number;
  leftRailWidth?: number;
  edgePadding?: number;
  snapThreshold?: number;
  enabled?: boolean;
  zIndex?: number;
  maxHeightOffset?: number;
  getBounds?: () => DraggablePanelBounds;
}

export interface DragHandleProps {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onDoubleClick: (event: React.MouseEvent<HTMLElement>) => void;
  role: string;
  "aria-label": string;
  tabIndex: number;
}

function isDragBlockedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'button, input, textarea, select, option, label, a, [contenteditable="true"], [data-no-drag], [role="slider"]',
    ),
  );
}

function readStoredPosition(storageKey: string): PanelPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PanelPosition>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function writeStoredPosition(storageKey: string, position: PanelPosition): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(position));
  } catch {
    // ignore quota errors
  }
}

function resolveDefaultPosition(
  defaultPosition: PanelPosition | (() => PanelPosition),
): PanelPosition {
  return typeof defaultPosition === "function" ? defaultPosition() : defaultPosition;
}

export function getDefaultInspectorPosition(panelWidth = 300): PanelPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: EDITOR_TOPBAR_HEIGHT + 16 };
  }
  return {
    x: window.innerWidth - panelWidth - 32,
    y: EDITOR_TOPBAR_HEIGHT + 16,
  };
}

export function getDefaultLeftRailPosition(): PanelPosition {
  return {
    x: 16,
    y: EDITOR_TOPBAR_HEIGHT + 16,
  };
}

export function computePanelBounds(
  panelWidth: number,
  panelHeight: number,
  options?: {
    topbarHeight?: number;
    leftRailWidth?: number;
    edgePadding?: number;
    minX?: number;
  },
): DraggablePanelBounds {
  const topbarHeight = options?.topbarHeight ?? EDITOR_TOPBAR_HEIGHT;
  const leftRailWidth = options?.leftRailWidth ?? EDITOR_LEFT_RAIL_WIDTH;
  const edgePadding = options?.edgePadding ?? EDITOR_PANEL_EDGE_PADDING;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const minX = options?.minX ?? leftRailWidth + edgePadding;

  return {
    minX,
    minY: topbarHeight + edgePadding,
    maxX: Math.max(minX, viewportWidth - panelWidth - edgePadding),
    maxY: Math.max(topbarHeight + edgePadding, viewportHeight - panelHeight - edgePadding),
  };
}

function clampPosition(
  position: PanelPosition,
  bounds: DraggablePanelBounds,
  snap = false,
  snapThreshold = EDITOR_PANEL_SNAP_THRESHOLD,
): PanelPosition {
  let x = Math.min(Math.max(position.x, bounds.minX), bounds.maxX);
  const y = Math.min(Math.max(position.y, bounds.minY), bounds.maxY);

  if (snap) {
    if (x - bounds.minX <= snapThreshold) x = bounds.minX;
    if (bounds.maxX - x <= snapThreshold) x = bounds.maxX;
  }

  return { x, y };
}

function createInitialPosition(
  resolvedStorageKey: string,
  defaultPosition: PanelPosition | (() => PanelPosition),
  getBounds: () => DraggablePanelBounds,
  snapThreshold: number,
): PanelPosition {
  if (typeof window === "undefined") {
    const bounds = getBounds();
    return { x: bounds.minX, y: bounds.minY };
  }

  const stored = readStoredPosition(resolvedStorageKey);
  const initial = stored ?? resolveDefaultPosition(defaultPosition);
  return clampPosition(initial, getBounds(), Boolean(stored), snapThreshold);
}

export function useDraggablePanel({
  id,
  defaultPosition,
  panelRef,
  panelWidth = 320,
  storageKey,
  topbarHeight = EDITOR_TOPBAR_HEIGHT,
  leftRailWidth = EDITOR_LEFT_RAIL_WIDTH,
  edgePadding = EDITOR_PANEL_EDGE_PADDING,
  snapThreshold = EDITOR_PANEL_SNAP_THRESHOLD,
  enabled = true,
  zIndex = 45,
  maxHeightOffset,
  getBounds: getBoundsOverride,
}: UseDraggablePanelOptions) {
  const resolvedStorageKey = storageKey ?? `landing-builder:panel-position:${id}`;
  const resolvedMaxHeightOffset = maxHeightOffset ?? topbarHeight + edgePadding;

  const getPanelSize = useCallback(() => {
    const element = panelRef.current;
    return {
      width: element?.offsetWidth ?? panelWidth,
      height: element?.offsetHeight ?? ESTIMATED_PANEL_HEIGHT,
    };
  }, [panelRef, panelWidth]);

  const getBounds = useCallback(() => {
    if (getBoundsOverride) return getBoundsOverride();
    const { width, height } = getPanelSize();
    return computePanelBounds(width, height, { topbarHeight, leftRailWidth, edgePadding });
  }, [edgePadding, getBoundsOverride, getPanelSize, leftRailWidth, topbarHeight]);

  const getEstimatedBounds = useCallback(() => {
    if (getBoundsOverride && typeof window !== "undefined") {
      return getBoundsOverride();
    }
    return computePanelBounds(panelWidth, ESTIMATED_PANEL_HEIGHT, {
      topbarHeight,
      leftRailWidth,
      edgePadding,
    });
  }, [edgePadding, getBoundsOverride, leftRailWidth, panelWidth, topbarHeight]);

  const [position, setPosition] = useState<PanelPosition>(() =>
    createInitialPosition(resolvedStorageKey, defaultPosition, getEstimatedBounds, snapThreshold),
  );
  const [isDragging, setIsDragging] = useState(false);

  const positionRef = useRef(position);
  const dragHandleRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    panelX: 0,
    panelY: 0,
  });
  const activePointerIdRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<PanelPosition | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const handlePointerMoveRef = useRef<(event: PointerEvent) => void>(() => {});
  const endDragRef = useRef<(event: PointerEvent) => void>(() => {});
  const moveListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const endListenerRef = useRef<((event: PointerEvent) => void) | null>(null);

  const applyPosition = useCallback((next: PanelPosition, snap = false) => {
    const clamped = clampPosition(next, getBounds(), snap, snapThreshold);
    positionRef.current = clamped;
    setPosition(clamped);
    return clamped;
  }, [getBounds, snapThreshold]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const schedulePositionUpdate = useCallback((next: PanelPosition) => {
    pendingPositionRef.current = next;
    if (rafIdRef.current !== null) return;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!pendingPositionRef.current) return;
      const clamped = clampPosition(pendingPositionRef.current, getBounds(), false, snapThreshold);
      pendingPositionRef.current = null;
      positionRef.current = clamped;
      setPosition(clamped);
    });
  }, [getBounds, snapThreshold]);

  const resetPosition = useCallback(() => {
    const next = resolveDefaultPosition(defaultPosition);
    const clamped = applyPosition(next, true);
    writeStoredPosition(resolvedStorageKey, clamped);
  }, [applyPosition, defaultPosition, resolvedStorageKey]);

  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    const clampToBounds = () => {
      setPosition((current) => {
        const clamped = clampPosition(current, getBounds(), true, snapThreshold);
        positionRef.current = clamped;
        return clamped;
      });
    };

    clampToBounds();

    const observer = new ResizeObserver(clampToBounds);
    observer.observe(node);
    return () => observer.disconnect();
  }, [getBounds, panelRef, snapThreshold]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((current) => {
        const clamped = clampPosition(current, getBounds(), true, snapThreshold);
        positionRef.current = clamped;
        return clamped;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getBounds, snapThreshold]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      document.body.style.userSelect = "";
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    const { pointerX, pointerY, panelX, panelY } = dragStartRef.current;
    schedulePositionUpdate({
      x: panelX + (event.clientX - pointerX),
      y: panelY + (event.clientY - pointerY),
    });
  }, [schedulePositionUpdate]);

  const endDrag = useCallback((event: PointerEvent) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    activePointerIdRef.current = null;
    setIsDragging(false);

    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const finalPosition = pendingPositionRef.current ?? positionRef.current;
    pendingPositionRef.current = null;

    const clamped = applyPosition(finalPosition, true);
    writeStoredPosition(resolvedStorageKey, clamped);

    const handle = dragHandleRef.current;
    if (handle?.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    dragHandleRef.current = null;
    document.body.style.userSelect = "";

    if (moveListenerRef.current) {
      window.removeEventListener("pointermove", moveListenerRef.current);
      moveListenerRef.current = null;
    }
    if (endListenerRef.current) {
      window.removeEventListener("pointerup", endListenerRef.current);
      window.removeEventListener("pointercancel", endListenerRef.current);
      endListenerRef.current = null;
    }
  }, [applyPosition, resolvedStorageKey]);

  useEffect(() => {
    handlePointerMoveRef.current = handlePointerMove;
    endDragRef.current = endDrag;
  }, [endDrag, handlePointerMove]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || event.button !== 0 || isDragBlockedTarget(event.target)) return;

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panelX: positionRef.current.x,
      panelY: positionRef.current.y,
    };

    activePointerIdRef.current = event.pointerId;
    dragHandleRef.current = event.currentTarget;
    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    document.body.style.userSelect = "none";

    const onMove = (pointerEvent: PointerEvent) => handlePointerMoveRef.current(pointerEvent);
    const onEnd = (pointerEvent: PointerEvent) => endDragRef.current(pointerEvent);
    moveListenerRef.current = onMove;
    endListenerRef.current = onEnd;

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }, [enabled]);

  const onDoubleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (isDragBlockedTarget(event.target)) return;
    resetPosition();
  }, [resetPosition]);

  const maxHeight = `calc(100vh - ${resolvedMaxHeightOffset}px)`;

  const style: CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    width: panelWidth,
    maxHeight,
    zIndex,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    willChange: isDragging ? "transform" : undefined,
    touchAction: isDragging ? "none" : undefined,
  };

  const dragHandleProps: DragHandleProps = {
    onPointerDown,
    onDoubleClick,
    role: "button",
    "aria-label": "Kéo để di chuyển panel",
    tabIndex: 0,
  };

  return {
    position,
    style,
    dragHandleProps,
    resetPosition,
    setPosition: applyPosition,
    isDragging,
    isHydrated: typeof window !== "undefined",
  };
};