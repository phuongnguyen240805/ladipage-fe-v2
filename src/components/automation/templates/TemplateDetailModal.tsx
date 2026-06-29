import React, { useState } from "react";
import { TemplateItem } from "../dung-chung/types";
import { IconX, IconCheck, IconBolt } from "../dung-chung/icons";

interface TemplateDetailModalProps {
  template: TemplateItem | null;
  onClose: () => void;
  onUseTemplate: (template: TemplateItem) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
  onUseTemplate,
}) => {
  const [consultingRegistered, setConsultingRegistered] = useState(false);

  if (!template) return null;

  const handleRegisterConsulting = () => {
    setConsultingRegistered(true);
    setTimeout(() => {
      setConsultingRegistered(false);
      alert("Đăng ký tư vấn 1-1 thành công! Chuyên gia LadiPage sẽ liên hệ lại qua Số điện thoại tài khoản của bạn.");
    }, 800);
  };

  const renderPhoneContent = () => {
    switch (template.previewType) {
      case "email":
        return (
          <div className="flex flex-col h-full bg-gray-50 text-slate-800 text-xs">
            {/* Email Header */}
            <div className="bg-white border-b border-gray-150 p-2.5 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-450">
                <span>Hộp thư đến</span>
                <span>Vừa xong</span>
              </div>
              <div className="font-bold text-slate-800 line-clamp-1">{template.previewTitle}</div>
              <div className="text-[10px] text-slate-500">Người gửi: support@ladipage.vn</div>
            </div>
            {/* Email Body */}
            <div className="flex-1 p-3 overflow-y-auto bg-white m-2.5 rounded-lg border border-gray-150/60 shadow-2xs font-sans whitespace-pre-line text-[10px] leading-relaxed">
              {template.previewBody}
            </div>
          </div>
        );
      case "zalo":
        return (
          <div className="flex flex-col h-full bg-[#eef3f7] text-slate-800 text-[11px] font-sans">
            {/* Zalo Header */}
            <div className="bg-[#65a30d] text-white p-2.5 flex items-center gap-1.5 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-white text-[#65a30d] flex items-center justify-center font-black text-[10px]">
                Z
              </div>
              <div>
                <div className="font-bold text-[10px]">Zalo Official Account</div>
                <div className="text-[8px] opacity-75">Đang hoạt động</div>
              </div>
            </div>
            {/* Zalo Message Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                <div className="font-bold text-slate-900 border-b border-gray-100 pb-1 text-[11px]">
                  {template.previewTitle}
                </div>
                <div className="text-slate-700 whitespace-pre-line text-[10px] leading-relaxed">
                  {template.previewBody}
                </div>
                {/* CTA Button */}
                <div className="pt-2">
                  <button className="w-full bg-lime-50 text-lime-500 font-bold text-center py-1.5 rounded-lg text-[9px] hover:bg-lime-50 transition">
                    Xem chi tiết / Nhấp vào đây
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "sms":
        return (
          <div className="flex flex-col h-full bg-slate-900 text-white font-sans text-xs">
            {/* SMS Header */}
            <div className="bg-slate-800 p-2.5 flex items-center justify-between border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                  B
                </div>
                <div>
                  <div className="font-bold text-[10px]">Brandname</div>
                  <div className="text-[8px] text-slate-400">Tin nhắn văn bản</div>
                </div>
              </div>
            </div>
            {/* SMS Bubbles */}
            <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end">
              <div className="max-w-[85%] bg-slate-800 text-white p-2.5 rounded-2xl rounded-bl-none text-[10px] leading-relaxed whitespace-pre-line border border-slate-700/50">
                {template.previewBody}
              </div>
              <span className="text-[8px] text-slate-500 mt-1 ml-1">Vừa xong</span>
            </div>
          </div>
        );
      case "facebook":
      default:
        return (
          <div className="flex flex-col h-full bg-white text-slate-800 font-sans text-xs">
            {/* FB Messenger Header */}
            <div className="bg-white border-b border-gray-100 p-2.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-lime-500 text-white flex items-center justify-center text-[10px] font-black">
                f
              </div>
              <div>
                <div className="font-bold text-[10px]">LadiPage Support</div>
                <div className="text-[8px] text-slate-400">Messenger</div>
              </div>
            </div>
            {/* Messenger Chat */}
            <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-2">
              <div className="max-w-[80%] bg-gray-100 text-slate-800 p-2.5 rounded-2xl rounded-bl-none text-[10px] leading-relaxed whitespace-pre-line">
                {template.previewBody}
              </div>
              <span className="text-[8px] text-slate-400 ml-1">Đã xem</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-lime-50 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300 rounded text-xs font-bold uppercase">
              {template.category}
            </span>
            <span className="text-sm font-bold text-slate-450 dark:text-slate-400">
              Chi tiết kịch bản mẫu
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Details (cols: 3) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-snug">
                {template.name}
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">
                {template.description}
                {" Bạn có thể cấu hình chi tiết, thêm nút hành động hoặc cài đặt lịch gửi tùy chỉnh thông qua "}
                <a href="#doc" className="text-lime-500 dark:text-lime-400 font-bold hover:underline">tài liệu hướng dẫn LadiPage</a>
                {" và "}
                <a href="#connect" className="text-lime-500 dark:text-lime-400 font-bold hover:underline">kết nối kênh Zalo/Email</a>.
              </p>

              {/* Activation & Conditions */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 mt-0.5">
                    <IconBolt size={14} />
                  </span>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Kích hoạt khi:</span>
                    <span className="ml-1.5 text-slate-600 dark:text-slate-400 font-mono">{template.triggerEvent}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs border-t border-gray-200/50 dark:border-gray-700/50 pt-2.5">
                  <span className="text-emerald-500 mt-0.5">
                    <IconCheck size={14} />
                  </span>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Điều kiện sử dụng:</span>
                    <span className="ml-1.5 text-slate-600 dark:text-slate-400">{template.conditionUse}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consulting Advisory Box */}
            <div className="bg-linear-to-r from-lime-50 to-indigo-50 dark:from-lime-950/20 dark:to-indigo-950/20 border border-lime-50/60 dark:border-lime-900/30 p-4.5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  TƯ VẤN 1-1 MIỄN PHÍ
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">
                Bạn cần tùy chỉnh kịch bản tự động này theo nhu cầu kinh doanh riêng của doanh nghiệp? Các chuyên gia của LadiPage luôn sẵn sàng đồng hành hỗ trợ thiết lập <strong>MIỄN PHÍ</strong>.
              </p>
              <button
                onClick={handleRegisterConsulting}
                disabled={consultingRegistered}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition shadow-2xs hover:shadow-xs cursor-pointer"
              >
                {consultingRegistered ? "Đang xử lý đăng ký..." : "Đăng ký nhận tư vấn miễn phí"}
              </button>
            </div>
          </div>

          {/* Right Column: Phone Mockup (cols: 2) */}
          <div className="lg:col-span-2 flex items-center justify-center bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-gray-150 dark:border-gray-800/80">
            {/* Phone Mockup Frame */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-700 bg-gray-850 dark:bg-gray-800 border-[10px] rounded-[2rem] h-[460px] w-[230px] shadow-lg flex-shrink-0">
              {/* iPhone Notch/Capsule */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-850 dark:bg-gray-800 rounded-full z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2" />
                <span className="w-8 h-1 rounded-full bg-slate-800" />
              </div>
              {/* Screen Area */}
              <div className="rounded-[1.5rem] overflow-hidden w-full h-full bg-white dark:bg-slate-900 flex flex-col justify-between select-none">
                {/* Status Bar */}
                <div className="h-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-between px-4 text-[7px] text-slate-500 font-sans border-b border-gray-100 dark:border-gray-800/50">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.07 19.64 10.47 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                    <span className="font-bold">5G</span>
                    <svg className="w-3.5 h-2" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="16" height="10" rx="2"/><rect x="20" y="8" width="2" height="4"/></svg>
                  </div>
                </div>

                {/* Simulated Screen Content */}
                <div className="flex-1 overflow-hidden relative">
                  {renderPhoneContent()}
                </div>

                {/* Home Indicator */}
                <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center">
                  <div className="w-20 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-150 dark:border-gray-800 px-6 py-4 bg-slate-50/50 dark:bg-gray-850/20">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-250 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onUseTemplate(template)}
            className="px-5 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-bold transition shadow-2xs hover:shadow-xs cursor-pointer"
          >
            Sử dụng kịch bản này
          </button>
        </div>
      </div>
    </div>
  );
};
