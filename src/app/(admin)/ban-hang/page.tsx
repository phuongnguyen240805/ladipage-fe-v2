"use client";

import React, { useMemo, useState } from "react";
import ApiState from "@/components/common/ApiState";
import { SalesSidebar } from "@/components/sales/sidebar/SalesSidebar";
import { OrdersList } from "@/components/sales/orders/OrdersList";
import {
  CreateOrderModal,
  type CreateOrderFormData,
} from "@/components/sales/orders/CreateOrderModal";
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
import { useEcomStaff } from "@/features/ecom/hooks/useEcomStaff";
import {
  findOrderIdByCode,
  useCreateOrder,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/ecom/hooks/useOrders";
import { useProducts } from "@/features/ecom/hooks/useProducts";
import { mapOrderStatusFilterToApi } from "@/features/ecom/order-list-params";

export default function BanHangPage() {
  const [activeSubTab, setActiveSubTab] = useState("orders");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const orderListParams = useMemo(
    () => ({
      pageSize: 50,
      status: mapOrderStatusFilterToApi(orderStatusFilter),
    }),
    [orderStatusFilter]
  );

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders(orderListParams);
  const productsQuery = useProducts({ pageSize: 100 });
  const staffQuery = useEcomStaff();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrderStatus();

  const orders = ordersData?.items ?? [];

  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku,
      })),
    [productsQuery.data?.items]
  );

  const handleCreateOrder = async (data: CreateOrderFormData) => {
    const hasAssignee = !!data.staffId;

    await createOrder.mutateAsync({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      paymentMethod: data.paymentMethod,
      notes: data.internalNote || undefined,
      source: data.salesChannel,
      assigneeId: hasAssignee ? data.staffId : null,
      assigneeName: hasAssignee ? data.staff : null,
      tagIds: data.tagIds,
      items: data.items,
    });
    setIsCreateModalOpen(false);
  };

  const resolveAndUpdate = async (
    ids: string[],
    status: "COMPLETED" | "SPAM"
  ) => {
    for (const code of ids) {
      const orderId = findOrderIdByCode(orders, code);
      if (orderId) {
        await updateOrderStatus.mutateAsync({ orderId, status });
      }
    }
  };

  const handleApproveOrders = (ids: string[]) => {
    void resolveAndUpdate(ids, "COMPLETED");
  };

  const handleMarkAsSpamOrders = (ids: string[]) => {
    void resolveAndUpdate(ids, "SPAM");
  };

  const handleDeleteOrders = (_ids: string[]) => {
    // DELETE /ecom/orders is not available in BE yet.
  };

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

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      <SalesSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {activeSubTab === "orders" ? (
          <ApiState isLoading={ordersLoading} error={ordersError}>
            <OrdersList
              orders={orders}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onApproveOrders={handleApproveOrders}
              onMarkAsSpamOrders={handleMarkAsSpamOrders}
              onDeleteOrders={handleDeleteOrders}
              canDeleteOrders={false}
              statusFilter={orderStatusFilter}
              onStatusFilterChange={setOrderStatusFilter}
            />
          </ApiState>
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
          <ComingSoon label="Tính năng đang phát triển" />
        )}
      </div>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrder={handleCreateOrder}
        products={products}
        staffOptions={staffQuery.data?.items}
        isSubmitting={createOrder.isPending}
      />
    </div>
  );
}