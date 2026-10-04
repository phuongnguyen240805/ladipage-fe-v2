import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachLiquidRuntime, decorateLiquidTree } from "./liquid-runtime";

beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(16), 0));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});
afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });

describe("document glass runtime", () => {
  it("covers legacy controls, menu surfaces and chips without touching authored content", () => {
    document.body.innerHTML = '<button>Action</button><select class="liquid-native-select"><option>Hidden form adapter</option></select><div role="menu"><a role="menuitem" href="/">Item</a></div><span class="rounded bg-green">Status</span><div data-liquid-exclude><button>Authored</button><div role="menu"></div></div>';
    decorateLiquidTree(document);
    expect(document.querySelector("button")).toHaveAttribute("data-liquid-control", "button");
    expect(document.querySelector("[role=menu]")).toHaveAttribute("data-liquid-surface", "popover");
    expect(document.querySelector("span")).toHaveAttribute("data-liquid-chip", "true");
    expect(document.querySelector("[data-liquid-exclude] button")).not.toHaveAttribute("data-liquid-control");
    expect(document.querySelector(".liquid-native-select")).not.toHaveAttribute("data-liquid-control");
  });

  it("discovers new portal content and removes its only overlay/listeners on disposal", async () => {
    const dispose = attachLiquidRuntime(document, { discover: true, tension: true });
    const portal = document.createElement("div");
    portal.innerHTML = '<div role="listbox"><div role="option">Option</div></div>';
    document.body.append(portal);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(portal.querySelector("[role=option]")).toHaveAttribute("data-liquid-control", "item");
    expect(document.querySelectorAll(".liquid-tension-plane")).toHaveLength(1);
    dispose();
    expect(document.querySelector(".liquid-tension-plane")).toBeNull();
    portal.querySelector("[role=option]")!.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    expect(portal.querySelector("[data-liquid-hover]")).toBeNull();
  });
});
