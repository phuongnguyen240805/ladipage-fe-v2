import { createLiquidMotion, LIQUID_MOTION, paintLiquidRect } from "./liquid-motion";

/** Semantic hooks first, legacy adapters second. No layout/label/content changes. */
export const LIQUID_SELECTORS = {
  control: "button, select, a[href], [role='button'], [role='tab'], [role='option'], [role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio'], [data-liquid-control]",
  exclude: "[data-liquid-exclude], .liquid-native-select, [contenteditable='true'], [data-nextjs-dialog], #nextjs-dev-tools",
  surface: "[data-liquid-surface], [role='listbox'], [role='menu'], [data-slot='select-content'], [data-slot='dropdown-menu-content'], [data-slot='dropdown-menu-sub-content'], [data-slot='popover-content'], [data-slot='dialog-content'], [data-slot='card'], .ladi-surface, .ladi-surface-elevated, .adsmeta-feature-card, .adsmeta-card, .ladi-popover-enter, .liquid-panel, header, aside, div[class*='rounded'][class*='border'][class*='bg-white'], section[class*='rounded'][class*='border'][class*='bg-white']",
  chip: "[data-slot='badge'], .ladi-status-badge, .adsmeta-status, span[class*='rounded'][class*='bg-'], span[class*='rounded'][class*='border']",
  group: "[data-liquid-group], [role='listbox'], [role='menu'], [role='tablist'], nav, header, .menu-item, .adsmeta-segmented, [data-slot='tabs-list']",
} as const;

const blocked = (element: Element) => Boolean(element.closest(LIQUID_SELECTORS.exclude));
const disabled = (element: HTMLElement) => element.matches(":disabled, [aria-disabled='true'], [data-disabled]");

/** Read-only classification. Never decorate React-owned DOM during streaming hydration. */
function isPlainLink(element: HTMLElement) {
  return element.dataset.liquidControl === "link" || (element.tagName === "A" && !element.matches("[role], [data-slot='button'], [class*='rounded'], .menu-item, .menu-dropdown-item") && !element.closest("nav, header, aside"));
}

let overlayId = 0;
function createOverlay() {
  const svgNS = "http://www.w3.org/2000/svg";
  const plane = document.createElement("div");
  plane.className = "liquid-tension-plane";
  plane.dataset.liquidDecoration = "true";
  plane.setAttribute("aria-hidden", "true");
  const id = `liquid-global-${++overlayId}`;
  const svg = document.createElementNS(svgNS, "svg");
  // Static markup contains only our own generated id, never application input.
  svg.innerHTML = `<defs><filter id="${id}" x="-20%" y="-80%" width="140%" height="260%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="4"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -8"/></filter><linearGradient id="${id}-fill" x2=".6" y2="1"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="#a3c9e7"/></linearGradient></defs><g filter="url(#${id})" fill="url(#${id}-fill)"><rect/><rect/></g><rect fill="none" stroke="white" stroke-width="1"/>`;
  plane.appendChild(svg);
  document.body.appendChild(plane);
  const rectangles = svg.querySelectorAll("rect");
  return { plane, lead: rectangles[1], tail: rectangles[0], rim: rectangles[2] };
}

