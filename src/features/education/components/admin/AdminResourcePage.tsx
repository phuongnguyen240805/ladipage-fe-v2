"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Edit, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/features/education/components/ui/button";
import { Card, CardContent, CardHeader } from "@/features/education/components/ui/card";
import { DatePicker } from "@/features/education/components/ui/date-picker";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/education/components/ui/dialog";
import { Input } from "@/features/education/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/education/components/ui/select";
import ComboInput from "@/features/education/components/ui/ComboInput";
import { Label } from "@/features/education/components/ui/label";

type Api<T> = {
  getAll?: (params?: Record<string, any>) => Promise<T[]>;
  getPage?: (params?: Record<string, any>) => Promise<{ rows: T[]; total?: number }>;
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void>;
};

type FieldType = "text" | "number" | "date" | "boolean" | "textarea";

export type ResourceField<T> = {
  key: keyof T & string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export type ResourceColumn<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => ReactNode;
};

type AdminResourcePageProps<T extends Record<string, any>> = {
  title: string;
  description: string;
  api: Api<T>;
  idKey: keyof T & string;
  searchPlaceholder?: string;
  columns: ResourceColumn<T>[];
  fields?: ResourceField<T>[];
  initialForm?: Partial<T>;
  readOnly?: boolean;
  fieldOptions?: Record<string, { value: string; label: string }[]>;
};

function normalizeRows<T>(result: T[] | { rows: T[]; total?: number }) {
  return Array.isArray(result) ? result : result.rows;
}

function formatValue(value: unknown) {
  if (value === true) return "Đang hoạt động";
  if (value === false) return "Tạm dừng";
  if (Array.isArray(value)) return value.join(", ");
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

export function AdminResourcePage<T extends Record<string, any>>({
  title,
  description,
  api,
  idKey,
  searchPlaceholder = "Tìm kiếm...",
  columns,
  fields = [],
  initialForm = {},
  readOnly = false,
  fieldOptions,
}: AdminResourcePageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Partial<T>>(initialForm);

  const setFieldValue = (key: string, value: any) => {
    setForm((current) => {
      const next: any = { ...current, [key]: value };
      // If editing positions: when code is set and name empty, generate a name
      if (key === 'code') {
        // if fieldOptions contains a mapping for code, use its label as name
        const opts: { value: string; label: string }[] | undefined = (fieldOptions && (fieldOptions as any)['code']) || undefined;
        if (opts) {
          const found = opts.find((o) => o.value === String(value));
          if (found) {
            // prefer label (may include code prefix), extract human name after ' - ' if present
            const parts = found.label.split(' - ');
            next['name'] = parts.length > 1 ? parts.slice(1).join(' - ') : found.label;
          }
        } else if (!String(current['name'] ?? '').trim()) {
          // fallback: generate from code string
          const gen = String(value ?? '')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          if (gen) next['name'] = gen;
        }
      }
      return next;
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = api.getPage
        ? await api.getPage({ keyword: search || undefined, size: 200 })
        : await api.getAll?.({ keyword: search || undefined });
      setRows(normalizeRows(result || []));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Không thể tải ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(keyword)),
    );
  }, [rows, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm(row);
    setModalOpen(true);
  };

  const handleSave = async () => {
    for (const field of fields) {
      if (field.required && !String(form[field.key] ?? "").trim()) {
        toast.error(`Vui lòng nhập ${field.label.toLowerCase()}`);
        return;
      }
    }

    setSaving(true);
    try {
      if (editing) {
        await api.update?.(String(editing[idKey]), form);
        toast.success("Cập nhật thành công");
      } else {
        await api.create?.(form);
        toast.success("Tạo mới thành công");
      }
      setModalOpen(false);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: T) => {
    if (!confirm("Bạn chắc chắn muốn xóa bản ghi này?")) return;
    try {
      await api.delete?.(String(row[idKey]));
      toast.success("Đã xóa bản ghi");
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa bản ghi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          {!readOnly && api.create && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") load();
              }}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                    {columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 font-semibold">
                        {column.label}
                      </th>
                    ))}
                    {!readOnly && <th className="px-4 py-3 text-right font-semibold">Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr key="empty-row">
                      <td colSpan={columns.length + (readOnly ? 0 : 1)} className="px-4 py-12 text-center text-slate-500">
                        Chưa có dữ liệu phù hợp.
                       </td>
                    </tr>
                  ) : (
                    filtered.map((row, index) => (
                      <tr 
                        key={row[idKey] ? String(row[idKey]) : `row-${index}`} 
                        className="border-b hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                      >
                        {columns.map((column) => (
                          <td key={column.key} className="max-w-[260px] px-4 py-3 text-slate-700 dark:text-slate-200">
                            <span className="block truncate">
                              {column.render ? column.render(row) : formatValue(row[column.key])}
                            </span>
                          </td>
                        ))}
                        {!readOnly && (
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {api.update && (
                                <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {api.delete && (
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
               </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Chỉnh sửa ${title.toLowerCase()}` : `Thêm ${title.toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                <Label htmlFor={field.key}>{field.label}{field.required ? " *" : ""}</Label>
                {field.type === "boolean" ? (
                  <label className="mt-2 flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
                    <input
                      id={field.key}
                      type="checkbox"
                      checked={Boolean(form[field.key])}
                      onChange={(event) => setFieldValue(field.key, event.target.checked)}
                    />
                    Đang hoạt động
                  </label>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    value={String(form[field.key] ?? "")}
                    onChange={(event) => setFieldValue(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1.5 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    id={field.key}
                    value={String(form[field.key] ?? "")}
                    onChange={(value) => setFieldValue(field.key, value)}
                    placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}`}
                    className="mt-1.5"
                  />
                ) : field.options || (fieldOptions && fieldOptions[field.key]) ? (
                  <ComboInput
                    id={field.key}
                    value={String(form[field.key] ?? "")}
                    options={(field.options || (fieldOptions && fieldOptions[field.key]) || []) as { value: string; label: string }[]}
                    onChange={(v) => setFieldValue(field.key, v)}
                    placeholder={field.placeholder || "Chọn..."}
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "number" ? "number" : "text"}
                    value={String(form[field.key] ?? "")}
                    onChange={(event) => {
                      const value = field.type === "number" ? Number(event.target.value) : event.target.value;
                      setFieldValue(field.key, value);
                    }}
                    placeholder={field.placeholder}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
