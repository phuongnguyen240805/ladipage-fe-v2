import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FacebookAdsSurface from "./FacebookAdsSurface";

const themeState = vi.hoisted(() => ({ value: "light" as "light" | "dark" }));

vi.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({ theme: themeState.value, toggleTheme: vi.fn() }),
}));

describe("FacebookAdsSurface theme ownership", () => {
  afterEach(cleanup);
  beforeEach(() => {
    themeState.value = "light";
  });

  it("lets the LadiPage workspace follow the document light/dark mode", () => {
    const { container } = render(
      <FacebookAdsSurface surface="workspace">Workspace</FacebookAdsSurface>,
    );
    const surface = container.querySelector('[data-facebook-ads-surface="workspace"]');

    expect(surface).toHaveAttribute("data-ladipage-theme", "light");
    expect(surface).toHaveClass("bg-background", "text-foreground");
    expect(surface).not.toHaveClass("dark", "bg-slate-950", "text-slate-100");
  });

  it("uses the LadiPage dark theme instead of the operating-system preference", () => {
    themeState.value = "dark";
    const { container } = render(
      <FacebookAdsSurface surface="workspace">Workspace</FacebookAdsSurface>,
    );
    const surface = container.querySelector('[data-facebook-ads-surface="workspace"]');

    expect(surface).toHaveAttribute("data-ladipage-theme", "dark");
    expect(surface).toHaveClass("dark", "bg-slate-950", "text-slate-100");
  });

  it("keeps the extension surface on its isolated dark theme", () => {
    const { container } = render(
      <FacebookAdsSurface surface="extension">Extension</FacebookAdsSurface>,
    );
    const surface = container.querySelector('[data-facebook-ads-surface="extension"]');

    expect(surface).toHaveAttribute("data-ladipage-theme", "dark");
    expect(surface).toHaveClass("dark", "bg-slate-950", "text-slate-100");
  });
});
