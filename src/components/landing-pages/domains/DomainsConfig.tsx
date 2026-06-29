import React, { useState, useRef, useEffect } from "react";
import { DomainItem } from "../dung-chung/types";
import { IconSearch } from "../dung-chung/icons";
import { CreateDomainModal } from "./CreateDomainModal";

interface DomainsConfigProps {
  domains: DomainItem[];
  onAddDomain: (name: string, platform: string) => void;
}

export const DomainsConfig: React.FC<DomainsConfigProps> = ({
  domains,
  onAddDomain,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradePopoverOpen, setIsUpgradePopoverOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsUpgradePopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredDomains.map(d => d.id));
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

  const filteredDomains = domains.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "ALL" || d.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Tên miền
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý và cấu hình tên miền cho Landing Page.
          </p>
        </div>

        {/* Upgrade popover trigger button */}
        <div className="relative" ref={popoverRef}>
          <button 
            onClick={() => setIsUpgradePopoverOpen(!isUpgradePopoverOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>+ Tạo tên miền</span>
          </button>

          {/* LadiPage style Upgrade Popover */}
          {isUpgradePopoverOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-xl p-5 z-50 animate-fade-in space-y-4">
              <div className="flex items-start gap-3">
                {/* Orange lock icon */}
                <span className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Đã đạt giới hạn gói
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Bạn đã dùng <strong className="text-slate-800 dark:text-gray-200">0/0</strong> tên miền — đã đạt giới hạn của gói hiện tại. Nâng cấp gói hoặc mua thêm để tiếp tục.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="w-full py-2 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1">
                  <span>↗ Nâng cấp gói cao hơn</span>
                </button>
                <button className="w-full py-2 bg-white hover:bg-slate-50 text-lime-500 border border-gray-200 hover:border-gray-300 dark:bg-gray-900 dark:text-lime-300 dark:border-gray-800 dark:hover:bg-gray-850 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5">
                  <span>+ Mua thêm addon</span>
                </button>
                {/* Test mode button requested by user to allow UI testing */}
                <button 
                  onClick={() => {
                    setIsUpgradePopoverOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-1.5 text-[11px] font-bold text-slate-450 hover:text-lime-500 dark:text-slate-500 dark:hover:text-lime-300 transition cursor-pointer text-center underline border-t border-gray-100 dark:border-gray-800/80 pt-2.5 mt-1"
                >
                  Bỏ qua giới hạn (Chạy thử UI)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
        {/* Search */}
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

        {/* Filters Selects */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="w-full md:w-40 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
              <option>Tất cả thành viên</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          <div className="relative flex-1 md:flex-none">
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full md:w-36 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
            >
              <option value="ALL">Nền tảng</option>
              <option value="LadiPage">LadiPage</option>
              <option value="WordPress">WordPress</option>
              <option value="Shopify">Shopify</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table / Empty State */}
      {filteredDomains.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredDomains.length > 0 && selectedIds.length === filteredDomains.length}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" 
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Tên miền
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Nền tảng
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                    Trạng thái SSL
                  </th>
                  <th className="py-3 px-4 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDomains.map((item) => {
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
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === "VERIFIED" ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-success-700 bg-success-100 dark:text-success-300 dark:bg-success-950/40 rounded-md tracking-wider">
                            ĐÃ XÁC THỰC
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-750 bg-slate-100 dark:text-slate-400 dark:bg-gray-800 rounded-md tracking-wider">
                            CHƯA XÁC THỰC
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {item.platform}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.sslStatus === "ACTIVE" ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-lime-600 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/40 rounded-md tracking-wider">
                            ĐÃ BẬT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-black text-slate-750 bg-slate-100 dark:text-slate-400 dark:bg-gray-800 rounded-md tracking-wider">
                            CHƯA BẬT
                          </span>
                        )}
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
        <div className="py-24 text-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center justify-center space-y-4 select-none">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-lime-400/40 dark:border-lime-300/30 flex items-center justify-center text-lime-400 dark:text-lime-300 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-slate-800 dark:text-gray-300">
            Chưa có tên miền nào
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
            Thêm tên miền đầu tiên để bắt đầu publish Landing Page.
          </p>
        </div>
      )}

      {/* Create Modal */}
      <CreateDomainModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateDomain={onAddDomain}
      />
    </div>
  );
};
