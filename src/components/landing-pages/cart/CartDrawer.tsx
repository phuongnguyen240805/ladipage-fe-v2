"use client";

import React, { useState } from "react";
import { useCart } from "./CartContext";

/** Format số thành chuỗi giá tiền VNĐ */
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export const CartDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    totalItems,
    totalAmount,
    closeDrawer,
    removeFromCart,
    updateQuantity,
    openCheckout,
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-[998] transition-all duration-300"
        style={{
          backgroundColor: isDrawerOpen ? "rgba(0,0,0,0.45)" : "transparent",
          pointerEvents: isDrawerOpen ? "all" : "none",
          backdropFilter: isDrawerOpen ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[999] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out"
        style={{
          width: "min(420px, 100vw)",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛒</span>
            <h2 className="text-base font-bold text-gray-900">Giỏ hàng</h2>
            {totalItems > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="text-6xl opacity-30">🛒</div>
              <p className="text-gray-400 text-sm font-medium">Giỏ hàng trống</p>
              <p className="text-gray-300 text-xs">Thêm sản phẩm để bắt đầu mua sắm</p>
              <button
                onClick={closeDrawer}
                className="mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={() => removeFromCart(item.id)}
                onUpdateQty={(q) => updateQuantity(item.id, q)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tạm tính</span>
              <span className="text-sm font-bold text-gray-900">{formatVND(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phí vận chuyển</span>
              <span className="text-sm font-medium text-emerald-600">Miễn phí</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-base font-bold text-gray-900">Tổng cộng</span>
              <span className="text-lg font-black text-slate-900">{formatVND(totalAmount)}</span>
            </div>

            {/* Actions */}
            <button
              onClick={openCheckout}
              className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-700 active:scale-[0.98] transition-all duration-150"
            >
              Tiến hành thanh toán →
            </button>
            <button
              onClick={closeDrawer}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Cart Item Row ─────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: import("./CartContext").CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onRemove, onUpdateQty }) => {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{item.title}</h4>
          <button
            onClick={onRemove}
            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Xóa"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {item.badge && (
          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-600">
            {item.badge}
          </span>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold transition-colors"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-xs font-black text-gray-900">
              {(item.priceNum * item.quantity).toLocaleString("vi-VN")}đ
            </div>
            {item.oldPrice && (
              <div className="text-[9px] text-gray-400 line-through">{item.oldPrice}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
