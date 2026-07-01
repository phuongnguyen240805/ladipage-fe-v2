"use client";

import React, { useState } from "react";
import { ApiState } from "@/components/common/ApiState";
import {
  useCreateProduct,
  useDeleteProducts,
  useProducts,
} from "@/features/ecom/hooks/useProducts";
import { ChooseProductTypeModal } from "./ChooseProductTypeModal";
import { CreateProductDrawer } from "./CreateProductDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductStatus = "visible" | "hidden" | "out_of_stock";

type Product = {
  id: string;
  name: string;
  sku: string;
  type: string;
  typeName: string;
  status: ProductStatus;
  createdAt: string;
};

// ─── Products List Component ──────────────────────────────────────────────────
export const ProductsList: React.FC = () => {
  const { data, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProducts = useDeleteProducts();
  const products: Product[] = data?.items ?? [];
  const [activeTab, setActiveTab] = useState<"all" | "visible" | "hidden" | "out_of_stock">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isChooseTypeOpen, setIsChooseTypeOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState({ id: "digital", name: "Sản phẩm số" });

  const [toastMessage, setToastMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Handle type selection → open drawer
  const handleChooseType = (typeId: string, typeName: string) => {
    setSelectedType({ id: typeId, name: typeName });
    setIsChooseTypeOpen(false);
    setIsDrawerOpen(true);
  };

  // Handle product save from drawer
  const handleSaveProduct = async (data: {
    name: string;
    sku: string;
    type: string;
    typeName: string;
    description?: string;
    categoryId?: number;
    tagIds?: number[];
  }) => {
    await createProduct.mutateAsync(data);
    setIsDrawerOpen(false);
    triggerToast(`Đã tạo sản phẩm "${data.name}" thành công!`);
  };

  const handleDeleteProducts = async (ids: string[]) => {
    await deleteProducts.mutateAsync(ids.map(Number));
    setSelectedIds([]);
    triggerToast(`Đã xóa ${ids.length} sản phẩm`);
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    if (activeTab === "visible" && p.status !== "visible") return false;
    if (activeTab === "hidden" && p.status !== "hidden") return false;
    if (activeTab === "out_of_stock" && p.status !== "out_of_stock") return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    return true;
  });

  const tabs = [
    { key: "all",          label: "Tất cả" },
    { key: "visible",      label: "Đang hiển thị" },
    { key: "hidden",       label: "Đang ẩn" },
    { key: "out_of_stock", label: "Hết hàng" },
  ];

  // Select-all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const getStatusInfo = (status: ProductStatus) => {
    switch (status) {
      case "visible":
        return { label: "Đang hiển thị", style: "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40" };
      case "hidden":
        return { label: "Đang ẩn", style: "text-slate-700 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800" };
      case "out_of_stock":
        return { label: "Hết hàng", style: "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40" };
    }
  };

  return (
    <ApiState isLoading={isLoading} error={error}>
    <div className="space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Sản phẩm
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý danh sách sản phẩm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Import/Export */}
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-gray-200 dark:text-slate-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/70 rounded-lg shadow-2xs transition cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            Nhập/Xuất dữ liệu
          </button>
          {/* Create product → open type chooser */}
          <button
            onClick={() => setIsChooseTypeOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
          >
            + Tạo sản phẩm
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850 overflow-x-auto">
        <div className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 rounded-t-lg cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-lime-500 text-lime-500 bg-lime-50/40 dark:bg-lime-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-205 dark:border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              <option value="all">Tất cả loại</option>
              <option value="physical">Sản phẩm vật lý</option>
              <option value="digital">Sản phẩm số</option>
              <option value="event">Sự kiện</option>
              <option value="service">Dịch vụ</option>
              <option value="combo">Combo</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </span>
          </div>
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-205 dark:border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-400 focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đang ẩn</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer" title="Tìm kiếm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer" title="Cột hiển thị">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer" title="Bộ lọc">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-lime-50/60 dark:bg-lime-950/20 border border-lime-100 dark:border-lime-900/40 rounded-xl animate-fade-in">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Đã chọn <strong className="text-lime-500">{selectedIds.length}</strong> sản phẩm
          </span>
          <button
            onClick={() => handleDeleteProducts(selectedIds)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition cursor-pointer"
          >
            Xóa
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px] justify-between">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Tên sản phẩm</th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Loại</th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">SKU</th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Trạng thái</th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200">Ngày tạo</th>
                <th className="py-3.5 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const statusInfo = getStatusInfo(p.status);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/40 dark:hover:bg-gray-800/10 transition ${isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""}`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-lime-500 cursor-pointer">
                          {p.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{p.typeName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-[11px] font-mono font-bold text-lime-500 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30 px-2 py-0.5 rounded">
                          {p.sku}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md tracking-wider uppercase inline-block ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {p.createdAt}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteProducts([p.id])}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-24 text-center select-none">
                    <p className="text-sm font-semibold text-lime-500 dark:text-lime-400">
                      Chưa có sản phẩm khớp với bộ lọc
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-850 p-4 bg-gray-50/20 dark:bg-gray-900/10">
            <span className="text-[13px] text-slate-450 dark:text-slate-500 font-medium">
              Hiển thị 1-{filteredProducts.length} trên {filteredProducts.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 cursor-pointer hover:text-slate-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
              </button>
              <button className="flex items-center justify-center w-7 h-7 rounded-md bg-lime-500 text-white font-bold text-xs cursor-pointer">1</button>
              <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 cursor-pointer hover:text-slate-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <ChooseProductTypeModal
        isOpen={isChooseTypeOpen}
        onClose={() => setIsChooseTypeOpen(false)}
        onChoose={handleChooseType}
      />

      <CreateProductDrawer
        isOpen={isDrawerOpen}
        productType={selectedType.id}
        productTypeName={selectedType.name}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-[220px] animate-slide-in-right text-xs font-bold">
          {toastMessage}
        </div>
      )}
    </div>
    </ApiState>
  );
};