/** One document listener set serves every app screen, including portals. */
export function attachLiquidRuntime(root: HTMLElement | Document, { tension = false } = {}) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ripples = new Map<HTMLElement, { animation: Animation; control: HTMLElement; clip: HTMLElement }>();
  const overlay = tension ? createOverlay() : null;
  let hovered: HTMLElement | null = null;
  let lastGroup: Element | null = null;
  let lastBox: DOMRect | null = null;
  let radius = 12;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  const movement = createLiquidMotion((lead, tail) => {
    if (!overlay) return;
    paintLiquidRect(overlay.lead, lead, radius); paintLiquidRect(overlay.tail, tail, radius); paintLiquidRect(overlay.rim, lead, radius);
  }, () => reduced.matches);
  const clearRipple = (drop: HTMLElement) => { const entry = ripples.get(drop); entry?.animation.cancel(); entry?.clip.remove(); ripples.delete(drop); };
  const getControl = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null;
    const element = target.closest<HTMLElement>(LIQUID_SELECTORS.control);
    return element && root.contains(element) && !blocked(element) && !disabled(element) && !element.matches("[type='checkbox'], [type='radio'], [role='switch'], [role='checkbox'], [role='radio']") ? element : null;
  };
  const show = (control: HTMLElement) => {
    clearTimeout(leaveTimer);
    hovered = control;
    if (!overlay || reduced.matches || control.matches("select, .liquid-track-item") || isPlainLink(control)) { if (overlay) overlay.plane.style.opacity = "0"; return; }
    const box = control.getBoundingClientRect();
    const group = control.closest(LIQUID_SELECTORS.group) ?? control.parentElement;
    const distant = !lastBox || Math.hypot(box.x - lastBox.x, box.y - lastBox.y) > 220;
    radius = parseFloat(getComputedStyle(control).borderTopLeftRadius) || 12;
    movement.move({ x: box.x, y: box.y, width: box.width, height: box.height }, group !== lastGroup || distant);
    lastBox = box; lastGroup = group; overlay.plane.style.opacity = "1";
  };
  const over = (event: Event) => {
    if (event instanceof PointerEvent && event.pointerType === "touch") return;
    const control = getControl(event.target); if (control) show(control);
  };
  const out = (event: Event) => {
    const next = getControl((event as PointerEvent).relatedTarget);
    if (next) { if (next !== hovered) show(next); return; }
    const hide = () => {
      hovered = null;
      if (overlay) overlay.plane.style.opacity = "0";
      movement.stop(); lastGroup = null; lastBox = null;
    };
    clearTimeout(leaveTimer);
    // Bridge small gaps between links so their drops can stretch and merge.
    if (event.type === "pointerout") leaveTimer = setTimeout(hide, 120);
    else hide();
  };
  const press = (event: Event) => {
    if (reduced.matches) return;
    if (event instanceof KeyboardEvent && (event.repeat || !["Enter", " "].includes(event.key))) return;
    if (event instanceof PointerEvent && event.button !== 0) return;
    const control = getControl(event.target);
    if (!control || control.tagName === "SELECT") return;
    if (event instanceof PointerEvent && event.pointerType === "touch") show(control);
    for (const [drop, entry] of ripples) if (entry.control === control) clearRipple(drop);
    const bounds = control.getBoundingClientRect();
    const pointer = event instanceof PointerEvent;
    const size = Math.max(bounds.width, bounds.height) * 2;
    const drop = document.createElement("span");
    const clip = document.createElement("div");
    clip.className = "liquid-ripple-clip"; clip.dataset.liquidDecoration = "true"; clip.setAttribute("aria-hidden", "true");
    Object.assign(clip.style, { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, borderRadius: getComputedStyle(control).borderRadius });
    drop.className = "liquid-ripple"; drop.dataset.liquidDecoration = "true"; drop.setAttribute("aria-hidden", "true");
    drop.style.width = drop.style.height = `${size}px`;
    drop.style.left = `${(pointer ? event.clientX - bounds.left : bounds.width / 2) - size / 2}px`;
    drop.style.top = `${(pointer ? event.clientY - bounds.top : bounds.height / 2) - size / 2}px`;
    clip.appendChild(drop); document.body.appendChild(clip);
    if (typeof drop.animate !== "function") { clip.remove(); return; }
    const animation = drop.animate([
      { transform: "scale(.08)", opacity: .8 },
      { transform: "scale(.55)", opacity: .48, offset: .45 },
      { transform: "scale(1)", opacity: 0 },
    ], { duration: LIQUID_MOTION.rippleDuration, easing: "cubic-bezier(.16,1,.3,1)" });
    ripples.set(drop, { animation, control, clip });
    animation.onfinish = () => { clip.remove(); ripples.delete(drop); };
  };
  const refresh = () => {
    if (reduced.matches) { ripples.forEach((_, drop) => clearRipple(drop)); if (overlay) overlay.plane.style.opacity = "0"; movement.stop(); }
    else if (hovered?.isConnected) show(hovered);
  };
  const viewportChanged = () => { ripples.forEach((_, drop) => clearRipple(drop)); out(new Event("scroll")); };
  root.addEventListener("pointerover", over); root.addEventListener("focusin", over);
  root.addEventListener("pointerout", out); root.addEventListener("focusout", out);
  // Capture precedes components that stop propagation, without changing their events.
  root.addEventListener("pointerdown", press, true); root.addEventListener("keydown", press, true);
  window.addEventListener("scroll", viewportChanged, true); window.addEventListener("resize", viewportChanged);
  reduced.addEventListener("change", refresh);
  return () => {
    clearTimeout(leaveTimer);
    movement.stop();
    root.removeEventListener("pointerover", over); root.removeEventListener("focusin", over);
    root.removeEventListener("pointerout", out); root.removeEventListener("focusout", out);
    root.removeEventListener("pointerdown", press, true); root.removeEventListener("keydown", press, true);
    window.removeEventListener("scroll", viewportChanged, true); window.removeEventListener("resize", viewportChanged);
    reduced.removeEventListener("change", refresh);
    ripples.forEach((_, drop) => clearRipple(drop)); overlay?.plane.remove();
  };
}
