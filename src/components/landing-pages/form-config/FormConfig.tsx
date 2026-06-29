import React, { useState, useRef, useEffect } from "react";
import { FormConfigItem } from "../dung-chung/types";
import { IconSearch } from "../dung-chung/icons";
import { CreateFormModal } from "./CreateFormModal";
import { CreateOtpModal } from "./CreateOtpModal";

interface FormConfigProps {
  configs: FormConfigItem[];
  onAddConfig: (name: string, type: "Google Forms" | "API" | "OTP") => void;
}

export const FormConfig: React.FC<FormConfigProps> = ({
  configs,
  onAddConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredConfigs.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const filteredConfigs = configs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header: Title, Subtitle, Action Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Cấu hình Form
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Kết nối với nền tảng thứ ba để thu thập, lưu trữ thông tin khách hàng.
          </p>
        </div>

        {/* Dropdown Button Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>+ Tạo cấu hình Form</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-lg shadow-lg py-1.5 z-50 animate-fade-in">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsFormModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Form Data
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsOtpModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                OTP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 rounded-xl flex items-center justify-between gap-3 text-xs leading-relaxed text-slate-700 dark:text-amber-300">
        <div className="flex items-center gap-2">
          {/* Bulb Icon */}
          <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 dark:text-amber-400 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3H9.75a.75.75 0 01-.75-.75V12a3 3 0 116 0v2.25a.75.75 0 01-.75.75H12zM12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
            </svg>
          </span>
          <span>
            Khám phá ứng dụng <strong className="text-slate-800 dark:text-white">LadiPage Automation</strong> và nhận tư vấn chiến lược Gửi Email/Zalo/SMS Tự động từ chuyên gia ngay hôm nay!
          </span>
        </div>
        <a 
          href="#" 
          className="text-lime-600 hover:text-lime-600 dark:text-lime-300 dark:hover:text-lime-200 font-bold whitespace-nowrap inline-flex items-center gap-0.5 ml-2 cursor-pointer"
        >
          <span>Tư vấn 1-1 miễn phí</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
        {/* Search Box */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>

        {/* Dropdown Type Filter */}
        <div className="relative w-full md:w-48">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="Google Forms">Google Forms</option>
            <option value="API">API</option>
            <option value="OTP">OTP</option>
          </select>
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
      </div>

      {/* Main Table / Empty State Area */}
      {filteredConfigs.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredConfigs.length > 0 && selectedIds.length === filteredConfigs.length}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" 
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Tên cấu hình Form
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Số tài khoản liên kết
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Loại cấu hình
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Ngày cập nhật
                  </th>
                  <th className="py-3 px-4 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredConfigs.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10 ${
                        isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-slate-800 dark:text-gray-200 hover:text-lime-500 transition cursor-pointer">
                          {item.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-650 dark:text-slate-400">
                        {item.linkedAccounts}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          item.type === "Google Forms" 
                            ? "text-purple-600 bg-purple-55 dark:text-purple-400 dark:bg-purple-950/20" 
                            : item.type === "API"
                            ? "text-lime-600 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/20"
                            : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === "ACTIVE" ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-success-700 bg-success-100 dark:text-success-300 dark:bg-success-950/40 rounded-md tracking-wider">
                            ĐANG HOẠT ĐỘNG
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-700 bg-slate-200/60 dark:text-slate-300 dark:bg-gray-800 rounded-md tracking-wider">
                            TẠM DỪNG
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-400 dark:text-slate-550">
                        {item.updatedAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 p-1 cursor-pointer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-lime-400/40 dark:border-lime-300/30 flex items-center justify-center text-lime-400 dark:text-lime-300 animate-pulse">
            {/* Form list document icon */}
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-slate-800 dark:text-gray-300">
            Chưa có cấu hình nào
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
            Kết nối các tài khoản lưu trữ để bắt đầu thu thập thông tin khách hàng từ các Form đăng ký.
          </p>
        </div>
      )}

      {/* Stepper Create Modals */}
      <CreateFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={(name, type) => onAddConfig(name, type)}
      />

      <CreateOtpModal 
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={(name, type) => onAddConfig(name, type)}
      />
    </div>
  );
};
