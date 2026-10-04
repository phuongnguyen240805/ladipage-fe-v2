export type LiquidBox = { x: number; y: number; width: number; height: number };

export const LIQUID_MOTION = {
  rippleDuration: 620,
  leadRetention: .75,
  tailRetention: .86,
  settleThreshold: .25,
} as const;

/** Shared, time-normalized motion. Never runs a frame loop at rest. */
export function createLiquidMotion(paint: (lead: LiquidBox, tail: LiquidBox) => void, reduced: () => boolean) {
  const lead = { x: 0, y: 0, width: 0, height: 0 };
  const tail = { ...lead };
  let destination = { ...lead };
  let initialized = false;
  let frame = 0;
  let previousTime = 0;
  const keys = ["x", "y", "width", "height"] as const;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const distance = () => keys.reduce((sum, key) => sum + Math.abs(destination[key] - lead[key]) + Math.abs(lead[key] - tail[key]), 0);
  const tick = (time: number) => {
    frame = 0;
    const dt = Math.min((time - (previousTime || time - 16.67)) / 16.67, 3);
    previousTime = time;
    for (const key of keys) {
      lead[key] += (destination[key] - lead[key]) * (1 - Math.pow(LIQUID_MOTION.leadRetention, dt));
      tail[key] += (lead[key] - tail[key]) * (1 - Math.pow(LIQUID_MOTION.tailRetention, dt));
    }
    paint(lead, tail);
    if (distance() > LIQUID_MOTION.settleThreshold) frame = requestAnimationFrame(tick);
    else { Object.assign(lead, destination); Object.assign(tail, destination); paint(lead, tail); previousTime = 0; }
  };
  return {
    move(box: LiquidBox, instant = false) {
      destination = { ...box };
      if (!initialized || instant || reduced()) {
        stop(); Object.assign(lead, box); Object.assign(tail, box); paint(lead, tail); initialized = true;
      } else if (!frame && distance() > LIQUID_MOTION.settleThreshold) frame = requestAnimationFrame(tick);
    },
    stop,
  };
}

export function paintLiquidRect(element: SVGRectElement | null, box: LiquidBox, radius = box.height / 2) {
  if (!element) return;
  for (const key of ["x", "y", "width", "height"] as const) element.setAttribute(key, String(box[key]));
  element.setAttribute("rx", String(Math.min(radius, box.height / 2)));
}
