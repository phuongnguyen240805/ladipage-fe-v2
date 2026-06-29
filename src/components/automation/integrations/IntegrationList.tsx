import React, { useState } from "react";
import { IntegrationItem } from "../dung-chung/types";
import { IconPlus, IconSearch } from "../dung-chung/icons";

interface IntegrationListProps {
  isSimulated: boolean;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({ isSimulated }) => {
  const [subTab, setSubTab] = useState<"my-integrations" | "library">("my-integrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");

  // Base Ecommerce account that is pre-seeded
  const baseIntegrations: IntegrationItem[] = [
    {
      id: "int-1",
      name: "Ecommerce",
      type: "Ecommerce",
      createdAt: "22:10, 27/02/2026",
      status: "ACTIVE",
    },
  ];

  // Extra integrations when simulation is enabled
  const simulatedIntegrations: IntegrationItem[] = [
    {
      id: "int-1",
      name: "Ecommerce",
      type: "Ecommerce",
      createdAt: "22:10, 27/02/2026",
      status: "ACTIVE",
    },
    {
      id: "int-2",
      name: "Zalo OA - LadiPage Shop",
      type: "Zalo OA",
      createdAt: "10:15, 05/03/2026",
      status: "ACTIVE",
    },
    {
      id: "int-3",
      name: "Gmail Marketing Account",
      type: "Gmail",
      createdAt: "14:40, 11/03/2026",
      status: "ACTIVE",
    },
    {
      id: "int-4",
      name: "eSMS OTP Gateway",
      type: "eSMS",
      createdAt: "16:05, 12/03/2026",
      status: "INACTIVE",
    },
  ];

  const activeIntegrations = isSimulated ? simulatedIntegrations : baseIntegrations;

  const filteredIntegrations = activeIntegrations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && item.status === "ACTIVE") ||
      (statusFilter === "INACTIVE" && item.status === "INACTIVE");
    const matchesPlatform =
      platformFilter === "ALL" ||
      (platformFilter === "ecommerce" && item.type.includes("Ecommerce")) ||
      (platformFilter === "zalo" && item.type.includes("Zalo")) ||
      (platformFilter === "email" && item.type.includes("Gmail")) ||
      (platformFilter === "sms" && item.type.includes("eSMS"));

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleAddLink = () => {
    alert("Hệ thống sẽ mở danh sách đối tác cung cấp dịch vụ (Zalo, eSMS, Gmail, Haravan...) để tiến hành đăng nhập Oauth2.");
  };

  const handleDeleteLink = (name: string) => {
    if (confirm(`Bạn có chắc chắn muốn ngắt kết nối tài khoản "${name}"?`)) {
      alert("Đã ngắt kết nối tích hợp thành công.");
    }
  };

