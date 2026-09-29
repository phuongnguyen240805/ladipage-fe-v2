import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./data-table";

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "status", header: "Trạng thái" },
];

describe("DataTable loading", () => {
  it("keeps the real column headers and fills the body with skeleton cells", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} isLoading emptyMessage="Trống" />,
    );

    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Trạng thái")).toBeInTheDocument();
    expect(screen.queryByText("Trống")).not.toBeInTheDocument();
    expect(container.querySelectorAll("tbody .ladi-skeleton").length).toBeGreaterThanOrEqual(6);
    expect(container.querySelector("[aria-busy='true']")).toBeTruthy();
  });
});
