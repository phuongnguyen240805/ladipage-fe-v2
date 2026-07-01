import React, { useState } from "react";
import { IconSearch } from "../dung-chung/icons";

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  landingPage: string;
  createdAt: string;
  status: string;
}

interface ErrorLeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  landingPage: string;
  createdAt: string;
  errorMessage: string;
}

interface DataLeadsProps {
  leads?: LeadItem[];
  errorLeads?: ErrorLeadItem[];
}

export const DataLeads: React.FC<DataLeadsProps> = ({ leads = [], errorLeads = [] }) => {
  const [activeTab, setActiveTab] = useState<"leads" | "errors">("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const handleExportExcel = () => {
    setToastMessage("Đang chuẩn bị file xuất Excel...");
    setTimeout(() => {
      setToastMessage("✓ Đã xuất file Excel thành công!");
      setTimeout(() => setToastMessage(""), 2500);
    }, 1200);
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    l.landingPage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredErrorLeads = errorLeads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    l.landingPage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Data Leads
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý data leads và data lỗi
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in">
          {/* Inner Tab bar selector */}
          <div className="flex items-center gap-6 border-b border-gray-150 dark:border-gray-800 pb-3 mt-4 select-none">
            <button 
              onClick={() => setActiveTab("leads")}
              className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 flex items-center gap-2 ${
                activeTab === "leads"
                  ? "font-bold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
                  : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
              }`}
            >
              <span>Danh sách Data Leads</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-md">
                {filteredLeads.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("errors")}
              className={`whitespace-nowrap pb-2.5 text-[13px] transition-all cursor-pointer border-b-2 -mb-3 flex items-center gap-2 ${
                activeTab === "errors"
                  ? "font-bold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
                  : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
              }`}
            >
              <span>Danh sách Data lỗi</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-md">
                {filteredErrorLeads.length}
              </span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                placeholder="Tìm theo email, số điện thoại, landing ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-255 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Calendar Date dropdown */}
              <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-[13px] font-medium text-slate-700 dark:bg-gray-900 dark:text-slate-300 dark:border-gray-800 dark:hover:bg-gray-850 cursor-pointer shadow-2xs">
                {/* Calendar Icon */}
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <span>Toàn thời gian</span>
              </button>

              {/* Export Excel Button */}
              <button 
                onClick={handleExportExcel}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-[13px] font-bold text-slate-700 dark:bg-gray-900 dark:text-slate-350 dark:border-gray-800 dark:hover:bg-gray-850 cursor-pointer shadow-2xs"
              >
                {/* Excel Download Icon */}
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Data Leads Table */}
          {activeTab === "leads" ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Khách hàng
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Landing Page
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Thời gian đăng ký
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10">
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-semibold text-slate-800 dark:text-gray-200 block">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-450 block font-medium">
                                Email: {item.email} | SĐT: {item.phone}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-sm font-medium text-slate-650 dark:text-slate-350">
                            {item.landingPage}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-400 dark:text-slate-550">
                            {item.createdAt}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md tracking-wider ${
                              item.status === "Mới" 
                                ? "text-lime-600 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/20" 
                                : "text-success-700 bg-success-50 dark:text-success-400 dark:bg-success-950/20"
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                          Không tìm thấy Lead nào khớp với từ khóa
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Error leads table */
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Khách hàng lỗi
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Landing Page
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Thời gian
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                        Chi tiết lỗi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredErrorLeads.length > 0 ? (
                      filteredErrorLeads.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10">
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-semibold text-slate-800 dark:text-gray-200 block">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-450 block font-medium">
                                Email: {item.email} | SĐT: {item.phone}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-sm font-medium text-slate-650 dark:text-slate-350">
                            {item.landingPage}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-400 dark:text-slate-550">
                            {item.createdAt}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-red-500 dark:text-red-400 leading-normal">
                            ⚠ {item.errorMessage}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                          Không tìm thấy lead lỗi nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      {/* Floating toast alerts for mock actions */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-3 min-w-[200px] animate-slide-in-right text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
