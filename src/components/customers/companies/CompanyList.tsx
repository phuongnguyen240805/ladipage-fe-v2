import React, { useState } from "react";
import { CompanyItem } from "../dung-chung/types";
import { IconSearch, IconX, IconBuilding } from "../dung-chung/icons";

export const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("vi-VN");

    const newCompany: CompanyItem = {
      id: "CO" + (100 + companies.length + 1),
      name: newCompanyName.trim(),
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    setCompanies((prev) => [newCompany, ...prev]);
    triggerToast("Thêm công ty mới thành công!");
    setIsModalOpen(false);
    setNewCompanyName("");
  };

  const handleDeleteCompany = (id: string, name: string) => {
    setCompanies((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Đã xóa công ty ${name} thành công!`);
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 flex-1">
      {/* Header Title with Subtitle & Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Danh sách công ty
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý thông tin công ty và liên kết với khách hàng của bạn.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>Thêm công ty mới</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm công ty theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>
      </div>

      {/* Table Data list or Empty State */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Tên công ty
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Thời gian cập nhật
                </th>
                <th className="py-3.5 px-6 w-20 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                  >
                    <td className="py-4 px-6 text-xs font-bold text-slate-800 dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.createdAt}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.updatedAt}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteCompany(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded transition cursor-pointer"
                        title="Xóa công ty"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty state */
                <tr>
                  <td colSpan={4} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300 flex items-center justify-center border border-lime-50 dark:border-lime-900/50">
                        <IconBuilding size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Chưa có công ty nào.
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium">
                        Công ty giúp bạn nhóm và theo dõi khách hàng theo từng tổ chức. Hãy bắt đầu bằng cách thêm mới.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4.5 py-1.5 border border-lime-500 bg-lime-500 text-xs font-bold text-white hover:bg-lime-600 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        + Thêm công ty mới
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
            <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium">
              Đang hiển thị 1-{filteredCompanies.length} đến {filteredCompanies.length} của {companies.length} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-855">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Thêm công ty mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công ty TNHH LadiPage Việt Nam"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
