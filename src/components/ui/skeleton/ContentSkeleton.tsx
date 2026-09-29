import Skeleton from "./Skeleton";

export type ContentSkeletonVariant =
  | "table"
  | "page-list"
  | "dashboard"
  | "detail"
  | "cards"
  | "profile"
  | "list"
  | "form";

type ContentSkeletonProps = {
  variant?: ContentSkeletonVariant;
  rows?: number;
  columns?: number;
  label?: string;
  className?: string;
};

const BAR_WIDTHS = ["w-16", "w-40", "w-24", "w-20", "w-14", "w-28", "w-12", "w-32"];

function barWidth(index: number) {
  return BAR_WIDTHS[index % BAR_WIDTHS.length];
}

export function SkeletonText({ className = "h-4 w-32" }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function SkeletonTableRows({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-b border-gray-100 dark:border-gray-800">
          {Array.from({ length: columns }).map((__, column) => (
            <td key={column} className="px-4 py-3">
              <Skeleton className={`h-4 max-w-full ${barWidth(row + column)}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TableBlock({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex gap-4 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className={`h-3 ${barWidth(index)}`} />
        ))}
      </div>
      <table className="w-full">
        <tbody>
          <SkeletonTableRows rows={rows} columns={columns} />
        </tbody>
      </table>
    </div>
  );
}

function PageListBlock({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="h-10 w-full max-w-sm" />
        <TableBlock rows={rows} columns={columns} />
      </div>
    </div>
  );
}

function DashboardBlock() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

function DetailBlock() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" rounded="lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className={`h-5 ${barWidth(index + 2)}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardsBlock() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12" rounded="lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileBlock() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20" rounded="full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <Skeleton className="h-3 w-20" />
            <Skeleton className={`h-4 ${barWidth(index)}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
        >
          <Skeleton className="h-10 w-10 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={`h-3 ${barWidth(index)}`} />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormBlock() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function ContentSkeleton({
  variant = "table",
  rows = 6,
  columns = 5,
  label = "Đang tải nội dung",
  className = "",
}: ContentSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        {variant === "table" ? <TableBlock rows={rows} columns={columns} /> : null}
        {variant === "page-list" ? <PageListBlock rows={rows} columns={columns} /> : null}
        {variant === "dashboard" ? <DashboardBlock /> : null}
        {variant === "detail" ? <DetailBlock /> : null}
        {variant === "cards" ? <CardsBlock /> : null}
        {variant === "profile" ? <ProfileBlock /> : null}
        {variant === "list" ? <ListBlock rows={rows} /> : null}
        {variant === "form" ? <FormBlock /> : null}
      </div>
    </div>
  );
}

export default ContentSkeleton;
