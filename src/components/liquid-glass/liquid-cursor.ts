import { LIQUID_SELECTORS } from "./liquid-runtime";

export const LIQUID_CURSOR = {
  diameter: 12,
  trailLifetime: 700,
  trailCapacity: 32,
  spacing: 4,
  maxJump: 160,
  offsetX: 0,
  offsetY: 0,
} as const;

type Point = { x: number; y: number };
type Trace = Point & { radius: number; born: number; order: number };
type FilmPoint = Point & { radius: number };

/** Quadratic midpoint interpolation keeps turns round instead of polygonal. */
function curve(points: Point[], start = "M") {
  if (!points.length) return "";
  let path = `${start}${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    path += ` Q${points[i].x},${points[i].y} ${(points[i].x + points[i + 1].x) / 2},${(points[i].y + points[i + 1].y) / 2}`;
  }
  if (points.length > 1) { const last = points.at(-1)!; path += ` L${last.x},${last.y}`; }
  return path;
}

let filmId = 0;
function createFilm(plane: HTMLElement) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.classList.add("liquid-cursor-film");
  const id = `liquid-film-${++filmId}`;
  svg.innerHTML = `<defs><linearGradient id="${id}" x2="0" y2="1"><stop offset="0" stop-color="white" stop-opacity=".65"/><stop offset=".45" stop-color="#aed8ef" stop-opacity=".12"/><stop offset="1" stop-color="#77b4d8" stop-opacity=".32"/></linearGradient></defs><path class="liquid-cursor-membrane" fill="url(#${id})"/><path class="liquid-cursor-meniscus" fill="none"/>`;
  plane.append(svg);
  const membrane = svg.querySelector<SVGPathElement>(".liquid-cursor-membrane")!;
  const meniscus = svg.querySelector<SVGPathElement>(".liquid-cursor-meniscus")!;
  return {
    clear() { membrane.setAttribute("d", ""); meniscus.setAttribute("d", ""); },
    paint(points: FilmPoint[], opacity: number) {
      if (points.length < 2) { this.clear(); return; }
      // Bound drawing to the wet patch, rather than filtering a viewport-sized layer.
      const left = Math.min(...points.map((point) => point.x)) - 12;
      const top = Math.min(...points.map((point) => point.y)) - 12;
      const width = Math.max(...points.map((point) => point.x)) - left + 12;
      const height = Math.max(...points.map((point) => point.y)) - top + 12;
      svg.style.left = `${left}px`; svg.style.top = `${top}px`;
      svg.style.width = `${width}px`; svg.style.height = `${height}px`;
      svg.style.opacity = String(opacity);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const sides = [1, -1].map((side) => points.map((point, i) => {
        const before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 1)];
        const angle = Math.atan2(after.y - before.y, after.x - before.x);
        return { x: point.x - left - Math.sin(angle) * point.radius * side, y: point.y - top + Math.cos(angle) * point.radius * side };
      }));
      membrane.setAttribute("d", `${curve(sides[0])} ${curve(sides[1].reverse(), "L")} Z`);
      meniscus.setAttribute("d", curve(sides[0]));
    },
  };
}

/** Fixed-size DOM pool, frame-coalesced input, no React renders or idle loop. */
export function attachLiquidCursor() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mouse = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const plane = document.createElement("div");
  plane.className = "liquid-cursor-plane";
  plane.dataset.liquidDecoration = "true";
  plane.setAttribute("aria-hidden", "true");
  const film = createFilm(plane);
  const head = document.createElement("span");
  head.className = "liquid-cursor-drop";
  head.style.width = head.style.height = `${LIQUID_CURSOR.diameter}px`;
  const slots = Array.from({ length: LIQUID_CURSOR.trailCapacity }, () => {
    const dot = document.createElement("span");
    dot.className = "liquid-cursor-trace";
    return dot;
  });
  plane.append(...slots, head);
  document.body.append(plane);
  const traces: (Trace | null)[] = slots.map(() => null);
  let frame = 0;
  let cursor = 0;
  let previous: Point | null = null;
  let pending: Point | null = null;
  let order = 0;
  let sampledAt = 0;
  let paintedAt = 0;
  let stretch = 1;
  let direction = 0;
  let headPosition: Point | null = null;

  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    previous = null; pending = null;
    headPosition = null; sampledAt = 0; paintedAt = 0; stretch = 1;
    film.clear();
    head.style.opacity = "0";
    traces.fill(null); slots.forEach((dot) => { dot.style.opacity = "0"; });
  };
  const enabled = () => !reduced.matches && mouse.matches && !document.hidden;
  const paint = (time: number) => {
    frame = 0;
    if (!enabled()) { reset(); return; }
    const dt = paintedAt ? Math.min(time - paintedAt, 64) : 16.67;
    paintedAt = time;
    let targetStretch = 1;
    if (pending) {
      const next = pending; pending = null;
      const dx = previous ? next.x - previous.x : 0;
      const dy = previous ? next.y - previous.y : 0;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const speed = distance / Math.max(time - sampledAt, 8);
      if (distance > LIQUID_CURSOR.maxJump) { traces.fill(null); film.clear(); slots.forEach((dot) => { dot.style.opacity = "0"; }); }
      else if (previous && distance >= LIQUID_CURSOR.spacing) {
        const count = Math.min(Math.ceil(distance / LIQUID_CURSOR.spacing), LIQUID_CURSOR.trailCapacity);
        for (let i = 0; i < count; i++) {
          const ratio = i / count;
          traces[cursor] = { x: previous.x + dx * ratio, y: previous.y + dy * ratio, radius: 1.7 + Math.min(speed * .65, 1.8), born: time - Math.min(time - sampledAt, 40) * (1 - ratio), order: ++order };
          cursor = (cursor + 1) % slots.length;
        }
      }
      if (distance >= LIQUID_CURSOR.spacing && distance <= LIQUID_CURSOR.maxJump) { direction = angle; targetStretch = 1 + Math.min(speed * .2, .45); }
      headPosition = next;
      head.style.opacity = "1";
      if (!previous || distance >= LIQUID_CURSOR.spacing) { previous = next; sampledAt = time; }
    }
    stretch += (targetStretch - stretch) * (1 - Math.exp(-dt / 65));
    if (headPosition) head.style.transform = `translate3d(${headPosition.x}px, ${headPosition.y}px, 0) translate(-50%, -50%) rotate(${direction}deg) scale(${stretch}, ${1 / Math.sqrt(stretch)})`;
    let alive = false;
    const wet: (FilmPoint & { order: number; life: number })[] = [];
    traces.forEach((trace, index) => {
      if (!trace) return;
      const life = Math.max(0, 1 - (time - trace.born) / LIQUID_CURSOR.trailLifetime);
      const dot = slots[index];
      if (!life) { traces[index] = null; dot.style.opacity = "0"; return; }
      alive = true;
      const radius = trace.radius * Math.pow(life, .7);
      if (life > .22) wet.push({ x: trace.x, y: trace.y, radius, life, order: trace.order });
      dot.style.width = dot.style.height = `${trace.radius * 2}px`;
      // A thinning film retreats into tiny beads before evaporating.
      dot.style.opacity = String(life * (.1 + (1 - life) * .28));
      dot.style.transform = `translate3d(${trace.x}px, ${trace.y}px, 0) translate(-50%, -50%) scale(${.3 + life * .7})`;
    });
    wet.sort((a, b) => a.order - b.order);
    const newest = wet.at(-1);
    if (newest && headPosition) wet.push({ ...headPosition, radius: newest.radius, life: newest.life, order: order + 1 });
    film.paint(wet, newest ? Math.pow(newest.life, .6) * .7 : 0);
    if (alive || Math.abs(stretch - 1) > .005) frame = requestAnimationFrame(paint);
    else { stretch = 1; paintedAt = 0; }
  };
  const move = (event: PointerEvent) => {
    if (!enabled() || event.pointerType !== "mouse" || event.buttons || (event.target instanceof Element && event.target.closest(LIQUID_SELECTORS.exclude))) { reset(); return; }
    pending = { x: event.clientX + LIQUID_CURSOR.offsetX, y: event.clientY + LIQUID_CURSOR.offsetY };
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
  const preference = () => { if (!enabled()) reset(); };
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerout", leave, { passive: true });
  document.addEventListener("pointerdown", reset, { passive: true });
  document.addEventListener("visibilitychange", preference);
  window.addEventListener("blur", reset);
  window.addEventListener("scroll", reset, { passive: true, capture: true });
  window.addEventListener("resize", reset);
  reduced.addEventListener("change", preference); mouse.addEventListener("change", preference);
  return () => {
    reset(); plane.remove();
    document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", leave);
    document.removeEventListener("pointerdown", reset); document.removeEventListener("visibilitychange", preference);
    window.removeEventListener("blur", reset); window.removeEventListener("scroll", reset, true); window.removeEventListener("resize", reset);
    reduced.removeEventListener("change", preference); mouse.removeEventListener("change", preference);
  };
}
