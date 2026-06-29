"use client";

import React, { useState } from "react";
import Link from "next/link";

type Step = {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  badge: string;
  description: string;
  benefit: string;
  codeSnippet?: string;
  tags?: string[];
};

const tabs = [
  { 
    id: "landing-page", 
    label: "Landing Page",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )
  },
  { 
    id: "website", 
    label: "Website doanh nghiệp",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
      </svg>
    )
  },
  { 
    id: "email", 
    label: "Email Marketing",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    )
  },
  { 
    id: "zalo", 
    label: "Zalo ZNS",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  { 
    id: "crm", 
    label: "CRM",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766v-.109A12.318 12.318 0 018.625 19.12c-.5-.91-.787-1.96-.787-3.073V19M8.625 19.12a9.023 9.023 0 01-4.5 1.251 8.98 8.98 0 01-4.12-.952 4.125 4.125 0 017.533-2.493M15 15.96a5 5 0 00-3-4.72m0 0a5 5 0 11-6 0m6 0v.003c0 .874-.216 1.7-.6 2.427M12 9.75a3 3 0 11-6 0 3 3 0 016 0zm7.5 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  },
  { 
    id: "automation", 
    label: "Tự động hoá",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    )
  },
  { 
    id: "funnel", 
    label: "Phễu bán hàng tự động",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.822c0-.54.384-1.006.917-1.096A50.065 50.065 0 0112 3z" />
      </svg>
    )
  },
];

