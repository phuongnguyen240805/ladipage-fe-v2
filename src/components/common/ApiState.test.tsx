import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiState } from "./ApiState";

describe("ApiState", () => {
  it("shows a content skeleton while data is loading", () => {
    const { container } = render(
      <ApiState isLoading loadingLabel="Đang tải khách hàng">
        <p>Dữ liệu thật</p>
      </ApiState>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Đang tải khách hàng")).toBeInTheDocument();
    expect(screen.queryByText("Dữ liệu thật")).not.toBeInTheDocument();
    expect(container.querySelector(".ladi-skeleton")).toBeTruthy();
  });

  it("keeps the error message and renders children after loading", () => {
    const { rerender } = render(
      <ApiState error={new Error("Không tải được danh sách")}>
        <p>Dữ liệu thật</p>
      </ApiState>,
    );
    expect(screen.getByText("Không tải được danh sách")).toBeInTheDocument();

    rerender(
      <ApiState isLoading={false}>
        <p>Dữ liệu thật</p>
      </ApiState>,
    );
    expect(screen.getByText("Dữ liệu thật")).toBeInTheDocument();
  });
});
