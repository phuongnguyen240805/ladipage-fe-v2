"use client";

import React, { useMemo, useState } from "react";

import {
  CommerceField,
  CommerceModal,
} from "@/features/commerce/components/CommerceModal";
import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceCatalog } from "@/features/commerce/hooks/useCommerceCatalog";
import type { CommerceProductTag } from "@/features/commerce/types";

const TAG_COLORS = [
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

type TagDraft = { id: string | null; name: string; color: string };

export function MedusaProductTagsList() {
  const { canReadProduct, canWriteProduct } = useCommerceAccess();
  const { tags, saveTag, deleteTag } = useCommerceCatalog();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<TagDraft | null>(null);

  const openCreate = () =>
    setDraft({ id: null, name: "", color: TAG_COLORS[0] });
  const openEdit = (t: CommerceProductTag) =>
    setDraft({ id: t.id, name: t.name, color: t.color });

  const saveDraft = async () => {
    if (!draft || !draft.name.trim()) return;
    if (draft.id) {
      await saveTag(draft.id, {
        name: draft.name.trim(),
        color: draft.color,
      });
    } else {
      await saveTag(undefined, {
        name: draft.name.trim(),
        color: draft.color,
      });
    }
    setDraft(null);
  };

  const removeTag = async (t: CommerceProductTag) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Xóa tag “${t.name}”?`)
    ) {
      await deleteTag(t.id);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tags.filter((t) => (q ? t.name.toLowerCase().includes(q) : true));
  }, [tags, search]);

  if (!canReadProduct) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem tag"
          description="Cần quyền commerce:product:read."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Tag sản phẩm online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Mock tag Medusa · màu là metadata phía LadiPage
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tag…"
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
        />
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {rows.length} tag
        </span>
        {canWriteProduct && (
          <button
            type="button"
            onClick={openCreate}
            className="ml-auto px-3 py-2 rounded-lg text-sm font-medium text-white bg-lime-500 hover:bg-brand-600 cursor-pointer whitespace-nowrap"
          >
            + Tag
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-bold">Tag</th>
              <th className="px-4 py-3 font-bold">Màu</th>
              <th className="px-4 py-3 font-bold">Số SP</th>
              {canWriteProduct && (
                <th className="px-4 py-3 font-bold text-right">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Chưa có tag.
                </td>
              </tr>
            )}
            {rows.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: `${t.color}1a`,
                      color: t.color,
                    }}
                  >
                    {t.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs text-slate-500 font-mono">
                      {t.color}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {t.productCount}
                </td>
                {canWriteProduct && (
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="text-[11px] font-bold text-[#65a30d] hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeTag(t)}
                      className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <CommerceModal
          title={draft.id ? "Sửa tag" : "Thêm tag"}
          subtitle="Màu lưu ở LadiPage (Medusa tag không có màu)"
          onClose={() => setDraft(null)}
          onSubmit={() => void saveDraft()}
          submitDisabled={!draft.name.trim()}
        >
          <CommerceField
            label="Tên tag"
            value={draft.name}
            onChange={(v) => setDraft({ ...draft, name: v })}
            placeholder="VD: Bán chạy"
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Màu chip
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDraft({ ...draft, color })}
                  className={`w-7 h-7 rounded-full border-2 cursor-pointer transition ${
                    draft.color === color
                      ? "border-slate-800 dark:border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
            <div className="mt-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${draft.color}1a`,
                  color: draft.color,
                }}
              >
                {draft.name.trim() || "Xem trước"}
              </span>
            </div>
          </div>
        </CommerceModal>
      )}
    </div>
  );
}
