"use client";

import type { CustomerCareConversation } from "@liora/api-types";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ContactRound,
  ImagePlus,
  MapPin,
  PackageOpen,
  Plus,
  Search,
  ShoppingCart,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

export function CustomerDetailPanel({
  conversation,
  open,
  onClose,
}: {
  conversation: CustomerCareConversation | null;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"info" | "order">("info");
  const [freeShipping, setFreeShipping] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(false);

  if (!conversation || !open) return null;
  const customer = conversation.customer;

  return (
    <aside className="absolute inset-y-0 right-0 z-40 flex w-[360px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#11151c] xl:static xl:z-auto xl:w-[360px] xl:shrink-0 xl:shadow-none 2xl:w-[400px]">
      <div className="relative flex h-[52px] shrink-0 items-end border-b border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => setTab("info")}
          className={`relative flex h-full flex-1 items-center justify-center text-sm font-semibold transition ${
            tab === "info"
              ? "text-lime-700 dark:text-lime-300"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Thông tin
          {tab === "info" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-lime-500" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("order")}
          className={`relative flex h-full flex-1 items-center justify-center text-sm font-semibold transition ${
            tab === "order"
              ? "text-lime-700 dark:text-lime-300"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Tạo đơn
          {tab === "order" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-lime-500" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng thông tin"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 xl:hidden dark:hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {tab === "info" ? (
        // <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        //   <PanelTitle icon={<ContactRound className="h-4 w-4" />} title="Khách hàng" />

        //   <div className="space-y-2 border-b border-slate-200 p-3 dark:border-white/10">
        //     <div className="grid grid-cols-2 gap-2">
        //       <CompactInput defaultValue={customer.name} placeholder="Tên khách hàng" />
        //       <CompactInput defaultValue={customer.phone} placeholder="Số điện thoại" />
        //     </div>
        //     <CompactInput defaultValue={customer.location} placeholder="Địa chỉ" />
        //     <button
        //       type="button"
        //       className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-500 transition hover:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        //     >
        //       <MapPin className="h-4 w-4" />
        //       <span className="flex-1 truncate">Chọn địa chỉ giao hàng</span>
        //       <ChevronDown className="h-4 w-4" />
        //     </button>
        //     <button
        //       type="button"
        //       className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 px-2 text-left transition hover:border-lime-400 dark:border-white/10"
        //     >
        //       <img
        //         src={customer.avatar}
        //         alt=""
        //         className="h-8 w-8 rounded-full object-cover"
        //       />
        //       <span className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
        //         {conversation.assignee?.name ?? "Chưa phân công"}
        //       </span>
        //       <ChevronDown className="h-4 w-4 text-slate-400" />
        //     </button>
        //   </div>

        //   <section className="border-b border-slate-200 dark:border-white/10">
        //     <div className="flex h-12 items-center justify-between px-3">
        //       <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
        //         <ShoppingCart className="h-4 w-4" /> Sản phẩm
        //       </div>
        //       <button
        //         type="button"
        //         className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-600 dark:text-lime-300"
        //       >
        //         Kho mặc định <ChevronRight className="h-4 w-4" />
        //       </button>
        //     </div>

        //     <div className="mx-3 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
        //       <div className="grid grid-cols-[1fr_50px_80px_90px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        //         <span>Tên SP</span>
        //         <span className="text-center">SL: 0</span>
        //         <span className="text-right">Đơn giá</span>
        //         <span className="text-right">Thành tiền</span>
        //       </div>
        //       <div className="flex min-h-[112px] flex-col items-center justify-center gap-2 text-slate-400">
        //         <PackageOpen className="h-10 w-10" />
        //         <span className="text-xs">Chưa có sản phẩm nào</span>
        //       </div>
        //     </div>

        //     <div className="flex items-center gap-2 p-3">
        //       <label className="relative min-w-0 flex-1">
        //         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        //         <input
        //           placeholder="Tìm kiếm sản phẩm"
        //           className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
        //         />
        //       </label>
        //       <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
        //         Combo
        //       </span>
        //       <button
        //         type="button"
        //         title="Thêm sản phẩm"
        //         className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500 text-white shadow-sm transition hover:bg-lime-600"
        //       >
        //         <Plus className="h-5 w-5" />
        //       </button>
        //     </div>
        //   </section>

        //   <section>
        //     <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 dark:border-white/10">
        //       <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
        //         <WalletCards className="h-4 w-4" /> Thanh toán
        //       </div>
        //       <button
        //         type="button"
        //         className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-600 dark:text-lime-300"
        //       >
        //         Thêm hình thức <ChevronRight className="h-4 w-4" />
        //       </button>
        //     </div>

        //     <div className="grid grid-cols-2 gap-3 px-3 py-3 text-xs text-slate-700 dark:text-slate-300">
        //       <CheckOption
        //         checked={freeShipping}
        //         onChange={setFreeShipping}
        //         label="Miễn phí giao hàng"
        //       />
        //       <CheckOption
        //         checked={bankTransfer}
        //         onChange={setBankTransfer}
        //         label="Chuyển khoản"
        //       />
        //     </div>

        //     <div className="space-y-2 border-y border-slate-200 px-3 py-3 text-xs dark:border-white/10">
        //       <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
        //         <span>Tổng giá trị đơn hàng</span>
        //         <strong className="text-slate-900 dark:text-white">0 đ</strong>
        //       </div>
        //       <div className="flex items-center justify-between text-slate-500">
        //         <span>Khách cần trả</span>
        //         <strong className="text-base text-lime-600">0 đ</strong>
        //       </div>
        //     </div>

        //     <div className="grid grid-cols-[1fr_1.4fr] gap-2 p-3">
        //       <button
        //         type="button"
        //         className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        //       >
        //         Thiết lập lại
        //       </button>
        //       <button
        //         type="button"
        //         className="h-10 rounded-lg bg-lime-500 text-xs font-bold text-white shadow-sm transition hover:bg-lime-600"
        //       >
        //         Tạo đơn
        //       </button>
        //     </div>
        //   </section>
        // </div>
        <OrderHistory conversation={conversation} onCreateOrder={() => setTab("order")} />
      ) : (
        // <OrderHistory conversation={conversation} onCreateOrder={() => setTab("info")} />
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <PanelTitle icon={<ContactRound className="h-4 w-4" />} title="Khách hàng" />

          <div className="space-y-2 border-b border-slate-200 p-3 dark:border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <CompactInput defaultValue={customer.name} placeholder="Tên khách hàng" />
              <CompactInput defaultValue={customer.phone} placeholder="Số điện thoại" />
            </div>
            <CompactInput defaultValue={customer.location} placeholder="Địa chỉ" />
            <button
              type="button"
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-500 transition hover:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <MapPin className="h-4 w-4" />
              <span className="flex-1 truncate">Chọn địa chỉ giao hàng</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 px-2 text-left transition hover:border-lime-400 dark:border-white/10"
            >
              <img
                src={customer.avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                {conversation.assignee?.name ?? "Chưa phân công"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <section className="border-b border-slate-200 dark:border-white/10">
            <div className="flex h-12 items-center justify-between px-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                <ShoppingCart className="h-4 w-4" /> Sản phẩm
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-600 dark:text-lime-300"
              >
                Kho mặc định <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-3 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-[1fr_50px_80px_90px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span>Tên SP</span>
                <span className="text-center">SL: 0</span>
                <span className="text-right">Đơn giá</span>
                <span className="text-right">Thành tiền</span>
              </div>
              <div className="flex min-h-[112px] flex-col items-center justify-center gap-2 text-slate-400">
                <PackageOpen className="h-10 w-10" />
                <span className="text-xs">Chưa có sản phẩm nào</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Tìm kiếm sản phẩm"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </label>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                Combo
              </span>
              <button
                type="button"
                title="Thêm sản phẩm"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500 text-white shadow-sm transition hover:bg-lime-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                <WalletCards className="h-4 w-4" /> Thanh toán
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-600 dark:text-lime-300"
              >
                Thêm hình thức <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-3 py-3 text-xs text-slate-700 dark:text-slate-300">
              <CheckOption
                checked={freeShipping}
                onChange={setFreeShipping}
                label="Miễn phí giao hàng"
              />
              <CheckOption
                checked={bankTransfer}
                onChange={setBankTransfer}
                label="Chuyển khoản"
              />
            </div>

            <div className="space-y-2 border-y border-slate-200 px-3 py-3 text-xs dark:border-white/10">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Tổng giá trị đơn hàng</span>
                <strong className="text-slate-900 dark:text-white">0 đ</strong>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Khách cần trả</span>
                <strong className="text-base text-lime-600">0 đ</strong>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1.4fr] gap-2 p-3">
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                Thiết lập lại
              </button>
              <button
                type="button"
                className="h-10 rounded-lg bg-lime-500 text-xs font-bold text-white shadow-sm transition hover:bg-lime-600"
              >
                Tạo đơn
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}

function PanelTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex h-12 items-center gap-2 border-b border-slate-200 px-3 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white">
      {icon}
      {title}
    </div>
  );
}

function CompactInput({
  defaultValue,
  placeholder,
}: {
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:border-lime-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500/50"
    />
  );
}

function CheckOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-lime-500"
      />
      <span>{label}</span>
    </label>
  );
}

function OrderHistory({
  conversation,
  onCreateOrder,
}: {
  conversation: CustomerCareConversation;
  onCreateOrder: () => void;
}) {
  return (
    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="p-3">
        <div className="flex min-h-[118px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
          <textarea
            placeholder="Nhập ghi chú (Enter để gửi)"
            className="min-h-16 flex-1 resize-none bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button
            type="button"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-lime-600 dark:hover:bg-white/5"
            title="Đính kèm hình ảnh"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-300">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        Đơn hàng
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5">
          <ClipboardList className="h-10 w-10" />
        </div>
        <h4 className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Chưa có lịch sử đơn hàng
        </h4>
        <p className="mt-2 text-xs text-slate-400">
          Tạo đơn mới cho {conversation.customer.name} ngay trong hội thoại.
        </p>
        <button
          type="button"
          onClick={onCreateOrder}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-lime-500 px-4 text-xs font-semibold text-lime-700 transition hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-500/10"
        >
          <Plus className="h-4 w-4" /> Tạo đơn
        </button>
      </div>
    </div>
  );
}
