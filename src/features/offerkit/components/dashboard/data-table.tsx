/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck
"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { T } from "@/features/offerkit/lib/i18n";
import type React from "react";
import { Button } from "@/features/offerkit/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/offerkit/components/ui/table";
import { cn } from "@/features/offerkit/lib/utils";
import { SkeletonText } from "@/components/ui/skeleton/ContentSkeleton";

// The SDK currently exposes dashboard list rows as weakly typed objects in several pages.
 
export type DataTableRow = Record<string, any>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: React.ReactNode;
  pageSize?: number;
  getRowClassName?: (row: TData) => string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage,
  isLoading = false,
  loadingMessage = <T>Loading...</T>,
  pageSize = 10,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });
  const visibleRows = table.getRowModel().rows;
  const showPagination =
    !isLoading &&
    data.length > pageSize &&
    (table.getCanPreviousPage() || table.getCanNextPage());

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md border" aria-busy={isLoading || undefined}>
        {isLoading ? <span className="sr-only">{loadingMessage}</span> : null}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((__, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <SkeletonText
                        className={`h-4 ${["w-16", "w-36", "w-24", "w-20", "w-14"][(rowIndex + columnIndex) % 5]}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(getRowClassName?.(row.original))}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <T>Previous</T>
          </Button>
          <div className="text-sm text-muted-foreground">
            <T>Page</T> {table.getState().pagination.pageIndex + 1} <T>of</T>{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <T>Next</T>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
