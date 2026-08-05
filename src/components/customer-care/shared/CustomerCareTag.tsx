import type { CustomerCareTag as CustomerCareTagType } from "@liora/api-types";

export function CustomerCareTag({ tag }: { tag: CustomerCareTagType }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </span>
  );
}
