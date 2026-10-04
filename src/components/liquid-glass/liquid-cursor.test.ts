import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachLiquidCursor, LIQUID_CURSOR } from "./liquid-cursor";

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let reduced: boolean;
let fine: boolean;
let dispose: (() => void) | undefined;
const preferenceChanges = new Map<string, () => void>();
class MousePointer extends MouseEvent {
  pointerType: string;
  constructor(type: string, props: PointerEventInit = {}) { super(type, props); this.pointerType = props.pointerType ?? "mouse"; }
}
beforeEach(() => {
  frames = new Map(); frameId = 0; reduced = false; fine = true; preferenceChanges.clear();
  vi.stubGlobal("PointerEvent", MousePointer);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return query.includes("reduced-motion") ? reduced : fine; },
    addEventListener: (_: string, callback: () => void) => preferenceChanges.set(query, callback),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => { dispose?.(); dispose = undefined; document.body.replaceChildren(); vi.unstubAllGlobals(); });
function move(x: number, type = "mouse", target: Element = document.body) {
  const event = new MousePointer("pointermove", { bubbles: true, clientX: x, clientY: 80, pointerType: type });
  target.dispatchEvent(event); expect(event.defaultPrevented).toBe(false);
}
function tick(time: number) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn(time)); }
const head = () => document.querySelector<HTMLElement>(".liquid-cursor-drop")!;
const visibleTraces = () => [...document.querySelectorAll<HTMLElement>(".liquid-cursor-trace")].filter((dot) => Number(dot.style.opacity) > 0);

describe("water cursor", () => {
  it("follows the latest pointer, fades a bounded trail and stops frames at rest", () => {
    dispose = attachLiquidCursor();
    move(10); move(20); expect(frames.size).toBe(1);
    tick(0); expect(head().style.transform).toContain("20px, 80px"); expect(frames.size).toBe(0);
    move(55); tick(16); expect(visibleTraces().length).toBeGreaterThan(0);
    const film = document.querySelector<SVGElement>(".liquid-cursor-film")!;
    const opacity = Number(film.style.opacity);
    expect(document.querySelector(".liquid-cursor-membrane")!.getAttribute("d")).toContain("Q");
    tick(200); expect(Number(film.style.opacity)).toBeLessThan(opacity);
    for (let time = 233; time <= 1000; time += 33) tick(time);
    expect(visibleTraces()).toHaveLength(0); expect(frames.size).toBe(0);
    expect(document.querySelector(".liquid-cursor-membrane")).toHaveAttribute("d", "");
    expect(head().style.opacity).toBe("1");
    expect(document.querySelectorAll(".liquid-cursor-trace")).toHaveLength(LIQUID_CURSOR.trailCapacity);
    expect(document.querySelector(".liquid-cursor-plane")).toHaveAttribute("aria-hidden", "true");
  });

  it("stretches with speed, keeps curves local and avoids bridging pointer jumps", () => {
    dispose = attachLiquidCursor(); move(10); tick(0); move(90); tick(16);
    expect(head().style.transform).not.toContain("scale(1, 1)");
    const film = document.querySelector<SVGElement>(".liquid-cursor-film")!;
    expect(parseFloat(film.style.width)).toBeLessThan(120);
    for (let time = 32; time <= 160; time += 16) tick(time);
    move(500); tick(176);
    expect(visibleTraces()).toHaveLength(0);
    expect(document.querySelector(".liquid-cursor-membrane")).toHaveAttribute("d", "");
  });

  it("accumulates slow motion and clears on scroll, exit or drag", () => {
    dispose = attachLiquidCursor(); move(10); tick(0);
    move(12); tick(16); move(14); tick(32); move(17); tick(48);
    expect(visibleTraces().length).toBeGreaterThan(0);
    window.dispatchEvent(new Event("scroll")); expect(frames.size).toBe(0); expect(head().style.opacity).toBe("0");
    move(30); tick(60);
    document.dispatchEvent(new MousePointer("pointerout", { relatedTarget: null })); expect(head().style.opacity).toBe("0");
    move(30); tick(80);
    document.dispatchEvent(new MousePointer("pointermove", { pointerType: "mouse", buttons: 1 })); expect(head().style.opacity).toBe("0");
  });

  it("skips touch, coarse pointers, excluded content and reduced motion; cleans up", () => {
    dispose = attachLiquidCursor();
    move(10, "touch"); expect(frames.size).toBe(0);
    fine = false; move(10); expect(frames.size).toBe(0);
    fine = true;
    const authored = document.createElement("div"); authored.dataset.liquidExclude = "true"; document.body.append(authored);
    move(10, "mouse", authored); expect(frames.size).toBe(0);
    move(20); tick(0); move(40); tick(16);
    reduced = true; preferenceChanges.get("(prefers-reduced-motion: reduce)")?.();
    expect(frames.size).toBe(0); expect(head().style.opacity).toBe("0");
    reduced = false; move(40); expect(frames.size).toBe(1);
    dispose(); dispose = undefined;
    expect(document.querySelector(".liquid-cursor-plane")).toBeNull(); expect(frames.size).toBe(0);
    move(50); expect(frames.size).toBe(0);
  });
});
