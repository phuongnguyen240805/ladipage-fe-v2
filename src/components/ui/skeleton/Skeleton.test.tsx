import React from "react";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import Skeleton from "./Skeleton";

describe("Skeleton hydration", () => {
  it("preserves paragraph markup when loading metric values are server-rendered and hydrated", async () => {
    const content = <section><p><Skeleton className="h-9 w-24" /></p><p><Skeleton className="h-9 w-16" /></p></section>;
    const container = document.createElement("div");
    container.innerHTML = renderToString(content);
    document.body.append(container);
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      expect(container.querySelectorAll("section > p")).toHaveLength(2);
      expect(container.querySelectorAll("p > span.ladi-skeleton")).toHaveLength(2);
      expect(container.querySelector("p > span")).toHaveClass("block", "h-9", "w-24");
      expect(container.querySelector("p > span")).toHaveAttribute("aria-hidden", "true");
      await act(async () => { root = hydrateRoot(container, content, { onRecoverableError: recoverable }); });
      expect(recoverable).not.toHaveBeenCalled();
      await act(async () => { root!.render(<section><p>1248</p><p>+86</p></section>); });
      expect(container.querySelectorAll(".ladi-skeleton")).toHaveLength(0);
      expect(container.textContent).toBe("1248+86");
    } finally {
      if (root) await act(async () => root!.unmount());
      container.remove();
    }
  });
});
