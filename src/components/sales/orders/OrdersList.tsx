import React, { useState } from "react";
import { OrderItem } from "../dung-chung/types";
import { IconSearch, IconX, IconDownload, IconFilter, IconLayout } from "../dung-chung/icons";

interface OrdersListProps {
  orders: OrderItem[];
  onOpenCreateModal: () => void;
  onApproveOrders: (ids: string[]) => void;
  onMarkAsSpamOrders: (ids: string[]) => void;
  onDeleteOrders: (ids: string[]) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  onOpenCreateModal,
  onApproveOrders,
  onMarkAsSpamOrders,
  onDeleteOrders,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, NOT_DELIVERED, UNPAID, SPAM
  const [showDateRange, setShowDateRange] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // 1. Search Query filter
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.productName.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // 2. Status Tab Filter
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return order.status === "PENDING";
    if (statusFilter === "UNPAID") return order.status === "UNPAID";
    if (statusFilter === "SPAM") return order.status === "SPAM";
    if (statusFilter === "NOT_DELIVERED") {
      // Not delivered yet means status is PENDING or UNPAID
      return order.status === "PENDING" || order.status === "UNPAID";
    }
    return true;
  });

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk action handlers
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    onApproveOrders(selectedIds);
    triggerToast(`Đã duyệt ${selectedIds.length} đơn hàng thành công!`);
    setSelectedIds([]);
  };

  const handleBulkSpam = () => {
    if (selectedIds.length === 0) return;
    onMarkAsSpamOrders(selectedIds);
    triggerToast(`Đã đánh dấu spam ${selectedIds.length} đơn hàng!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteOrders(selectedIds);
    triggerToast(`Đã xóa ${selectedIds.length} đơn hàng thành công!`);
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    triggerToast("Xuất Excel và đồng bộ dữ liệu thành công!");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setShowDateRange(false);
  };

  // Status mapping to VN label & Style
  const getStatusInfo = (status: OrderItem["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Chờ xử lý",
          style: "text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 font-extrabold",
        };
      case "SHIPPED":
        return {
          label: "Đã giao hàng",
          style: "text-lime-800 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/40 font-extrabold",
        };
      case "UNPAID":
        return {
          label: "Chưa thanh toán",
          style: "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40 font-extrabold",
        };
      case "SPAM":
        return {
          label: "Spam",
          style: "text-purple-800 bg-purple-100 dark:text-purple-300 dark:bg-purple-950/40 font-extrabold",
        };
      case "COMPLETED":
        return {
          label: "Đã duyệt",
          style: "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40 font-extrabold",
        };
      default:
        return {
          label: status,
          style: "text-slate-800 bg-slate-100 dark:text-slate-300 dark:bg-gray-800 font-extrabold",
        };
    }
  };

  return (
    <div className="space-y-6 flex-1">
      {/* Header Title with Subtitle & Blue Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Danh sách đơn hàng
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý và xử lý đơn hàng từ các kênh bán hàng của bạn.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-gray-200 dark:text-slate-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/70 rounded-lg shadow-2xs transition duration-150 cursor-pointer"
          >
            <IconDownload size={16} />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>+ Tạo đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Tabs list (Tất cả, Chờ xử lý, Chưa giao hàng, Chưa thanh toán, Spam) */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850 overflow-x-auto">
        <div className="flex space-x-1 py-1">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "PENDING", label: "Chờ xử lý" },
            { key: "NOT_DELIVERED", label: "Chưa giao hàng" },
            { key: "UNPAID", label: "Chưa thanh toán" },
            { key: "SPAM", label: "Spam" },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 rounded-t-lg cursor-pointer ${
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

      {/* Filters bar (Search and indicators) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Main Search Input */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn, khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>

        {/* Date filter & Columns display */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {showDateRange && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-50 dark:bg-lime-950/30 text-lime-600 dark:text-lime-200 border border-lime-100 dark:border-lime-900/50 rounded-lg text-xs font-bold">
              <span>📅 14/05/2026 – 13/06/2026</span>
              <button
                onClick={() => setShowDateRange(false)}
                className="text-lime-400 hover:text-lime-600 p-0.5 hover:bg-lime-50 dark:hover:bg-lime-900 rounded-full transition cursor-pointer"
              >
                <IconX size={12} />
              </button>
            </div>
          )}

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-gray-205 dark:text-slate-300 dark:border-gray-800 dark:hover:bg-gray-800/80 rounded-lg transition cursor-pointer">
            <IconFilter size={14} />
            <span>Bộ lọc</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-gray-205 dark:text-slate-300 dark:border-gray-800 dark:hover:bg-gray-800/80 rounded-lg transition cursor-pointer">
            <IconLayout size={14} />
            <span>Cột hiển thị</span>
          </button>
        </div>
      </div>

      {/* Bulk action action-bar if rows are selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-lime-50/60 dark:bg-lime-950/20 border border-lime-50 dark:border-lime-900/40 rounded-xl animate-fade-in select-none">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Đã chọn <strong className="text-lime-500 dark:text-lime-300">{selectedIds.length}</strong> đơn hàng</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Duyệt đơn
            </button>
            <button
              onClick={handleBulkSpam}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-gray-200 dark:text-slate-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Báo Spam
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Xóa đơn
            </button>
          </div>
        </div>
      )}

      {/* Orders Data List Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    className="w-4.5 h-4.5 rounded border-gray-305 text-lime-500 focus:ring-lime-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Khách hàng
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Sản phẩm
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Tổng tiền
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Trạng thái
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-4 w-16 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr
                      key={item.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10 ${
                        isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-305 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-white hover:text-lime-500 cursor-pointer">
                          {item.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {item.customerName}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            📞 {item.customerPhone}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate block">
                            {item.productName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                            Số lượng: {item.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {item.totalPrice.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] rounded-md tracking-wider uppercase inline-block ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.createdAt}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === "PENDING" && (
                            <button
                              onClick={() => {
                                onApproveOrders([item.id]);
                                triggerToast(`Đã duyệt đơn hàng ${item.id} thành công!`);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-lime-500 hover:bg-lime-600 rounded transition cursor-pointer"
                              title="Duyệt đơn hàng"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onDeleteOrders([item.id]);
                              triggerToast(`Đã xóa đơn ${item.id} thành công!`);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded transition cursor-pointer"
                            title="Xóa đơn"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty/Not found state */
                <tr>
                  <td colSpan={8} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                        <IconSearch size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Không tìm thấy đơn hàng nào
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc lọc theo bộ trạng thái khác để tìm kết quả.
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="px-4.5 py-1.5 border border-gray-200 dark:border-gray-850 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-350 shadow-2xs transition cursor-pointer"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-850 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-855 rounded-lg px-3 py-1.5 pr-8 text-[13px] font-medium text-slate-750 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-450">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
            <span className="text-[13px] text-slate-450 dark:text-slate-500 font-medium">
              Hiển thị 1-{filteredOrders.length} trên {filteredOrders.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md bg-lime-500 text-white font-semibold text-xs shadow-xs cursor-pointer">
              1
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-800 border border-slate-800 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-[200px] animate-slide-in-right text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