const stepsData: Record<string, Step[]> = {
  "landing-page": [
    {
      id: 1,
      title: "Tạo landing page bằng AI / chọn mẫu",
      duration: "~5 phút",
      isCompleted: true,
      badge: "Bước 1/4",
      description: "Mô tả sản phẩm, AI dựng ngay trang bán hàng hoàn chỉnh — hoặc chọn từ kho mẫu tối ưu chuyển đổi.",
      benefit: "Có trang bán hàng trong vài phút, không cần biết thiết kế hay code.",
      codeSnippet: "AI Builder: ladi.ai/builder",
      tags: ["AI", "Mẫu sẵn", "Kéo thả"],
    },
    {
      id: 2,
      title: "Kết nối tên miền & xuất bản",
      duration: "~3 phút",
      isCompleted: true,
      badge: "Bước 2/4",
      description: "Kết nối tên miền riêng của bạn (ví dụ: km.thuonghieu.com) để tăng độ nhận diện thương hiệu, uy tín và chạy quảng cáo tối ưu trên các kênh.",
      benefit: "Nâng cao uy tín thương hiệu, tránh bị khóa link khi chạy ads Facebook/Google.",
      codeSnippet: "DNS: CNAME -> ladi.hd.com",
      tags: ["Domain", "SSL", "Xuất bản"],
    },
    {
      id: 3,
      title: "Gắn pixel & sự kiện chuyển đổi",
      duration: "~4 phút",
      isCompleted: false,
      badge: "Bước 3/4",
      description: "Gắn Facebook Pixel, Google Analytics, TikTok Pixel để theo dõi hành vi khách hàng và đo lường các sự kiện chuyển đổi quan trọng (Lead, Purchase).",
      benefit: "Tối ưu chi phí chạy ads chính xác, đo lường rõ ràng tỷ lệ chuyển đổi ROI.",
      codeSnippet: "fbq('track', 'Purchase')",
      tags: ["Lead", "Purchase"],
    },
    {
      id: 4,
      title: "Kết nối kênh quảng cáo & đổ traffic",
      duration: "~6 phút",
      isCompleted: false,
      badge: "Bước 4/4",
      description: "Liên kết Landing Page với các tài khoản quảng cáo Facebook Ads, Google Ads, TikTok Ads để khởi chạy chiến dịch và thu hút lượt truy cập.",
      benefit: "Tiếp cận hàng triệu khách hàng mục tiêu, tự động hóa đo lường hiệu quả quảng cáo.",
      codeSnippet: "Campaign ID: ladi_campaign_101",
      tags: ["Facebook Ads", "Google Ads", "TikTok Ads"],
    },
  ],
  "website": [
    {
      id: 1,
      title: "Chọn giao diện Website doanh nghiệp",
      duration: "~10 phút",
      isCompleted: false,
      badge: "Bước 1/3",
      description: "Lựa chọn mẫu website doanh nghiệp đa trang chuyên nghiệp phù hợp với lĩnh vực kinh doanh của bạn.",
      benefit: "Xây dựng hiện diện số nhanh chóng với thiết kế hiện đại.",
    },
    {
      id: 2,
      title: "Cấu hình menu và các trang chức năng",
      duration: "~15 phút",
      isCompleted: false,
      badge: "Bước 2/3",
      description: "Thiết lập cấu trúc menu điều hướng, trang Giới thiệu, Liên hệ, Sản phẩm & Dịch vụ.",
      benefit: "Trải nghiệm duyệt trang mạch lạc giúp giữ chân khách hàng tốt hơn.",
    },
    {
      id: 3,
      title: "Xuất bản Website với tên miền riêng",
      duration: "~5 phút",
      isCompleted: false,
      badge: "Bước 3/3",
      description: "Trỏ tên miền chính thức của doanh nghiệp và kích hoạt SSL bảo mật HTTPS cho website.",
      benefit: "Tăng uy tín thương hiệu trên môi trường internet toàn cầu.",
    },
  ],
  "email": [
    {
      id: 1,
      title: "Thiết lập kịch bản gửi Email (SMTP/Amazon SES)",
      duration: "~10 phút",
      isCompleted: true,
      badge: "Bước 1/3",
      description: "Cấu hình địa chỉ email thương hiệu và kết nối các cổng gửi email tin cậy để tăng tỷ lệ vào hộp thư chính (Inbox).",
      benefit: "Đảm bảo email gửi đi không bị rơi vào thư rác (Spam).",
    },
    {
      id: 2,
      title: "Tạo danh sách người nhận và nhóm phân khúc",
      duration: "~5 phút",
      isCompleted: false,
      badge: "Bước 2/3",
      description: "Tải danh sách khách hàng hiện có lên hệ thống và phân loại họ theo hành vi, sở thích hoặc chiến dịch.",
      benefit: "Gửi thông điệp nhắm trúng mục tiêu, tăng tỷ lệ nhấp chuột mở thư.",
    },
    {
      id: 3,
      title: "Thiết kế Email Newsletter và gửi thử nghiệm",
      duration: "~8 phút",
      isCompleted: false,
      badge: "Bước 3/3",
      description: "Sử dụng trình thiết kế email kéo thả để soạn thảo nội dung ấn tượng và chạy gửi thử để kiểm tra hiển thị.",
      benefit: "Email hiển thị hoàn hảo trên tất cả thiết bị di động và máy tính.",
    },
  ],
  "zalo": [
    {
      id: 1,
      title: "Kết nối tài khoản Zalo Official Account (OA)",
      duration: "~5 phút",
      isCompleted: false,
      badge: "Bước 1/2",
      description: "Liên kết trang Zalo OA đã được xác thực của doanh nghiệp vào hệ thống quản trị tin nhắn ZNS.",
      benefit: "Tiếp cận trực tiếp hơn 70 triệu người dùng Zalo tại Việt Nam.",
    },
    {
      id: 2,
      title: "Tạo mẫu tin nhắn ZNS chăm sóc khách hàng",
      duration: "~10 phút",
      isCompleted: false,
      badge: "Bước 2/2",
      description: "Đăng ký các mẫu tin nhắn thông báo giao dịch, chúc mừng sinh nhật, khảo sát dịch vụ gửi đến khách hàng.",
      benefit: "Tự động gửi tin nhắn ngay khi khách hàng có hành vi chuyển đổi mới.",
    },
  ],
  "crm": [
    {
      id: 1,
      title: "Thiết lập các trường thông tin khách hàng (Custom Fields)",
      duration: "~5 phút",
      isCompleted: true,
      badge: "Bước 1/3",
      description: "Tùy chỉnh các cột dữ liệu như Họ tên, SĐT, Sản phẩm quan tâm, Trạng thái đơn hàng phù hợp với luồng vận hành.",
      benefit: "Quản lý dữ liệu tập trung, khoa học và không bỏ sót thông tin.",
    },
    {
      id: 2,
      title: "Phân quyền thành viên chăm sóc (Sales/Telesales)",
      duration: "~5 phút",
      isCompleted: false,
      badge: "Bước 2/3",
      description: "Thêm nhân viên vào hệ thống và thiết lập quy tắc tự động chia lead cho từng sale xử lý.",
      benefit: "Tăng tốc độ phản hồi khách hàng, tối ưu năng suất đội ngũ.",
    },
    {
      id: 3,
      title: "Kết nối cổng thanh toán (Momo, VNPAY, Chuyển khoản)",
      duration: "~10 phút",
      isCompleted: false,
      badge: "Bước 3/3",
      description: "Liên kết cổng thanh toán trực tuyến giúp khách hàng thanh toán nhanh ngay khi đặt hàng thành công.",
      benefit: "Giảm tỷ lệ hủy đơn, tự động xác nhận giao dịch thành công.",
    },
  ],
  "automation": [
    {
      id: 1,
      title: "Thiết lập kịch bản tự động hóa (Workflow)",
      duration: "~15 phút",
      isCompleted: false,
      badge: "Bước 1/2",
      description: "Tạo quy trình tự động: Nếu khách hàng điền form -> Tự động gắn tag -> Tự động gửi Email chào mừng và gửi tin Zalo.",
      benefit: "Chăm sóc khách hàng 24/7 hoàn toàn tự động, kịch bản linh hoạt.",
    },
    {
      id: 2,
      title: "Cấu hình cảnh báo Lead mới về Telegram/Slack",
      duration: "~5 phút",
      isCompleted: false,
      badge: "Bước 2/2",
      description: "Tự động bắn thông báo tức thời về nhóm chat khi có khách hàng đăng ký mới để đội ngũ telesale xử lý ngay.",
      benefit: "Giảm thời gian phản hồi khách hàng xuống dưới 1 phút.",
    },
  ],
  "funnel": [
    {
      id: 1,
      title: "Thiết lập sơ đồ Phễu bán hàng (Marketing Funnel)",
      duration: "~10 phút",
      isCompleted: false,
      badge: "Bước 1/2",
      description: "Vẽ bản đồ hành trình đi qua của khách hàng từ trang đăng ký nhận quà -> trang bán hàng chính -> trang thanh toán -> trang cảm ơn.",
      benefit: "Nhìn rõ điểm rơi rớt của khách hàng để tối ưu hiệu suất phễu.",
    },
    {
      id: 2,
      title: "Cấu hình ưu đãi giới hạn thời gian (Upsell/Downsell)",
      duration: "~8 phút",
      isCompleted: false,
      badge: "Bước 2/2",
      description: "Tự động gợi ý sản phẩm mua kèm với giá ưu đãi cực tốt ngay tại bước thanh toán để tăng giá trị đơn hàng trung bình.",
      benefit: "Tăng doanh số trung bình trên mỗi khách hàng từ 20% - 50%.",
    },
  ],
};

