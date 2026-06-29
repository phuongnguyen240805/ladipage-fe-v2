import React, { useState } from "react";
import { CustomerItem } from "../dung-chung/types";
import { IconSearch, IconX, IconDownload } from "../dung-chung/icons";

interface CustomersListProps {
  customers: CustomerItem[];
  onAddCustomer: (customer: Omit<CustomerItem, "id" | "createdAt">) => void;
  onDeleteCustomers: (ids: string[]) => void;
  onUpdateStatus: (ids: string[], status: "ACTIVE" | "BLOCKED") => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  onAddCustomer,
  onDeleteCustomers,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form states for new customer
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "BLOCKED">("ACTIVE");
  const [newSegment, setNewSegment] = useState("");
  const [newTagsString, setNewTagsString] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.tags.some((t) => t.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCustomers.map((c) => c.id));
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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteCustomers(selectedIds);
    triggerToast(`Đã xóa ${selectedIds.length} khách hàng thành công!`);
    setSelectedIds([]);
  };

  const handleBulkUpdateStatus = (status: "ACTIVE" | "BLOCKED") => {
    if (selectedIds.length === 0) return;
    onUpdateStatus(selectedIds, status);
    triggerToast(
      `Đã ${status === "ACTIVE" ? "mở khóa" : "chặn"} ${
        selectedIds.length
      } khách hàng!`
    );
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    triggerToast("Xuất danh sách khách hàng ra Excel thành công!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      triggerToast("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
      return;
    }

    const tags = newTagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    onAddCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      status: newStatus,
      segment: newSegment.trim() || undefined,
      tags,
    });

    triggerToast("Thêm khách hàng mới thành công!");
    setIsAddModalOpen(false);

    // Reset Form
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewStatus("ACTIVE");
    setNewSegment("");
    setNewTagsString("");
  };

  return (
    <div className="space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Danh sách khách hàng
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Xem và quản lý tất cả thông tin khách hàng từ các kênh liên hệ.
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
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>+ Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-150 dark:border-gray-850 overflow-x-auto">
        <div className="flex space-x-1 py-1">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "ACTIVE", label: "Hoạt động" },
            { key: "BLOCKED", label: "Đã chặn" },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
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

      {/* Search Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại, email, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>
      </div>

      {/* Bulk action */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-lime-50/60 dark:bg-lime-950/20 border border-lime-50 dark:border-lime-900/40 rounded-xl animate-fade-in select-none">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Đã chọn <strong className="text-lime-500 dark:text-lime-300">{selectedIds.length}</strong> khách hàng</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleBulkUpdateStatus("ACTIVE")}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Hoạt động
            </button>
            <button
              onClick={() => handleBulkUpdateStatus("BLOCKED")}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-gray-200 dark:text-slate-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Chặn
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition cursor-pointer"
            >
              Xóa khách hàng
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                    className="w-4.5 h-4.5 rounded border-gray-305 text-lime-500 focus:ring-lime-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Mã KH
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Họ và tên
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Liên hệ
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Segment
                </th>
                <th className="py-3.5 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Nhãn
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
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
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
                      <td className="py-4 px-4 text-xs font-bold text-slate-800 dark:text-white">
                        {item.id}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col space-y-0.5">
                          <span>📞 {item.phone}</span>
                          {item.email && <span className="text-[10px] text-slate-400">{item.email}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 dark:text-slate-400 font-medium">
                        {item.segment || <span className="text-slate-350">-</span>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {item.tags.length > 0 ? (
                            item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[9px] font-bold text-lime-500 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/30 rounded-full"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-350">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] rounded-md tracking-wider uppercase font-extrabold ${
                            item.status === "ACTIVE"
                              ? "text-success-800 bg-success-100 dark:text-success-300 dark:bg-success-950/40"
                              : "text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/40"
                          }`}
                        >
                          {item.status === "ACTIVE" ? "Hoạt động" : "Đã chặn"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-550 dark:text-slate-400">
                        {item.createdAt}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            onDeleteCustomers([item.id]);
                            triggerToast(`Đã xóa khách hàng ${item.name} thành công!`);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded transition cursor-pointer"
                          title="Xóa khách hàng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                        <IconSearch size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Không tìm thấy khách hàng nào
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc lọc theo trạng thái để tìm kết quả.
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="px-4.5 py-1.5 border border-gray-200 dark:border-gray-855 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-350 shadow-2xs transition cursor-pointer"
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

        {/* Footer */}
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
            <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium">
              Đang hiển thị 1-{filteredCustomers.length} đến {filteredCustomers.length} của {customers.length} bản ghi
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-850">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Thêm khách hàng mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0901234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Ví dụ: an.nv@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Trạng thái
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium cursor-pointer"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="BLOCKED">Đã chặn</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Segment
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: New Subscribers"
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-inter">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: VIP, Loyal, Lead"
                  value={newTagsString}
                  onChange={(e) => setNewTagsString(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-55 dark:hover:bg-gray-800 text-xs font-bold text-slate-700 dark:text-slate-350 rounded-lg transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-850 border border-slate-800 dark:border-gray-800 rounded-xl shadow-xl px-4 py-3 min-w-[200px] animate-slide-in-right text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
