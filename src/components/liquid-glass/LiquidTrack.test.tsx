import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiquidTrack } from "./LiquidTrack";
import { LiquidInteractions } from "./LiquidInteractions";

let reduced = false;
let frames: Map<number, FrameRequestCallback>;
let nextFrame = 0;
let time = 0;
const disconnect = vi.fn();
const cancelAnimation = vi.fn();
let finishAnimation: (() => void) | null;
const originalAnimate = HTMLElement.prototype.animate;

class TestPointerEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, options: PointerEventInit = {}) { super(type, options); this.pointerType = options.pointerType ?? "mouse"; }
}

beforeEach(() => {
  reduced = false; frames = new Map(); time = 0; nextFrame = 0; finishAnimation = null;
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  vi.stubGlobal("matchMedia", () => ({ get matches() { return reduced; }, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => { frames.delete(id); });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const left = Number(this.dataset.left ?? 0);
    return { left, top: 0, width: 100, height: 44, right: left + 100, bottom: 44, x: left, y: 0, toJSON() {} };
  });
  Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: vi.fn(() => ({
    cancel: cancelAnimation,
    set onfinish(callback: () => void) { finishAnimation = callback; },
  } as unknown as Animation)) });
});

afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks();
  if (originalAnimate) Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: originalAnimate });
  else Reflect.deleteProperty(HTMLElement.prototype, "animate");
});

function settle() {
  act(() => {
    for (let i = 0; frames.size && i < 180; i++) {
      time += 16.67;
      const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(time));
    }
  });
  expect(frames.size).toBe(0);
}

function track(active = "one") {
  return <LiquidTrack activeKey={active} label="Navigation">
    <button data-liquid-item data-left="0" data-liquid-active={active === "one"}>One</button>
    <button data-liquid-item data-left="120" data-liquid-active={active === "two"}>Two</button>
    <button data-liquid-item data-left="240" disabled>Disabled</button>
  </LiquidTrack>;
}

describe("liquid navigation", () => {
  it("creates distinct leading/trailing drops on hover, settles, then stops rendering", () => {
    const { container } = render(track());
    fireEvent.pointerOver(screen.getByText("Two"), { pointerType: "mouse" });
    act(() => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(16.67)); });
    const drops = container.querySelectorAll("g rect");
    expect(Number(drops[1].getAttribute("x"))).toBeGreaterThan(Number(drops[0].getAttribute("x")));
    settle(); expect(drops[1]).toHaveAttribute("x", "120");
    fireEvent.pointerLeave(container.querySelector(".liquid-track-rail")!);
    settle(); expect(drops[1]).toHaveAttribute("x", "0");
  });

  it("responds to finger contact and keyboard focus, while ignoring disabled controls", () => {
    const { container } = render(track());
    const lead = container.querySelectorAll("g rect")[1];
    fireEvent.pointerOver(screen.getByText("Two"), { pointerType: "touch" });
    expect(frames.size).toBe(0);
    fireEvent.pointerDown(screen.getByText("Two"), { pointerType: "touch" });
    settle(); expect(lead).toHaveAttribute("x", "120");
    fireEvent.pointerDown(screen.getByText("Disabled"));
    expect(frames.size).toBe(0); expect(lead).toHaveAttribute("x", "120");
    act(() => screen.getByText("One").focus()); settle(); expect(lead).toHaveAttribute("x", "0");
  });

  it("tracks active changes and cancels pending frames on unmount", () => {
    const { container, rerender, unmount } = render(track());
    rerender(track("two")); settle();
    expect(container.querySelectorAll("g rect")[1]).toHaveAttribute("x", "120");
    fireEvent.pointerOver(screen.getByText("One")); expect(frames.size).toBe(1);
    unmount(); expect(frames.size).toBe(0); expect(disconnect).toHaveBeenCalledOnce();
  });

  it("preserves the selected appearance without animation for reduced motion", () => {
    reduced = true;
    const { container } = render(track());
    fireEvent.pointerOver(screen.getByText("Two"));
    expect(container.querySelectorAll("g rect")[1]).toHaveAttribute("x", "120");
    expect(frames.size).toBe(0);
  });
});

describe("water feedback", () => {
  it("decorates a touch without interfering with clicks and removes finished ripples", () => {
    const click = vi.fn();
    render(<LiquidInteractions><button onClick={click}>Action</button></LiquidInteractions>);
    const button = screen.getByText("Action");
    fireEvent.pointerDown(button, { pointerType: "touch", clientX: 25, clientY: 20 });
    expect(document.querySelector(".liquid-ripple")).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(button); expect(click).toHaveBeenCalledOnce();
    finishAnimation?.(); expect(document.querySelector(".liquid-ripple")).toBeNull();
  });

  it("limits rapid taps to one ripple and cleans up on unmount", () => {
    const { unmount } = render(<LiquidInteractions><button>Action</button></LiquidInteractions>);
    const button = screen.getByText("Action");
    fireEvent.pointerDown(button); fireEvent.pointerDown(button);
    expect(document.querySelectorAll(".liquid-ripple")).toHaveLength(1);
    unmount(); expect(document.querySelector(".liquid-ripple")).toBeNull();
    expect(cancelAnimation).toHaveBeenCalledTimes(2);
  });

  it("skips reduced motion, disabled controls and non-home scopes", () => {
    const { rerender } = render(<LiquidInteractions enabled={false}><button>Action</button></LiquidInteractions>);
    fireEvent.pointerDown(screen.getByText("Action")); expect(screen.getByText("Action").children).toHaveLength(0);
    reduced = true;
    rerender(<LiquidInteractions><button>Action</button><button disabled>Disabled</button></LiquidInteractions>);
    fireEvent.pointerDown(screen.getByText("Action")); expect(screen.getByText("Action").children).toHaveLength(0);
    reduced = false;
    fireEvent.pointerDown(screen.getByText("Disabled")); expect(screen.getByText("Disabled").children).toHaveLength(0);
  });
});
