import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { attachLiquidRuntime } from "./liquid-runtime";

it("preserves sign-in HTML while a root runtime starts before a delayed Suspense boundary hydrates", async () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  let ready = true;
  let resolve!: () => void;
  const gate = new Promise<void>((done) => { resolve = done; });
  function Runtime() { useEffect(() => attachLiquidRuntime(document, { tension: true }), []); return null; }
  function SignIn() {
    if (!ready) throw gate;
    return <main><Link href="/">Back</Link><button type="button">Captcha</button><div className="rounded-lg border bg-white">Google Sign In</div><p><Link href="/signup">Sign Up</Link></p></main>;
  }
  const page = <><Runtime /><Suspense fallback={<p>Loading</p>}><SignIn /></Suspense></>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(page); document.body.append(container);
  const server = container.querySelector("main")!.outerHTML;
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    ready = false;
    await act(async () => { root = hydrateRoot(container, page, { onRecoverableError: recoverable }); });
    expect(document.querySelector(".liquid-tension-plane")).toBeInTheDocument();
    expect(container.querySelector("main")!.outerHTML).toBe(server);
    expect(container.querySelector("[data-liquid-control], [data-liquid-surface]")).toBeNull();
    await act(async () => { ready = true; resolve(); await gate; });
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors.mock.calls.filter((args) => /hydrat|didn't match/i.test(String(args[0])))).toHaveLength(0);
    expect(container.querySelector("main")!.outerHTML).toBe(server);
  } finally {
    if (root) await act(async () => root!.unmount());
    container.remove(); errors.mockRestore(); vi.unstubAllGlobals();
  }
});
