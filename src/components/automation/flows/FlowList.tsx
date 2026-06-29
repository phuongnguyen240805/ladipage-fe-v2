import React, { useState, useRef, useEffect } from "react";
import { FlowItem, FlowStatus } from "../dung-chung/types";
import { IconPlus, IconSearch, IconTrash, IconEdit } from "../dung-chung/icons";

interface FlowListProps {
  flows: FlowItem[];
  setFlows: React.Dispatch<React.SetStateAction<FlowItem[]>>;
  setActiveSubTab: (tab: string) => void;
  setSelectedFlowId: (id: string | null) => void;
  isSimulated: boolean;
}

export const FlowList: React.FC<FlowListProps> = ({
  flows,
  setFlows,
  setActiveSubTab,
  setSelectedFlowId,
  isSimulated,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [triggerFilter, setTriggerFilter] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter flows
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && flow.status === "ACTIVE") ||
      (statusFilter === "INACTIVE" && flow.status === "INACTIVE");
    const matchesTrigger =
      triggerFilter === "ALL" ||
      (flow.triggerType && flow.triggerType.toLowerCase().includes(triggerFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  const handleCreateNew = () => {
    setSelectedFlowId(null);
    setActiveSubTab("builder");
  };

  const handleEdit = (id: string) => {
    setSelectedFlowId(id);
    setActiveSubTab("builder");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Flow này?")) {
      try {
        const savedUrl = localStorage.getItem("flowise_url") || "http://localhost:3100";
        const res = await fetch(`/api/flowise/chatflows/${id}`, {
          method: "DELETE",
          headers: {
            "x-flowise-url": savedUrl,
          },
        });
        if (res.ok) {
          setFlows((prev) => prev.filter((flow) => flow.id !== id));
          setTimeout(() => {
            const updated = flows.filter((flow) => flow.id !== id);
            localStorage.setItem("local_flows", JSON.stringify(updated));
          }, 100);
        } else {
          throw new Error("Failed to delete from Flowise");
        }
      } catch (e) {
        // Fallback local delete
        setFlows((prev) => prev.filter((flow) => flow.id !== id));
        setTimeout(() => {
          const updated = flows.filter((flow) => flow.id !== id);
          localStorage.setItem("local_flows", JSON.stringify(updated));
        }, 100);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const targetFlow = flows.find(f => f.id === id);
    if (!targetFlow) return;
    const newStatus = targetFlow.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const savedUrl = localStorage.getItem("flowise_url") || "http://localhost:3100";
      const res = await fetch(`/api/flowise/chatflows/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-flowise-url": savedUrl,
        },
        body: JSON.stringify({
          name: targetFlow.name,
          deployed: newStatus === "ACTIVE",
        }),
      });
      if (res.ok) {
        setFlows((prev) =>
          prev.map((flow) =>
            flow.id === id ? { ...flow, status: newStatus } : flow
          )
        );
      } else {
        throw new Error("Failed to toggle status");
      }
    } catch (e) {
      // Fallback local toggle
      setFlows((prev) =>
        prev.map((flow) =>
          flow.id === id ? { ...flow, status: newStatus } : flow
        )
      );
    }
  };

  const handleImportFlow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Đã nhận file kịch bản: ${file.name}. Đang cấu trúc lại luồng tự động...`);
      // Add a mock imported flow
      const newFlow: FlowItem = {
        id: `flow-${Date.now()}`,
        name: `${file.name.replace(/\.[^/.]+$/, "")} (Nhập từ file)`,
        status: "INACTIVE",
        createdAt: new Date().toLocaleString("vi-VN"),
        triggerType: "Được gắn Tag",
      };
      setFlows((prev) => [newFlow, ...prev]);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Danh sách Flow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Thiết kế các luồng tự động để chăm sóc khách hàng, bán hàng và xử lý công việc — vận hành tự động 24/7.
          </p>
        </div>

        {/* Action Button + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Tạo Flow</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  setActiveSubTab("templates");
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-350 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Sử dụng Flow mẫu</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-350 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span>Tạo Flow</span>
              </button>
              <label className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-350 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span>Tải Flow từ máy tính của bạn</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFlow}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-2xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên Flow..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 focus:border-lime-400 rounded-lg outline-hidden text-slate-800 dark:text-white"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 text-slate-700 dark:text-slate-350 px-3 py-2 rounded-lg outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>

          {/* Trigger filter */}
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="text-sm bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 text-slate-700 dark:text-slate-350 px-3 py-2 rounded-lg outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả Trigger</option>
            <option value="Được gắn Tag">Được gắn Tag</option>
            <option value="Bị xóa Tag">Bị xóa Tag</option>
            <option value="Đăng ký Sequence">Đăng ký Sequence</option>
            <option value="Đăng ký mới">Đăng ký mới</option>
          </select>
        </div>
      </div>

      {/* Flows Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Tên Flow
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider w-36">
                  Trạng thái
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider w-48">
                  Loại Trigger
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider w-48">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider w-32 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFlows.length > 0 ? (
                filteredFlows.map((flow) => (
                  <tr
                    key={flow.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                  >
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(flow.id)}
                        className="text-sm font-bold text-lime-500 dark:text-lime-400 hover:underline text-left cursor-pointer"
                      >
                        {flow.name}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(flow.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          flow.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-650 dark:bg-gray-800/50 dark:text-gray-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${flow.status === "ACTIVE" ? "bg-green-650" : "bg-gray-450"}`} />
                        <span>{flow.status === "ACTIVE" ? "Đang chạy" : "Tạm ngưng"}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-650 dark:text-slate-350">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        <span>{flow.triggerType || "Chưa thiết lập"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                      {flow.createdAt}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(flow.id)}
                          title="Chỉnh sửa kịch bản"
                          className="p-1.5 text-slate-500 hover:text-lime-500 dark:text-slate-450 dark:hover:text-lime-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(flow.id)}
                          title="Xóa kịch bản"
                          className="p-1.5 text-slate-500 hover:text-red-650 dark:text-slate-450 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer transition"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      {/* Empty state illustration */}
                      <div className="w-16 h-16 bg-lime-50 dark:bg-lime-950/20 text-lime-400 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        Chưa có Flow nào
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        Tạo Flow đầu tiên của bạn để tự động hóa quy trình chăm sóc và vận hành doanh nghiệp.
                      </p>
                      <button
                        onClick={handleCreateNew}
                        className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                      >
                        <IconPlus size={14} />
                        <span>Tạo Flow ngay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
