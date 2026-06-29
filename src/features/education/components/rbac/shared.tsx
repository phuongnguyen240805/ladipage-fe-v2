import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import type { HttpMethod } from '@/features/education/types/rbac';

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  POST: 'bg-blue-100 text-blue-600 border-blue-200',
  PUT: 'bg-amber-100 text-amber-600 border-amber-200',
  PATCH: 'bg-purple-100 text-purple-600 border-purple-200',
  DELETE: 'bg-red-100 text-red-600 border-red-200',
};

export const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${METHOD_COLORS[method]}`}>
      {method}
    </span>
  );
}

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function UserTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
          <td className="py-3 px-4"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></td>
          <td className="py-3 px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </td>
          <td className="py-3 px-4"><div className="w-40 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
          <td className="py-3 px-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
          <td className="py-3 px-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
          <td className="py-3 px-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
          <td className="py-3 px-4 text-right"><div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse inline-block" /></td>
        </tr>
      ))}
    </>
  );
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function parseUserList(response: any): any[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data) {
    if (Array.isArray(response.data)) return response.data;
    if (response.data.content && Array.isArray(response.data.content)) return response.data.content;
  }
  if (response.content && Array.isArray(response.content)) return response.content;
  return [];
}

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

export function ActionMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        aria-label="Thao tác"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-8 z-50 min-w-[160px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 overflow-hidden"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function ActionMenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
