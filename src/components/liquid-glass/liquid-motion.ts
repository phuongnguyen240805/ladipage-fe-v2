export type LiquidBox = { x: number; y: number; width: number; height: number };

export const LIQUID_MOTION = {
  rippleDuration: 620,
  spring: .15,
  damping: .7,
  sizeRetention: .8,
  tailRetention: .83,
  stretch: 1.4,
  maxStretch: 30,
  settleThreshold: .25,
} as const;

/** Shared, time-normalized motion. Never runs a frame loop at rest. */
export function createLiquidMotion(paint: (lead: LiquidBox, tail: LiquidBox) => void, reduced: () => boolean) {
  const lead = { x: 0, y: 0, width: 0, height: 0 };
  const tail = { ...lead };
  const velocity = { x: 0, y: 0 };
  let destination = { ...lead };
  let initialized = false;
  let frame = 0;
  let previousTime = 0;
  const keys = ["x", "y", "width", "height"] as const;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; velocity.x = velocity.y = 0; };
  const distance = () => keys.reduce((sum, key) => sum + Math.abs(destination[key] - lead[key]) + Math.abs(lead[key] - tail[key]), Math.abs(velocity.x) + Math.abs(velocity.y));
  const render = () => {
    const sx = Math.min(Math.abs(velocity.x) * LIQUID_MOTION.stretch, LIQUID_MOTION.maxStretch, lead.width * .45);
    const sy = Math.min(Math.abs(velocity.y) * LIQUID_MOTION.stretch, LIQUID_MOTION.maxStretch, lead.height * .45);
    const width = lead.width + sx - Math.min(sy * .25, lead.width * .1);
    const height = lead.height + sy - Math.min(sx * .25, lead.height * .1);
    paint({ x: lead.x + (lead.width - width) / 2, y: lead.y + (lead.height - height) / 2, width, height },
      { x: tail.x, y: tail.y + tail.height * .12, width: tail.width * .64, height: tail.height * .76 });
  };
  const tick = (time: number) => {
    frame = 0;
    const dt = Math.max(.01, Math.min((time - (previousTime || time - 16.67)) / 16.67, 3));
    previousTime = time;
    // Small integration steps keep the same spring stable at 30/60/120 Hz.
    const steps = Math.ceil(dt * 2);
    const step = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (const key of ["x", "y"] as const) {
        velocity[key] = (velocity[key] + (destination[key] - lead[key]) * LIQUID_MOTION.spring * step) * Math.pow(LIQUID_MOTION.damping, step);
        lead[key] += velocity[key] * step;
      }
      for (const key of ["width", "height"] as const) lead[key] += (destination[key] - lead[key]) * (1 - Math.pow(LIQUID_MOTION.sizeRetention, step));
      for (const key of keys) tail[key] += (lead[key] - tail[key]) * (1 - Math.pow(LIQUID_MOTION.tailRetention, step));
    }
    render();
    if (distance() > LIQUID_MOTION.settleThreshold) frame = requestAnimationFrame(tick);
    else { Object.assign(lead, destination); Object.assign(tail, destination); velocity.x = velocity.y = 0; render(); previousTime = 0; }
  };
  return {
    move(box: LiquidBox, instant = false) {
      destination = { ...box };
      if (!initialized || instant || reduced()) {
        stop(); Object.assign(lead, box); Object.assign(tail, box); render(); initialized = true;
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
