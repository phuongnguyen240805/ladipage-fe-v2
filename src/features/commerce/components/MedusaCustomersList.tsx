"use client";

import React, { useMemo, useState } from "react";
import {
  CommerceField,
  CommerceModal,
} from "@/features/commerce/components/CommerceModal";
import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceCustomers } from "@/features/commerce/hooks/useCommerceCustomers";
import {
  formatCommerceDate,
  formatCommerceMoney,
} from "@/features/commerce/utils/format-money";

type Draft = { id?: string; name: string; email: string; phone: string };

export function MedusaCustomersList() {
  const { canReadOrders, canManageStore } = useCommerceAccess();
  const {
    customers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    useApi,
  } = useCommerceCustomers();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) =>
      !query
      || customer.name.toLowerCase().includes(query)
      || customer.email.toLowerCase().includes(query)
      || customer.phone.toLowerCase().includes(query),
    );
  }, [customers, search]);

  if (!canReadOrders) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState
          title="Không có quyền xem khách hàng"
          description="Cần quyền commerce:order:read."
        />
      </div>
    );
  }

  const save = async () => {
    if (!draft?.name.trim() || !draft.email.trim()) return;
    const [firstName, ...lastName] = draft.name.trim().split(/\s+/);
    const body = useApi
      ? {
          first_name: firstName,
          last_name: lastName.join(" "),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
        }
      : draft;
    if (draft.id) {
      if (useApi) await updateCustomer(draft.id, body);
      else {
        const { commerceMockStore } = await import(
          "@/features/commerce/mock/commerce-mock-store"
        );
        commerceMockStore.updateCustomer(draft.id, draft);
      }
    } else if (useApi) {
      await createCustomer(body);
    } else {
      const { commerceMockStore } = await import(
        "@/features/commerce/mock/commerce-mock-store"
      );
      commerceMockStore.createCustomer(draft);
    }
    setDraft(null);
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Xóa khách hàng “${name}”?`)) return;
    if (useApi) await deleteCustomer(id);
    else {
      const { commerceMockStore } = await import(
        "@/features/commerce/mock/commerce-mock-store"
      );
      commerceMockStore.deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-5 flex-1">
      <CommerceMockRoleBar />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            Khách hàng online
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {useApi ? "Dữ liệu Medusa qua Commerce API" : "Dữ liệu mock Medusa"}
          </p>
        </div>
        {canManageStore && (
          <button
            type="button"
            onClick={() => setDraft({ name: "", email: "", phone: "" })}
            className="px-3 py-2 rounded-lg bg-lime-500 text-white text-xs font-semibold"
          >
            + Thêm khách hàng
          </button>
        )}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Tìm tên, email, SĐT…"
        className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase text-slate-400">
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Liên hệ</th>
              <th className="px-4 py-3">Số đơn</th>
              <th className="px-4 py-3">Tổng chi tiêu</th>
              <th className="px-4 py-3">Tạo lúc</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-50 dark:border-gray-800/80">
                <td className="px-4 py-3 font-semibold">{customer.name}</td>
                <td className="px-4 py-3 text-xs">
                  <div>{customer.email}</div>
                  <div className="text-slate-400">{customer.phone}</div>
                </td>
                <td className="px-4 py-3">{customer.ordersCount}</td>
                <td className="px-4 py-3 font-semibold">
                  {formatCommerceMoney(customer.totalSpent, customer.currencyCode)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatCommerceDate(customer.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {canManageStore && (
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setDraft(customer)} className="text-xs font-semibold text-lime-600">
                        Sửa
                      </button>
                      <button type="button" onClick={() => void remove(customer.id, customer.name)} className="text-xs font-semibold text-red-500">
                        Xóa
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Chưa có khách hàng.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <CommerceModal
          title={draft.id ? "Sửa khách hàng" : "Thêm khách hàng"}
          onClose={() => setDraft(null)}
          onSubmit={() => void save()}
          submitLabel="Lưu khách hàng"
          submitDisabled={!draft.name.trim() || !draft.email.trim()}
        >
          <CommerceField label="Tên khách hàng" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} required />
          <CommerceField label="Email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} required />
          <CommerceField label="Số điện thoại" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
        </CommerceModal>
      )}
    </div>
  );
}
