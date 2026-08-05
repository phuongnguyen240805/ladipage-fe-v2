export function CustomerCareSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