export default function GeneralOverview() {
  const [activeTab, setActiveTab] = useState("landing-page");
  const [activeStepId, setActiveStepId] = useState(1);
  const [bottomTab, setBottomTab] = useState<"campaign" | "landing-page">("campaign");

  const steps = stepsData[activeTab] || stepsData["landing-page"];
  
  // Find current active step details
  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0] || {
    id: 1,
    title: "",
    duration: "",
    isCompleted: false,
    badge: "Bước 1/1",
    description: "",
    benefit: "",
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveStepId(stepsData[tabId]?.[0]?.id || 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 text-sm font-semibold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30 rounded-full">
          <span>👋</span>
          <span>Chào buổi chiều, cong</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
          Tổng quan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nền tảng toàn diện cho mọi hoạt động Marketing & Sales
        </p>
      </div>

      {/* Main Roadmap Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 md:p-6 shadow-theme-xs transition-all">
        {/* Banner Card Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Xây nền tảng và tự động hoá tối đa
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Progress Bar */}
              <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                <div 
                  className="bg-lime-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(steps.filter(s => s.isCompleted).length / steps.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                {steps.filter(s => s.isCompleted).length}/{steps.length}
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
              </svg>
            </button>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 pb-2 mb-6 scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap pb-2 text-sm transition-all cursor-pointer border-b-2 -mb-2.5 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
                  : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Card Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side Checklist (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  activeStepId === step.id
                    ? "bg-[#f4f7ff] border-[#cddcff] dark:bg-lime-950/20 dark:border-lime-900/50"
                    : "border-slate-100 bg-white hover:border-slate-200 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {step.isCompleted ? (
                    // Checked Icon
                    <span className="flex-shrink-0 text-lime-500 dark:text-lime-300">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : activeStepId === step.id ? (
                    // Active Step circle with number
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-lime-500 text-white text-[11px] font-bold shadow-xs">
                      {step.id}
                    </span>
                  ) : (
                    // Inactive Step circle with outline
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border border-slate-200 dark:border-gray-700 text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
                      {step.id}
                    </span>
                  )}
                  <span className={`text-sm transition-colors ${
                    step.isCompleted
                      ? "text-slate-500 dark:text-slate-400 font-medium"
                      : activeStepId === step.id
                      ? "text-lime-500 dark:text-lime-300 font-semibold"
                      : "text-slate-700 dark:text-slate-400 font-normal"
                  }`}>
                    {step.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {step.duration}
                  </span>
                  {activeStepId === step.id && (
                    <svg className="w-4 h-4 text-lime-500 dark:text-lime-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5-7.5"></path>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Side Detail (7 Cols) */}
          <div className="lg:col-span-7 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Info panel */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-[11px] font-bold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30 rounded-full">
                  {activeStep.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {activeStep.duration}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {activeStep.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Benefit Box */}
              {activeStep.benefit && (
                <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-indigo-50/30 bg-indigo-50/20 dark:bg-indigo-950/10 dark:border-indigo-950/20">
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">
                    ✨ LỢI ÍCH
                  </span>
                  <p className="text-sm text-indigo-600 dark:text-indigo-300 leading-relaxed">
                    {activeStep.benefit}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 rounded-lg hover:bg-lime-600 shadow-sm transition cursor-pointer">
                  <span>Mở</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                  </svg>
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer">
                  Bỏ qua
                </button>
              </div>
            </div>

            {/* Graphic Panel */}
            <div className="w-full md:w-56 h-48 rounded-xl bg-lime-50/50 dark:bg-lime-950/20 border border-lime-50/30 dark:border-lime-900/10 flex items-center justify-center p-4 flex-shrink-0 select-none">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-800 p-3.5 w-full max-w-[200px] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path>
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-gray-300">
                    LadiPage AI
                  </span>
                </div>

                {/* Mock Content */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex flex-col gap-1.5 border border-gray-100 dark:border-gray-800">
                  <div className="h-2 w-16 bg-lime-50 dark:bg-lime-950/40 rounded" />
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-full bg-lime-500 rounded" />
                  <div className="h-2 w-6 bg-lime-800 rounded self-end" />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(activeStep.tags || ["AI", "Kéo thả"]).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 text-[9px] font-semibold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/40 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Widget: Customers Stats (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Khách hàng
              </h3>
              <Link 
                href="/khach-hang" 
                className="inline-flex items-center gap-0.5 text-[13px] font-medium text-lime-500 hover:text-lime-600 transition dark:text-lime-300 dark:hover:text-lime-200 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5-7.5"></path>
                </svg>
              </Link>
            </div>

            {/* Stat Boxes Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8fafc] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 p-4 rounded-xl flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Tổng khách hàng
                </span>
                <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                  0
                </p>
              </div>
              <div className="bg-[#f8fafc] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 p-4 rounded-xl flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Khách mới kỳ này
                </span>
                <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                  +0
                </p>
              </div>
            </div>

            {/* Segments Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Phân khúc nổi bật
              </h4>
              <div className="space-y-3.5">
                {/* Segment 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>New Subscribers</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">0</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-lime-500 h-1 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
                {/* Segment 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>SMS Subscribers</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">0</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-lime-500 h-1 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
                {/* Segment 3 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Email Subscribers</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">0</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-lime-500 h-1 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <button className="flex-1 inline-flex items-center justify-center gap-2 h-9 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg cursor-pointer transition whitespace-nowrap shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <span>Thêm khách hàng</span>
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 h-9 text-sm font-semibold text-slate-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer transition dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700/50 whitespace-nowrap shadow-xs">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Tạo form thu lead</span>
            </button>
          </div>
        </div>

        {/* Right Widget: Recent Campaigns (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3 mb-2">
              {/* Tabs */}
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setBottomTab("campaign")}
                  className={`text-sm pb-2.5 border-b-2 -mb-3 transition-all cursor-pointer ${
                    bottomTab === "campaign"
                      ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
                      : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  Chiến dịch gần đây
                </button>
                <button
                  onClick={() => setBottomTab("landing-page")}
                  className={`text-sm pb-2.5 border-b-2 -mb-3 transition-all cursor-pointer ${
                    bottomTab === "landing-page"
                      ? "font-semibold border-lime-500 text-lime-500 dark:border-lime-300 dark:text-lime-300"
                      : "font-medium border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  Landing Page gần đây
                </button>
              </div>
              <Link 
                href={bottomTab === "campaign" ? "/automation" : "/landing-pages"} 
                className="inline-flex items-center gap-0.5 text-[13px] font-medium text-lime-500 hover:text-lime-600 transition dark:text-lime-300 dark:hover:text-lime-200 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5-7.5"></path>
                </svg>
              </Link>
            </div>

            {/* Table layout matching the screenshot */}
            <div className="overflow-x-auto min-h-[220px]">
              {bottomTab === "campaign" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 w-1/3">Tên</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">Kênh</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">Trạng thái</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Đã gửi</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Tỷ lệ mở</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Chuyển đổi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                        Chưa có chiến dịch nào
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 w-1/3">Tên</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">Đường dẫn</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">Trạng thái</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Lượt xem</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Chuyển đổi</th>
                      <th className="py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 text-right">Tỉ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-gray-500">
                        Chưa có Landing Page nào
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion booster tools section */}
      <div className="space-y-4 pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Thúc đẩy chuyển đổi trên mọi Website & Landing Page
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dùng bộ công cụ chuyển đổi của LadiPage để biến lượt xem thành khách hàng
          </p>
        </div>

        {/* Grid of 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PopupX Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-theme-xs hover:shadow-theme-md transition-all flex flex-col">
            {/* High fidelity generated graphic */}
            <div className="h-40 bg-[#0B0F19] flex items-center justify-center relative overflow-hidden select-none">
              <img 
                src="/images/cards/popupx_illustration.png" 
                alt="PopupX Illustration" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500">✨</span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                      PopupX
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                    </svg>
                    <span>Dùng trên mọi website</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  Tích hợp vào bất kỳ website nào, hiển thị popup linh hoạt theo hành vi để thu lead và tăng chuyển đổi.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-theme-xs hover:shadow-theme-md transition-all flex flex-col">
            {/* High fidelity generated graphic */}
            <div className="h-40 bg-[#FAF5FF] flex items-center justify-center relative overflow-hidden select-none">
              <img 
                src="/images/cards/dynamic_illustration.png" 
                alt="Dynamic Illustration" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-500">🔄</span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                      Dynamic
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30 rounded-full">
                    <span>Dùng cho landing page</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  Cá nhân hoá nội dung theo chân dung khách, tự tối ưu landing theo mức độ tương tác.
                </p>
              </div>
            </div>
          </div>

          {/* FunnelX Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-theme-xs hover:shadow-theme-md transition-all flex flex-col">
            {/* High fidelity generated graphic */}
            <div className="h-40 bg-[#F0F6FF] flex items-center justify-center relative overflow-hidden select-none">
              <img 
                src="/images/cards/funnelx_illustration.png" 
                alt="FunnelX Illustration" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lime-400">⏳</span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                      FunnelX
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-lime-500 bg-lime-50 dark:text-lime-300 dark:bg-lime-950/30 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                    </svg>
                    <span>Dùng trên mọi website</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  Nhúng 1 lần vào bất kỳ website nào: phễu đa bước, điều kiện chuyển bước linh hoạt, báo cáo từng bước.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
