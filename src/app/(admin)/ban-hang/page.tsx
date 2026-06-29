"use client";

import React, { useState } from "react";
import { OrderItem } from "@/components/sales/dung-chung/types";
import { SalesSidebar } from "@/components/sales/sidebar/SalesSidebar";
import { OrdersList } from "@/components/sales/orders/OrdersList";
import { CreateOrderModal } from "@/components/sales/orders/CreateOrderModal";
import { IncompleteOrders } from "@/components/sales/orders/IncompleteOrders";
import { DeliveryNotes } from "@/components/sales/orders/DeliveryNotes";
import { OrderTags } from "@/components/sales/orders/OrderTags";
import { OrderCustomFields } from "@/components/sales/orders/OrderCustomFields";
import { ProductsList } from "@/components/sales/products/ProductsList";
import { ProductCategories } from "@/components/sales/products/ProductCategories";
import { ProductTags } from "@/components/sales/products/ProductTags";
import { Inventory } from "@/components/sales/products/Inventory";
import { Reviews } from "@/components/sales/products/Reviews";
import { ProductCustomFields } from "@/components/sales/products/ProductCustomFields";

// ─── Mock initial data ──────────────────────────────────────────────────────
const initialOrders: OrderItem[] = [
  {
    id: "DH1001",
    customerName: "Nguyễn Văn An",
    customerPhone: "0901234567",
    customerEmail: "an.nv@gmail.com",
    productName: "Serum TikTok Shop Mỹ Phẩm (x2)",
    quantity: 2,
    totalPrice: 700000,
    status: "PENDING",
    createdAt: "09:15, 13/06/2026",
  },
  {
    id: "DH1002",
    customerName: "Trần Thị Bình",
    customerPhone: "0912345678",
    customerEmail: "binh.tt@gmail.com",
    productName: "Đồng hồ thông minh Smartwatch Pro (x1)",
    quantity: 1,
    totalPrice: 1250000,
    status: "SHIPPED",
    createdAt: "10:30, 13/06/2026",
  },
  {
    id: "DH1003",
    customerName: "Lê Quang Cường",
    customerPhone: "0923456789",
    customerEmail: "",
    productName: "Trà thảo mộc Linh Chi Đông Trùng (x3)",
    quantity: 3,
    totalPrice: 540000,
    status: "UNPAID",
    createdAt: "11:00, 13/06/2026",
  },
  {
    id: "DH1004",
    customerName: "Phạm Thị Diệu",
    customerPhone: "0934567890",
    customerEmail: "dieu.pt@gmail.com",
    productName: "Serum TikTok Shop Mỹ Phẩm (x1)",
    quantity: 1,
    totalPrice: 350000,
    status: "COMPLETED",
    createdAt: "12:45, 13/06/2026",
  },
  {
    id: "DH1005",
    customerName: "Hoàng Minh Đức",
    customerPhone: "0945678901",
    customerEmail: "",
    productName: "Đồng hồ thông minh Smartwatch Pro (x2)",
    quantity: 2,
    totalPrice: 2500000,
    status: "SPAM",
    createdAt: "14:20, 13/06/2026",
  },
  {
    id: "DH1006",
    customerName: "Vũ Thị Hương",
    customerPhone: "0956789012",
    customerEmail: "huong.vt@gmail.com",
    productName: "Trà thảo mộc Linh Chi Đông Trùng (x1), Serum TikTok Shop Mỹ Phẩm (x1)",
    quantity: 2,
    totalPrice: 530000,
    status: "PENDING",
    createdAt: "15:10, 13/06/2026",
  },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function BanHangPage() {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [activeSubTab, setActiveSubTab] = useState("orders");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreateOrder = (data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    paymentMethod: string;
  }) => {
    const newOrder: OrderItem = {
      id: "DH" + (1000 + orders.length + 1),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      productName: data.productName,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      status: "PENDING",
      createdAt:
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        ", " +
        new Date().toLocaleDateString("vi-VN"),
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleApproveOrders = (ids: string[]) => {
    setOrders((prev) =>
      prev.map((order) =>
        ids.includes(order.id) ? { ...order, status: "COMPLETED" } : order
      )
    );
  };

  const handleMarkAsSpamOrders = (ids: string[]) => {
    setOrders((prev) =>
      prev.map((order) =>
        ids.includes(order.id) ? { ...order, status: "SPAM" } : order
      )
    );
  };

  const handleDeleteOrders = (ids: string[]) => {
    setOrders((prev) => prev.filter((order) => !ids.includes(order.id)));
  };

  // ─── Coming soon stub (for remaining sub-tabs) ───────────────────────────
  const ComingSoon = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center flex-1 py-32 select-none space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-200 dark:border-gray-800 text-2xl">
        🚧
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">{label}</h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs text-center font-medium">
        Tính năng này đang được phát triển. Vui lòng quay lại sau.
      </p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. Secondary Sub-Sidebar (Sales navigation) */}
      <SalesSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {activeSubTab === "orders" ? (
          <OrdersList
            orders={orders}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onApproveOrders={handleApproveOrders}
            onMarkAsSpamOrders={handleMarkAsSpamOrders}
            onDeleteOrders={handleDeleteOrders}
          />
        ) : activeSubTab === "incomplete" ? (
          <IncompleteOrders />
        ) : activeSubTab === "deliveries" ? (
          <DeliveryNotes />
        ) : activeSubTab === "order-tags" ? (
          <OrderTags />
        ) : activeSubTab === "order-custom-fields" ? (
          <OrderCustomFields />
        ) : activeSubTab === "products" ? (
          <ProductsList />
        ) : activeSubTab === "categories" ? (
          <ProductCategories />
        ) : activeSubTab === "product-tags" ? (
          <ProductTags />
        ) : activeSubTab === "inventory" ? (
          <Inventory />
        ) : activeSubTab === "reviews" ? (
          <Reviews />
        ) : activeSubTab === "product-custom-fields" ? (
          <ProductCustomFields />
        ) : (
          <OrdersList
            orders={orders}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onApproveOrders={handleApproveOrders}
            onMarkAsSpamOrders={handleMarkAsSpamOrders}
            onDeleteOrders={handleDeleteOrders}
          />
        )}
      </div>

      {/* 3. Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}
