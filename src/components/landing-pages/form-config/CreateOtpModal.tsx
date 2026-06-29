import React, { useState } from "react";
import { IconX } from "../dung-chung/icons";

interface CreateOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "OTP") => void;
}

export const CreateOtpModal: React.FC<CreateOtpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [configName, setConfigName] = useState("");

  if (!isOpen) return null;

  const handleCreateMockLink = () => {
    setConfigName("Cấu hình OTP ZNS / SMS");
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configName.trim()) return;
    onSubmit(configName.trim(), "OTP");
    // Reset state
    setStep(1);
    setConfigName("");
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setConfigName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-2xl w-full flex flex-col justify-between overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Tạo cấu hình OTP
          </h3>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Stepper indicator */}
        <div className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-800/60 bg-slate-50/50 dark:bg-gray-900/20 px-8 py-4.5 gap-6 select-none">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step >= 1 
                ? "bg-lime-500 text-white shadow-xs" 
                : "bg-gray-200 text-slate-400 dark:bg-gray-805"
            }`}>
              1
            </span>
            <div className="space-y-0.5">
              <span className={`text-xs font-bold block ${step === 1 ? "text-lime-500 dark:text-lime-300" : "text-slate-800 dark:text-gray-200"}`}>
                Chọn tài khoản liên kết
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-medium leading-normal">
                Chọn tài khoản liên kết ở bên dưới
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
              step === 2 
                ? "bg-lime-500 text-white shadow-xs" 
                : "bg-gray-100 text-slate-400 dark:bg-gray-800/80 dark:text-slate-600"
            }`}>
              2
            </span>
            <div className="space-y-0.5">
              <span className={`text-xs font-bold block ${step === 2 ? "text-lime-500 dark:text-lime-300" : "text-slate-400 dark:text-slate-550"}`}>
                Điền cấu hình OTP
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-medium leading-normal">
                Tạo cấu hình OTP với tài khoản liên kết đã chọn
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[320px]">
          {step === 1 ? (
            <div className="text-center space-y-6 max-w-md flex flex-col items-center">
              {/* Custom SVG folder character looking sad/crying */}
              <div className="relative w-48 h-36 flex items-center justify-center animate-pulse">
                <svg className="w-full h-full text-amber-400 dark:text-amber-500/80" viewBox="0 0 200 150" fill="none">
                  {/* Floating papers */}
                  <g className="animate-bounce">
                    <rect x="25" y="20" width="30" height="40" rx="3" fill="#e2e8f0" transform="rotate(-15 25 20)" stroke="#cbd5e1" strokeWidth="1.5"/>
                    <line x1="32" y1="30" x2="48" y2="26" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15 25 20)"/>
                    <line x1="32" y1="38" x2="48" y2="34" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15 25 20)"/>
                    
                    <rect x="145" y="15" width="28" height="38" rx="3" fill="#e2e8f0" transform="rotate(20 145 15)" stroke="#cbd5e1" strokeWidth="1.5"/>
                    <line x1="150" y1="23" x2="166" y2="29" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(20 145 15)"/>
                    <line x1="150" y1="30" x2="166" y2="36" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(20 145 15)"/>
                  </g>

                  {/* Folder Back body */}
                  <path d="M20 50C20 44.4772 24.4772 40 30 40H80L95 55H170C175.523 55 180 59.4772 180 65V125C180 130.523 175.523 135 170 135H30C24.4772 135 20 130.523 20 125V50Z" fill="currentColor"/>
                  
                  {/* Inner document peaking out */}
                  <rect x="40" y="32" width="120" height="80" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="2" className="dark:fill-gray-800 dark:stroke-gray-700"/>
                  <line x1="55" y1="48" x2="145" y2="48" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-gray-700"/>
                  <line x1="55" y1="62" x2="115" y2="62" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-gray-700"/>
                  
                  {/* Folder Front cover */}
                  <path d="M15 60C15 54.4772 19.4772 50 25 50H175C180.523 50 185 54.4772 185 60V125C185 130.523 180.523 135 175 135H25C19.4772 135 15 130.523 15 125V60Z" fill="#fbbf24"/>
                  
                  {/* Sad/Crying Face */}
                  {/* Eyes */}
                  <circle cx="75" cy="85" r="5" fill="#1e293b"/>
                  <circle cx="125" cy="85" r="5" fill="#1e293b"/>
                  {/* Crying tears */}
                  <path d="M75 90V105" stroke="#65a30d" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M125 90V105" stroke="#65a30d" strokeWidth="3" strokeLinecap="round"/>
                  {/* Sad mouth */}
                  <path d="M92 100C95 96 105 96 108 100" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  
                  {/* Question marks */}
                  <text x="10" y="35" fill="#94a3b8" fontSize="24" fontWeight="bold" fontFamily="sans-serif">?</text>
                  <text x="175" y="45" fill="#94a3b8" fontSize="24" fontWeight="bold" fontFamily="sans-serif">?</text>
                </svg>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-bold text-slate-800 dark:text-gray-200">
                  Chưa có liên kết nào được tạo trước đó
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Vui lòng tạo tài khoản liên kết với các nhà mạng hoặc nhà cung cấp dịch vụ OTP để bắt đầu.
                </p>
              </div>

              <button 
                onClick={handleCreateMockLink}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
              >
                <span>+ Tạo tài khoản liên kết</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="w-full max-w-md space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Tên cấu hình OTP
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cấu hình SMS Brandname, OTP Zalo"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                  required
                  autoFocus
                />
              </div>

              <div className="p-4 rounded-xl bg-lime-50/50 dark:bg-lime-950/10 border border-lime-50/30 text-xs text-lime-600 dark:text-lime-300 space-y-1 leading-relaxed">
                <p className="font-bold">✓ Đã liên kết tài khoản OTP thành công</p>
                <p className="opacity-90 font-medium">Cấu hình này sẽ được sử dụng để gửi mã xác thực giao dịch cho khách hàng. Vui lòng điền tên gợi nhớ và bấm Hoàn thành.</p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-150 dark:border-gray-800 p-5 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/10">
          <button
            type="button"
            onClick={step === 1 ? handleClose : handleBack}
            className="px-4.5 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
          >
            {step === 1 ? "Đóng" : "Quay lại"}
          </button>
          {step === 2 && (
            <button
              onClick={handleFormSubmit}
              className="px-5 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition cursor-pointer"
            >
              Hoàn thành
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