  const renderPlatformLogo = (type: string) => {
    switch (type) {
      case "Ecommerce":
        return (
          <div className="w-5 h-5 rounded-full bg-lime-50 dark:bg-lime-950/20 text-[#65a30d] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
            </svg>
          </div>
        );
      case "Zalo OA":
        return (
          <div className="w-5 h-5 rounded-full bg-lime-400 text-white font-black flex items-center justify-center text-[10px] flex-shrink-0 select-none">
            Z
          </div>
        );
      case "Gmail":
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 select-none">
            M
          </div>
        );
      case "eSMS":
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 select-none">
            S
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <h1 className="text-[17px] font-bold text-slate-800 dark:text-white">
          Danh sách tích hợp
        </h1>
        <button
          onClick={handleAddLink}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#65a30d] hover:bg-[#1040cf] text-white rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
        >
          <IconPlus size={14} />
          <span>Thêm liên kết</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex items-center justify-start space-x-6 select-none -mt-2">
        <button
          onClick={() => setSubTab("my-integrations")}
          className={`pb-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            subTab === "my-integrations"
              ? "border-[#65a30d] text-[#65a30d] dark:text-lime-300 dark:border-lime-300"
              : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Tích hợp của tôi
        </button>
        <button
          onClick={() => setSubTab("library")}
          className={`pb-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
            subTab === "library"
              ? "border-[#65a30d] text-[#65a30d] dark:text-lime-300 dark:border-lime-300"
              : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Thư viện tích hợp
        </button>
      </div>

      {subTab === "library" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock integration options */}
          {[
            { name: "Zalo OA", desc: "Gửi tin nhắn chăm sóc khách hàng bằng kênh Zalo ZNS chính thống.", icon: "Z", color: "bg-lime-400" },
            { name: "Gmail SMTP", desc: "Cấu hình tài khoản email cá nhân hoặc email tên miền để gửi mail tự động.", icon: "M", color: "bg-red-500" },
            { name: "SMS Brandname", desc: "Tích hợp cổng SMS: eSMS, VietGuys, SpeedSMS để gửi tin nhắn OTP.", icon: "S", color: "bg-purple-600" },
            { name: "Haravan", desc: "Đồng bộ đơn hàng, giỏ hàng từ Haravan để kích hoạt luồng tự động.", icon: "H", color: "bg-green-600" },
            { name: "LadiSales", desc: "Kết nối trực tiếp với cổng bán hàng LadiPage để xử lý đơn hàng tức thì.", icon: "L", color: "bg-lime-500" },
            { name: "Google Sheets", desc: "Ghi dữ liệu khách hàng đăng ký trực tiếp vào bảng tính trực tuyến.", icon: "G", color: "bg-emerald-600" },
          ].map((lib, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col justify-between hover:shadow-2xs transition">
              <div className="flex gap-3.5 mb-4">
                <div className={`w-10 h-10 rounded-xl ${lib.color} text-white font-black flex items-center justify-center text-lg shadow-xs flex-shrink-0`}>
                  {lib.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{lib.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{lib.desc}</p>
                </div>
              </div>
              <button
                onClick={handleAddLink}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-slate-700 dark:text-slate-350 border border-gray-200 dark:border-gray-750 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Kết nối ngay
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3.5 rounded-xl shadow-3xs">
            {/* Search */}
            <div className="relative w-full md:w-[50%]">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <IconSearch size={14} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm tích hợp"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-lime-400 rounded-lg outline-hidden text-slate-800 dark:text-white"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-slate-700 dark:text-slate-350 px-3 py-2 rounded-lg outline-hidden cursor-pointer w-full md:w-auto"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngừng kết nối</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-slate-700 dark:text-slate-350 px-3 py-2 rounded-lg outline-hidden cursor-pointer w-full md:w-auto"
              >
                <option value="ALL">Tất cả các nền tảng</option>
                <option value="ecommerce">Ecommerce</option>
                <option value="zalo">Zalo OA</option>
                <option value="email">Gmail</option>
                <option value="sms">eSMS</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-800/10 select-none">
                    <th className="py-3 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        disabled
                        className="w-4 h-4 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-not-allowed"
                      />
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                      Tên tích hợp
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                      Loại tài khoản
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider w-40">
                      Trạng thái
                    </th>
                    <th className="py-3 px-4 w-16 text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredIntegrations.length > 0 ? (
                    filteredIntegrations.map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10">
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-not-allowed"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-800 dark:text-white">
                            {item.name}
                          </div>
                          {/* Connected Date under Name with Calendar Icon */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 select-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span>{item.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {renderPlatformLogo(item.type)}
                            <span className="text-xs text-slate-800 dark:text-white font-medium">{item.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[9px] font-black tracking-wider uppercase ${
                            item.status === "ACTIVE"
                              ? "bg-[#e6f4ea] text-[#137333] dark:bg-green-950/20 dark:text-green-450"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"
                          }`}>
                            {item.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "NGỪNG KẾT NỐI"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleDeleteLink(item.name)}
                            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 rounded-md transition cursor-pointer"
                            title="Tác vụ"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-450 text-xs">
                        Không tìm thấy tài khoản tích hợp nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-800 px-4 py-3 bg-slate-50/20 select-none">
              <div className="flex items-center gap-3">
                <select className="text-xs bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 text-slate-700 dark:text-slate-350 px-2.5 py-1 rounded-md outline-hidden cursor-pointer shadow-3xs">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <span className="text-[11px] text-slate-450">
                  Đang hiển thị 1 đến {filteredIntegrations.length} của {filteredIntegrations.length} bản ghi
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Previous page */}
                <button disabled className="w-6 h-6 rounded border border-gray-200 dark:border-gray-850 flex items-center justify-center text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {/* Active page */}
                <button className="w-6 h-6 rounded bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
                  1
                </button>
                {/* Next page */}
                <button disabled className="w-6 h-6 rounded border border-gray-200 dark:border-gray-850 flex items-center justify-center text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
