import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachLiquidRuntime } from "./liquid-runtime";

beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(16), 0));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });

describe("document glass runtime", () => {
  it("leaves server-rendered control, surface and chip attributes untouched", () => {
    document.body.innerHTML = '<button>Action</button><select class="liquid-native-select"><option>Hidden form adapter</option></select><div role="menu"><a role="menuitem" href="/">Item</a></div><span class="rounded bg-green">Status</span><div data-liquid-exclude><button>Authored</button><div role="menu"></div></div>';
    const before = document.body.innerHTML;
    const dispose = attachLiquidRuntime(document);
    expect(document.body.innerHTML).toBe(before);
    document.querySelector("button")!.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    expect(document.body.innerHTML).toBe(before);
    expect(document.querySelector("[data-liquid-exclude] button")).not.toHaveAttribute("data-liquid-control");
    expect(document.querySelector(".liquid-native-select")).not.toHaveAttribute("data-liquid-control");
    dispose();
  });

  it("handles new portal items without mutating them and removes its overlay on disposal", () => {
    const dispose = attachLiquidRuntime(document, { tension: true });
    const portal = document.createElement("div");
    portal.innerHTML = '<div role="listbox"><div role="option">Option</div></div>';
    document.body.append(portal);
    portal.querySelector("[role=option]")!.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    expect(portal.querySelector("[role=option]")).not.toHaveAttribute("data-liquid-control");
    expect(document.querySelector<HTMLElement>(".liquid-tension-plane")!.style.opacity).toBe("1");
    expect(document.querySelectorAll(".liquid-tension-plane")).toHaveLength(1);
    dispose();
    expect(document.querySelector(".liquid-tension-plane")).toBeNull();
    portal.querySelector("[role=option]")!.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    expect(portal.querySelector("[data-liquid-hover]")).toBeNull();
  });
});
