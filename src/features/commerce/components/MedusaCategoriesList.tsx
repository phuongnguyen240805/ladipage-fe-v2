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
import type { CommerceCategory } from "@/features/commerce/types";

type CategoryDraft = {
  id: string | null;
  name: string;
  parentId: string | null;
  thumbnailUrl: string;
  visible: boolean;
};

const EMPTY_DRAFT: CategoryDraft = {
  id: null,
  name: "",
  parentId: null,
  thumbnailUrl: "",
  visible: true,
};

export function MedusaCategoriesList() {
  const { canReadProduct, canWriteProduct } = useCommerceAccess();
  const { categories, saveCategory, deleteCategory } = useCommerceCatalog();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);

  const openCreate = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (c: CommerceCategory) =>
    setDraft({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      thumbnailUrl: c.thumbnailUrl ?? "",
      visible: c.visible,
    });

  const saveDraft = async () => {
    if (!draft || !draft.name.trim()) return;
    if (draft.id) {
      await saveCategory(draft.id, {
        name: draft.name.trim(),
        parentId: draft.parentId,
        thumbnailUrl: draft.thumbnailUrl.trim() || null,
        visible: draft.visible,
      });
    } else {
      await saveCategory(undefined, {
        name: draft.name.trim(),
        parentId: draft.parentId,
        thumbnailUrl: draft.thumbnailUrl.trim() || null,
        visible: draft.visible,
      });
    }
    setDraft(null);
  };

  const removeCategory = async (c: CommerceCategory) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Xóa danh mục “${c.name}”?`)
    ) {
      await deleteCategory(c.id);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const nameById = new Map(categories.map((c) => [c.id, c.name]));
    return categories
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .map((c) => ({
        ...c,
        parentName: c.parentId ? nameById.get(c.parentId) ?? "—" : "—",
      }));
  }, [categories, search]);

  if (!canReadProduct) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem danh mục"
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
          Danh mục cửa hàng online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Mock danh mục Medusa · phân cấp cha-con
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm danh mục…"
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
        />
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {rows.length} danh mục
        </span>
        {canWriteProduct && (
          <button
            type="button"
            onClick={openCreate}
            className="ml-auto px-3 py-2 rounded-lg text-sm font-medium text-white bg-lime-500 hover:bg-brand-600 cursor-pointer whitespace-nowrap"
          >
            + Danh mục
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-bold">Tên danh mục</th>
              <th className="px-4 py-3 font-bold">Danh mục cha</th>
              <th className="px-4 py-3 font-bold">Số SP</th>
              <th className="px-4 py-3 font-bold">Hiển thị</th>
              {canWriteProduct && (
                <th className="px-4 py-3 font-bold text-right">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Chưa có danh mục.
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                      {c.thumbnailUrl ? (
                        <img
                          src={c.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          N/A
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {c.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  {c.parentName}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {c.productCount}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      c.visible
                        ? "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40"
                        : "text-slate-600 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800"
                    }`}
                  >
                    {c.visible ? "Hiển thị" : "Đang ẩn"}
                  </span>
                </td>
                {canWriteProduct && (
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-[11px] font-bold text-[#65a30d] hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeCategory(c)}
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
          title={draft.id ? "Sửa danh mục" : "Thêm danh mục"}
          subtitle="Mock danh mục Medusa"
          onClose={() => setDraft(null)}
          onSubmit={() => void saveDraft()}
          submitDisabled={!draft.name.trim()}
        >
          <CommerceField
            label="Tên danh mục"
            value={draft.name}
            onChange={(v) => setDraft({ ...draft, name: v })}
            placeholder="VD: Serum & Tinh chất"
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Danh mục cha
            </label>
            <select
              value={draft.parentId ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, parentId: e.target.value || null })
              }
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium focus:outline-none focus:border-lime-400"
            >
              <option value="">— Không có (cấp gốc) —</option>
              {categories
                .filter((c) => c.id !== draft.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <CommerceField
            label="Ảnh đại diện (URL)"
            value={draft.thumbnailUrl}
            onChange={(v) => setDraft({ ...draft, thumbnailUrl: v })}
            placeholder="/images/product/…"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
              className="w-4 h-4 accent-lime-500"
            />
            Hiển thị danh mục
          </label>
        </CommerceModal>
      )}
    </div>
  );
}
