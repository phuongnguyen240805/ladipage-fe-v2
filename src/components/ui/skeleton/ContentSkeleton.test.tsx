import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentSkeleton, SkeletonTableRows } from "./ContentSkeleton";

describe("ContentSkeleton", () => {
  it("announces loading and draws a shimmer layout", () => {
    const { container } = render(<ContentSkeleton label="Đang tải danh sách" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Đang tải danh sách")).toHaveClass("sr-only");
    expect(container.querySelectorAll(".ladi-skeleton").length).toBeGreaterThan(5);
  });

  it("draws one placeholder row for each requested table row", () => {
    const { container } = render(
      <table>
        <tbody>
          <SkeletonTableRows rows={3} columns={4} />
        </tbody>
      </table>,
    );

    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(container.querySelectorAll("tbody td")).toHaveLength(12);
    expect(container.querySelectorAll(".ladi-skeleton")).toHaveLength(12);
  });
});
