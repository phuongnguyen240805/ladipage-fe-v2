import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createLiquidMotion, type LiquidBox } from "./liquid-motion";

let frames: Map<number, FrameRequestCallback>;
let time: number;
let next: number;
beforeEach(() => {
  frames = new Map(); time = 0; next = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++next, callback); return next; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});
afterEach(() => vi.unstubAllGlobals());
function step(dt = 16.67) {
  time += dt;
  const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(time));
}
const box = (x: number): LiquidBox => ({ x, y: 0, width: 100, height: 44 });

it("stretches with velocity, preserves inertia on reversal, then settles without idle frames", () => {
  let lead = box(0), tail = box(0);
  const motion = createLiquidMotion((head, trail) => { lead = { ...head }; tail = { ...trail }; }, () => false);
  motion.move(box(0)); motion.move(box(120)); step(); step();
  expect(lead.width).toBeGreaterThan(100);
  expect(lead.width).toBeLessThanOrEqual(130);
  expect(tail.width).toBeLessThan(lead.width);
  const before = lead.x + lead.width / 2;
  motion.move(box(0)); step();
  expect(lead.x + lead.width / 2).toBeGreaterThan(before);
  for (let i = 0; frames.size && i < 180; i++) step();
  expect(lead).toEqual(box(0)); expect(frames.size).toBe(0);
  motion.stop();
});

it.each([8.33, 33.34])("remains finite and settles at a %s ms frame interval", (dt) => {
  let lead = box(0);
  const motion = createLiquidMotion((head) => { lead = { ...head }; }, () => false);
  motion.move(box(0)); motion.move(box(180));
  for (let i = 0; frames.size && i < 400; i++) {
    step(dt);
    expect(Object.values(lead).every(Number.isFinite)).toBe(true);
    expect(lead.width).toBeGreaterThan(0); expect(lead.height).toBeGreaterThan(0);
  }
  expect(lead).toEqual(box(180)); expect(frames.size).toBe(0);
});
