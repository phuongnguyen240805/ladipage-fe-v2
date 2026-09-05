"use client";

import React, { useMemo, useState } from "react";

import {
  CommerceField,
  CommerceModal,
} from "@/features/commerce/components/CommerceModal";
import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommercePromotions } from "@/features/commerce/hooks/useCommercePromotions";
import type {
  CommercePromotion,
  CommercePromotionStatus,
  CommercePromotionType,
} from "@/features/commerce/types";
import {
  formatCommerceDate,
  formatCommerceMoney,
} from "@/features/commerce/utils/format-money";

type PromoDraft = {
  id: string | null;
  code: string;
  type: CommercePromotionType;
  value: string;
  minOrder: string;
  startAt: string;
  endAt: string;
  status: CommercePromotionStatus;
};

/** ISO string → yyyy-MM-dd for date input. */
function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}
/** yyyy-MM-dd → ISO (start of day UTC). */
function fromDateInput(d: string): string {
  return d ? `${d}T00:00:00.000Z` : "";
}

function statusMeta(status: CommercePromotionStatus) {
  switch (status) {
    case "active":
      return {
        label: "Đang chạy",
        style:
          "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40",
      };
    case "scheduled":
      return {
        label: "Đã lên lịch",
        style:
          "text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40",
      };
    case "expired":
      return {
        label: "Hết hạn",
        style:
          "text-slate-600 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800",
      };
  }
}

export function MedusaPromotionsList() {
  const { canManageStore, canReadOrders } = useCommerceAccess();
  const { promotions, savePromotion, deletePromotion } =
    useCommercePromotions();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<PromoDraft | null>(null);

  const openCreate = () =>
    setDraft({
      id: null,
      code: "",
      type: "percentage",
      value: "10",
      minOrder: "0",
      startAt: "",
      endAt: "",
      status: "active",
    });
  const openEdit = (p: CommercePromotion) =>
    setDraft({
      id: p.id,
      code: p.code,
      type: p.type,
      value: String(p.value),
      minOrder: String(p.minOrder),
      startAt: toDateInput(p.startAt),
      endAt: toDateInput(p.endAt),
      status: p.status,
    });

  const saveDraft = async () => {
    if (!draft || !draft.code.trim()) return;
    const payload = {
      code: draft.code,
      type: draft.type,
      value: Number(draft.value) || 0,
      minOrder: Number(draft.minOrder) || 0,
      startAt: fromDateInput(draft.startAt) || new Date().toISOString(),
      endAt: fromDateInput(draft.endAt) || new Date().toISOString(),
      status: draft.status,
    };
    if (draft.id) {
      await savePromotion(draft.id, payload);
    } else {
      await savePromotion(undefined, payload);
    }
    setDraft(null);
  };

  const removePromo = async (p: CommercePromotion) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(`Xóa mã “${p.code}”?`)
    ) {
      await deletePromotion(p.id);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promotions.filter((p) =>
      q ? p.code.toLowerCase().includes(q) : true,
    );
  }, [promotions, search]);

  // Xem khuyến mãi: cho phép khi đọc đơn hoặc quản trị cửa hàng.
  if (!canManageStore && !canReadOrders) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem khuyến mãi"
          description="Cần quyền commerce:store:manage hoặc commerce:order:read."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Khuyến mãi cửa hàng online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Mock promotion Medusa · áp trên giỏ hàng
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
        Lưu ý: mã giảm chỉ áp một engine trên giỏ Medusa — không dùng đồng thời
        với OfferKit để tránh giảm giá chồng.
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã…"
          className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
        />
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
          {rows.length} mã
        </span>
        {canManageStore && (
          <button
            type="button"
            onClick={openCreate}
            className="ml-auto px-3 py-2 rounded-lg text-sm font-medium text-white bg-lime-500 hover:bg-brand-600 cursor-pointer whitespace-nowrap"
          >
            + Khuyến mãi
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-bold">Mã</th>
              <th className="px-4 py-3 font-bold">Giảm</th>
              <th className="px-4 py-3 font-bold">Đơn tối thiểu</th>
              <th className="px-4 py-3 font-bold">Thời gian</th>
              <th className="px-4 py-3 font-bold">Trạng thái</th>
              {canManageStore && (
                <th className="px-4 py-3 font-bold text-right">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Chưa có khuyến mãi.
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const st = statusMeta(p.status);
              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 dark:border-gray-800/80 hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-[#65a30d]">
                    {p.code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                    {p.type === "percentage"
                      ? `${p.value}%`
                      : formatCommerceMoney(p.value, p.currencyCode)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {p.minOrder > 0
                      ? formatCommerceMoney(p.minOrder, p.currencyCode)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatCommerceDate(p.startAt)} →{" "}
                    {formatCommerceDate(p.endAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`ladi-status-badge inline-flex items-center px-2 py-0.5 rounded-md ${st.style}`}
                    >
                      {st.label}
                    </span>
                  </td>
                  {canManageStore && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="text-[11px] font-bold text-[#65a30d] hover:underline cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => void removePromo(p)}
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {draft && (
        <CommerceModal
          title={draft.id ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
          subtitle="Mock promotion Medusa · áp trên giỏ"
          onClose={() => setDraft(null)}
          onSubmit={() => void saveDraft()}
          submitDisabled={!draft.code.trim()}
        >
          <CommerceField
            label="Mã giảm giá"
            value={draft.code}
            onChange={(v) => setDraft({ ...draft, code: v })}
            placeholder="VD: WELCOME10"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Loại giảm
              </label>
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    type: e.target.value as CommercePromotionType,
                  })
                }
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium focus:outline-none focus:border-lime-400"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
            <CommerceField
              label={draft.type === "percentage" ? "Giá trị (%)" : "Giá trị (đ)"}
              value={draft.value}
              onChange={(v) => setDraft({ ...draft, value: v })}
              type="number"
            />
          </div>
          <CommerceField
            label="Đơn tối thiểu (đ, 0 = không)"
            value={draft.minOrder}
            onChange={(v) => setDraft({ ...draft, minOrder: v })}
            type="number"
          />
          <div className="grid grid-cols-2 gap-3">
            <CommerceField
              label="Bắt đầu"
              value={draft.startAt}
              onChange={(v) => setDraft({ ...draft, startAt: v })}
              type="date"
            />
            <CommerceField
              label="Kết thúc"
              value={draft.endAt}
              onChange={(v) => setDraft({ ...draft, endAt: v })}
              type="date"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Trạng thái
            </label>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as CommercePromotionStatus,
                })
              }
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium focus:outline-none focus:border-lime-400"
            >
              <option value="active">Đang chạy</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </CommerceModal>
      )}
    </div>
  );
}
