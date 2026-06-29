"use client";

import React, { useState, useEffect } from "react";
import { AutomationSidebar } from "@/components/automation/sidebar/AutomationSidebar";
import { FlowList } from "@/components/automation/flows/FlowList";
import { TemplateLibrary } from "@/components/automation/templates/TemplateLibrary";
import { TemplateDetailModal } from "@/components/automation/templates/TemplateDetailModal";
import { IntegrationList } from "@/components/automation/integrations/IntegrationList";
import { FlowBuilder } from "@/components/automation/builder/FlowBuilder";
import { FlowItem, TemplateItem } from "@/components/automation/dung-chung/types";

export default function AutomationPage() {
  const [activeSubTab, setActiveSubTab] = useState("flows");
  const [isSimulated, setIsSimulated] = useState(false);
  const [customFlows, setCustomFlows] = useState<FlowItem[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [selectedZaloAccount, setSelectedZaloAccount] = useState<string | null>(null);
  const [bounceSearchQuery, setBounceSearchQuery] = useState("");
  const [bounceStatusFilter, setBounceStatusFilter] = useState("ALL");
  
  // Connection states
  const [flowiseUrl, setFlowiseUrl] = useState("http://localhost:3100");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "loading">("loading");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load saved Flowise URL from localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem("flowise_url");
    if (savedUrl) {
      setFlowiseUrl(savedUrl);
    }
  }, []);

  // Fetch flows from API proxy
  const fetchFlows = async (urlToUse = flowiseUrl) => {
    setConnectionStatus("loading");
    try {
      const res = await fetch(`/api/flowise/chatflows`, {
        headers: {
          "x-flowise-url": urlToUse,
        },
      });
      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Map to FlowItem structure
        const mapped = data.map((cf: any) => ({
          id: cf.id,
          name: cf.name,
          status: (cf.deployed ? "ACTIVE" : "INACTIVE") as FlowItem["status"],
          createdAt: new Date(cf.updatedAt || cf.createdAt).toLocaleString("vi-VN"),
          triggerType: "Kịch bản Chatflow",
        }));
        setCustomFlows(mapped);
        setConnectionStatus("connected");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.warn("Failed to fetch flows from Flowise:", e);
      setConnectionStatus("disconnected");
      // Fallback: load local flows if saved in localStorage
      const savedLocal = localStorage.getItem("local_flows");
      if (savedLocal) {
        setCustomFlows(JSON.parse(savedLocal));
      }
    }
  };

  useEffect(() => {
    fetchFlows();
  }, [flowiseUrl]);

  // Simulated flows database
  const simulatedFlows: FlowItem[] = [
    {
      id: "sim-1",
      name: "Zalo ZNS xác nhận đơn hàng thành công",
      status: "ACTIVE",
      createdAt: "27/02/2026, 22:12",
      triggerType: "Tạo đơn hàng thành công",
    },
    {
      id: "sim-2",
      name: "Email chúc mừng sinh nhật & tặng Voucher",
      status: "ACTIVE",
      createdAt: "05/03/2026, 09:00",
      triggerType: "Đến ngày sinh nhật khách hàng (9:00 AM)",
    },
    {
      id: "sim-3",
      name: "SMS OTP xác thực tài khoản",
      status: "INACTIVE",
      createdAt: "12/03/2026, 16:05",
      triggerType: "Khách hàng yêu cầu gửi mã OTP",
    },
  ];

  const allFlows = isSimulated ? [...customFlows, ...simulatedFlows] : customFlows;

  const handleUseTemplate = async (template: TemplateItem) => {
    // Apply template and attempt to save to Flowise
    const newFlowName = `Tự động: ${template.name}`;
    const flowDataObj = {
      nodes: [
        {
          id: "trigger",
          type: "trigger",
          data: { id: "register", name: template.triggerEvent || "Đăng ký mới", desc: "Kích hoạt tự động từ kịch bản mẫu" }
        },
        {
          id: "action",
          type: "action",
          data: { id: "send_zalo", name: "Gửi tin nhắn Zalo ZNS", desc: "Gửi thông báo chăm sóc", color: "bg-lime-400", icon: "Z", previewType: "zalo" }
        }
      ],
      edges: [
        { id: "e1-2", source: "trigger", target: "action" }
      ]
    };

    let newId = `flow-${Date.now()}`;
    let success = false;

    try {
      const res = await fetch(`/api/flowise/chatflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-flowise-url": flowiseUrl,
        },
        body: JSON.stringify({
          name: newFlowName,
          flowData: JSON.stringify(flowDataObj),
          deployed: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          newId = data.id;
          success = true;
        }
      }
    } catch (e) {
      console.warn("Failed to create chatflow in Flowise for template:", e);
    }

    const newFlow: FlowItem = {
      id: newId,
      name: newFlowName,
      status: "INACTIVE",
      createdAt: new Date().toLocaleString("vi-VN"),
      triggerType: template.triggerEvent?.replace("⚡ ", "") || "Chưa thiết lập",
    };

    setCustomFlows((prev) => [newFlow, ...prev]);
    
    // Save to local storage cache
    setTimeout(() => {
      const savedLocal = localStorage.getItem("local_flows");
      const currentLocal = savedLocal ? JSON.parse(savedLocal) : [];
      localStorage.setItem("local_flows", JSON.stringify([newFlow, ...currentLocal]));
    }, 100);

    setSelectedTemplate(null);
    setActiveSubTab("flows");
    
    setToast({
      message: success 
        ? `Đã tạo kịch bản mẫu "${template.name}" trên Flowise!` 
        : `Đã áp dụng kịch bản mẫu "${template.name}" vào bộ nhớ tạm!`,
      type: "success",
    });
  };

  // Render content based on active sub tab
  const renderTabContent = () => {
    switch (activeSubTab) {
      case "flows":
        return (
          <FlowList
            flows={allFlows}
            setFlows={setCustomFlows}
            setActiveSubTab={setActiveSubTab}
            setSelectedFlowId={setSelectedFlowId}
            isSimulated={isSimulated}
          />
        );
      case "templates":
        return (
          <TemplateLibrary
            onSelectTemplate={(temp) => setSelectedTemplate(temp)}
          />
        );
      case "integrations":
        return <IntegrationList isSimulated={isSimulated} />;
      
      // Feature Placeholders
      case "campaigns":
        return (
          <div className="flex-1 flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 text-center">
            <div className="w-16 h-16 bg-lime-50 dark:bg-lime-950/20 text-lime-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Chiến dịch gửi hàng loạt (Campaigns)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
              Gửi tin nhắn hoặc email hàng loạt tới tệp khách hàng được nhắm mục tiêu (Ví dụ: Zalo Broadcast, SMS gửi mã giảm giá dịp lễ, Email Newsletter tuần).
            </p>
            <button
              onClick={() => alert("Tính năng gửi chiến dịch hàng loạt đang được chuẩn bị phát hành ở phiên bản tiếp theo.")}
              className="mt-6 px-5 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Tìm hiểu thêm
            </button>
          </div>
        );
      case "sequences":
        return (
          <div className="flex-1 flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/20 text-purple-650 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Chuỗi tin nhắn tự động (Sequences)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
              Thiết lập chuỗi các tin nhắn được gửi tự động cách nhau một khoảng thời gian nhất định (Ví dụ: Chuỗi 3 email đào tạo sau đăng ký, chuỗi tin nhắn Zalo chăm sóc định kỳ).
            </p>
            <button
              onClick={() => alert("Tính năng chuỗi Sequence tự động đang được cập nhật.")}
              className="mt-6 px-5 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Tìm hiểu thêm
            </button>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cài đặt chung Automation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Múi giờ làm việc</label>
                <select className="w-full text-sm bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-slate-700 dark:text-slate-300 p-2.5 rounded-lg outline-hidden">
                  <option>(GMT+07:00) Asia/Ho_Chi_Minh</option>
                  <option>(GMT+08:00) Asia/Singapore</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Giờ gửi tin nhắn khuyến khích</label>
                <div className="flex items-center gap-2">
                  <input type="time" defaultValue="08:00" className="bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg text-sm w-full" />
                  <span>đến</span>
                  <input type="time" defaultValue="21:00" className="bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg text-sm w-full" />
                </div>
                <p className="text-[10px] text-slate-400">Tránh gửi tin nhắn ngoài khung giờ này để không gây phiền nhiễu cho khách hàng.</p>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Giới hạn tần suất gửi tin nhắn (Rate Limit)</label>
                <input type="number" defaultValue="3" className="bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-slate-700 dark:text-slate-300 p-2.5 rounded-lg text-sm w-full" />
                <p className="text-[10px] text-slate-400">Số lượng tin nhắn tự động tối đa gửi cho cùng một khách hàng trong vòng 24 giờ.</p>
              </div>
              <div className="space-y-2 col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Địa chỉ máy chủ Flowise API</label>
                <input 
                  type="text" 
                  value={flowiseUrl} 
                  onChange={(e) => {
                    setFlowiseUrl(e.target.value);
                    localStorage.setItem("flowise_url", e.target.value);
                  }}
                  placeholder="http://localhost:3100" 
                  className="bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-slate-700 dark:text-slate-300 p-2.5 rounded-lg text-sm w-full outline-hidden focus:border-lime-400" 
                />
                <p className="text-[10px] text-slate-450">Nhập địa chỉ cổng của máy chủ Flowise (mặc định là http://localhost:3100 hoặc http://localhost:3001 nếu cổng 3000 bị chiếm).</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetchFlows();
                alert("Đã lưu các thiết lập cài đặt chung và cập nhật cấu hình kết nối Flowise.");
              }}
              className="px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        );
      case "tags":
        return (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quản lý thẻ phân loại (Tag)</h2>
              <button
                onClick={() => alert("Thêm tag mới...")}
                className="px-4 py-2 bg-lime-500 text-white font-bold rounded-lg text-xs hover:bg-lime-600 transition"
              >
                + Tạo Tag mới
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {["VIP_CUSTOMER", "LEAD_HOT", "LANDING_PAGE_FORM", "ABANDONED_CART", "PROMOTION_USER", "ZALO_MEMBER"].map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 text-xs font-bold text-slate-750 dark:text-slate-300 rounded-lg">
                  <span>#{tag}</span>
                  <button className="text-slate-400 hover:text-red-500 font-bold ml-1">×</button>
                </span>
              ))}
            </div>
          </div>
        );
      case "promotions":
        return (
          <div className="flex-1 flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Chương trình khuyến mãi & Voucher</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
              Tạo kho mã giảm giá (Voucher Pool) để hệ thống tự động phát ngẫu nhiên cho khách hàng qua Email/SMS/Zalo ZNS trong các luồng chăm sóc.
            </p>
          </div>
        );
      case "activities":
        return (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Nhật ký hoạt động Automation</h2>
            <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-850/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-3 font-bold">Thời gian</th>
                    <th className="p-3 font-bold">Kịch bản</th>
                    <th className="p-3 font-bold">Khách hàng</th>
                    <th className="p-3 font-bold">Hành động</th>
                    <th className="p-3 font-bold">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-slate-600 dark:text-slate-400">
                  {isSimulated ? (
                    [
                      { time: "18:42:10 13/06/2026", flow: "Zalo ZNS xác nhận đơn hàng thành công", customer: "Nguyễn Văn A (0987654xxx)", action: "Gửi ZNS đơn hàng #1002", status: "Thành công" },
                      { time: "17:15:02 13/06/2026", flow: "Email chúc mừng sinh nhật & tặng Voucher", customer: "Trần Thị B (tranb@gmail.com)", action: "Gửi Email HPBD", status: "Thành công" },
                      { time: "16:05:44 13/06/2026", flow: "SMS OTP xác thực tài khoản", customer: "Lê Văn C (0912345xxx)", action: "Gửi SMS OTP", status: "Thất bại (Sai số)" },
                    ].map((act, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-mono">{act.time}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{act.flow}</td>
                        <td className="p-3">{act.customer}</td>
                        <td className="p-3">{act.action}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.status.includes("Thành công") ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-red-50 text-red-700 dark:bg-red-950/20"}`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400">Không có lịch sử chạy nào (Không ở chế độ Mô phỏng).</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "account_status":
        const mockBounceRows = [
          { email: "user-invalid-1@gmail.com", event: "Bounce", count: "1", date: "10:30, 12/06/2026" },
          { email: "bounced-mailbox-2@yahoo.com", event: "Bounce", count: "1", date: "16:22, 11/06/2026" },
          { email: "complaining-user@hotmail.com", event: "Complaint", count: "1", date: "09:15, 10/06/2026" },
        ].filter(row => {
          const matchesSearch = row.email.toLowerCase().includes(bounceSearchQuery.toLowerCase());
          const matchesStatus = bounceStatusFilter === "ALL" || row.event.toLowerCase() === bounceStatusFilter.toLowerCase();
          return matchesSearch && matchesStatus;
        });

        return (
          <div className="flex-1 flex flex-col space-y-6">
            {/* 1. Tình trạng Zalo ZNS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Tình trạng Zalo ZNS</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi số tin nhắn, loại nội dung sử dụng trong tài khoản Zalo ZNS của bạn.</p>
                </div>
                {/* Dropdown chọn tài khoản */}
                <div>
                  <select
                    value={selectedZaloAccount || ""}
                    onChange={(e) => setSelectedZaloAccount(e.target.value || null)}
                    className="text-xs bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-lg outline-hidden cursor-pointer"
                  >
                    <option value="">Chọn tài khoản</option>
                    <option value="zalo-1">Zalo OA - LadiPage Shop</option>
                    {isSimulated && <option value="zalo-2">Zalo OA - LadiSales Support</option>}
                  </select>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[90px] shadow-3xs">
                {selectedZaloAccount ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left p-2">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tin nhắn đã gửi trong ngày</span>
                      <span className="text-base font-black text-slate-800 dark:text-white">{isSimulated ? "18 tin nhắn" : "0 tin nhắn"}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hạn ngạch còn lại trong tháng</span>
                      <span className="text-base font-black text-slate-800 dark:text-white">{isSimulated ? "4,820 / 5,000 tin nhắn" : "5,000 / 5,000 tin nhắn"}</span>
                      <div className="w-full bg-gray-100 dark:bg-gray-850 h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[#65a30d] h-full rounded-full" style={{ width: isSimulated ? "3.6%" : "0%" }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 select-none">Vui lòng chọn tài khoản Zalo ZNS</span>
                )}
              </div>
            </div>

            {/* 2. Tình trạng Campaign */}
            <div className="space-y-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Tình trạng Campaign</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi số tin nhắn đã được gửi trong Campaign của bạn.</p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-3xs space-y-3">
                <div className="flex items-center justify-between text-xs select-none">
                  <span className="text-slate-650 dark:text-slate-350">Số tin nhắn đã gửi trong ngày</span>
                  <span className="text-emerald-600 dark:text-green-450 font-bold">Còn lại {isSimulated ? "98%" : "100%"} tin nhắn</span>
                </div>
                {/* Progress line */}
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: isSimulated ? "2%" : "0.5%" }} />
                </div>
              </div>
            </div>

            {/* 3. Tình trạng Email Bounce/Email Complaint */}
            <div className="space-y-2.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Tình trạng Email Bounce/Email Complaint</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi lượt Bounce và Complaint trong các địa chỉ email của bạn.</p>
                </div>
                {/* Right side metric cards */}
                <div className="flex items-center gap-3 select-none">
                  <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-3.5 w-36 shadow-3xs text-center">
                    <div className="text-lg font-black text-slate-800 dark:text-white">
                      0
                    </div>
                    <div className="text-[10px] text-slate-450 mt-1">Số email đã Bounce</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-3.5 w-36 shadow-3xs text-center">
                    <div className="text-lg font-black text-slate-800 dark:text-white">
                      0
                    </div>
                    <div className="text-[10px] text-slate-450 mt-1">Số email đã Complaint</div>
                  </div>
                </div>
              </div>

              {/* Table area with filters */}
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-3xs space-y-3 p-4">
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 select-none">
                  <div className="relative w-full md:w-[60%]">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-450">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm"
                      value={bounceSearchQuery}
                      onChange={(e) => setBounceSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-lime-400 rounded-lg outline-hidden text-slate-800 dark:text-white"
                    />
                  </div>
                  <select
                    value={bounceStatusFilter}
                    onChange={(e) => setBounceStatusFilter(e.target.value)}
                    className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-slate-700 dark:text-slate-350 px-3 py-2 rounded-lg outline-hidden cursor-pointer w-full md:w-auto"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="bounce">Bounce</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                {/* Table element */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/20 font-bold select-none text-slate-700 dark:text-slate-200">
                        <th className="py-2.5 px-4">Địa chỉ email</th>
                        <th className="py-2.5 px-4">Sự kiện</th>
                        <th className="py-2.5 px-4 w-24">Số lần</th>
                        <th className="py-2.5 px-4 w-40">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-slate-650 dark:text-slate-400">
                      {isSimulated && mockBounceRows.length > 0 ? (
                        mockBounceRows.map((row, idx) => (
                          <tr key={idx} className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10">
                            <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{row.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${row.event === "Bounce" ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"}`}>
                                {row.event}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">{row.count}</td>
                            <td className="py-3 px-4 text-slate-450">{row.date}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-slate-400 select-none">
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isBuilderActive = activeSubTab === "builder";

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. Left Sidebar - Hidden when Builder is Active */}
      {!isBuilderActive && (
        <AutomationSidebar
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      )}

      {/* 2. Main Work Area Container */}
      <div className={`flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] ${isBuilderActive ? "" : "p-6 overflow-y-auto"} relative`}>
        
        {/* Global Simulation Toggle Button - Hidden when Builder is Active */}
        {!isBuilderActive && (
          <>
            {/* Desktop Simulation Toggle Button */}
            <div className="absolute top-6 right-24 z-40 hidden xl:block">
              <button
                onClick={() => setIsSimulated(!isSimulated)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs border cursor-pointer ${
                  isSimulated
                    ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-slate-650 dark:text-slate-350 hover:bg-gray-50"
                }`}
              >
                {isSimulated ? "✨ Chế độ: Mô phỏng" : "📊 Chế độ: Thực tế (0đ)"}
              </button>
            </div>

            {/* Mobile Simulation Toggle Button */}
            <div className="xl:hidden mb-4 self-end">
              <button
                onClick={() => setIsSimulated(!isSimulated)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs border cursor-pointer ${
                  isSimulated
                    ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-slate-650 dark:text-slate-350 hover:bg-gray-50"
                }`}
              >
                {isSimulated ? "✨ Chế độ: Mô phỏng" : "📊 Chế độ: Thực tế (0đ)"}
              </button>
            </div>
          </>
        )}

        {/* Tab View Content / Canvas Router */}
        {isBuilderActive ? (
          <FlowBuilder
            flowId={selectedFlowId}
            flows={customFlows}
            setFlows={setCustomFlows}
            onBack={() => {
              setSelectedFlowId(null);
              setActiveSubTab("flows");
            }}
          />
        ) : (
          <>
            {/* Connection status banner */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl shadow-3xs select-none gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" :
                  connectionStatus === "loading" ? "bg-amber-500 animate-bounce" : "bg-rose-500"
                }`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                  Trạng thái kết nối Flowise:
                </span>
                <span className={`text-xs font-black uppercase ${
                  connectionStatus === "connected" ? "text-emerald-650 dark:text-emerald-500" :
                  connectionStatus === "loading" ? "text-amber-500" : "text-rose-600 dark:text-rose-500"
                }`}>
                  {connectionStatus === "connected" ? `Đã kết nối (${flowiseUrl})` :
                   connectionStatus === "loading" ? "Đang kết nối..." : "Chưa kết nối (Chế độ mô phỏng)"}
                </span>
              </div>
              {connectionStatus === "disconnected" ? (
                <span className="text-[10px] text-slate-450 max-w-sm md:text-right">
                  Mẹo: Chạy Flowise trên máy của bạn (ví dụ: cổng 3100) để lưu kịch bản thời gian thực.
                </span>
              ) : connectionStatus === "connected" ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold">
                  Sẵn sàng đồng bộ hóa dữ liệu thời gian thực!
                </span>
              ) : null}
            </div>

            {renderTabContent()}
          </>
        )}
      </div>

      {/* 3. Detail modal overlay */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {/* 4. Sliding Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-850 dark:border-gray-150 animate-bounce">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div className="text-xs font-bold">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
