import React, { useState } from "react";
import { IconX } from "../dung-chung/icons";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "Google Forms" | "API") => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<"Google Forms" | "API" | null>(null);
  const [configName, setConfigName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleSelectType = (type: "Google Forms" | "API") => {
    setSelectedType(type);
    setConfigName(type === "Google Forms" ? "Cấu hình Google Sheets" : "Cấu hình cổng API");
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configName.trim() || !selectedType) return;
    onSubmit(configName.trim(), selectedType);
    // Reset state
    setStep(1);
    setSelectedType(null);
    setConfigName("");
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setConfigName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-2xl w-full flex flex-col justify-between overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Tạo cấu hình Form
          </h3>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
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
                : "bg-gray-200 text-slate-400 dark:bg-gray-850 dark:text-slate-500"
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
                Điền cấu hình Form
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-medium leading-normal">
                Tạo cấu hình Form với tài khoản liên kết đã chọn
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {step === 1 ? (
            <div className="space-y-5">
              {/* Search box */}
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                />
              </div>

              {/* List */}
              <div className="space-y-3">
                {/* Google Forms */}
                {("google forms".includes(searchQuery.toLowerCase()) || searchQuery === "") && (
                  <div className="flex items-center justify-between p-4 border border-gray-150 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50 hover:shadow-2xs transition duration-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                        {/* Sheets/Forms Icon */}
                        <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2zm0 8H7v-2h10v2z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200">
                          Đồng bộ Google Forms với form từ Landing Page.
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase">
                          Google Forms
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectType("Google Forms")}
                      className="px-4 py-1.5 text-xs font-bold text-lime-500 bg-white border border-lime-100 hover:bg-lime-50 rounded-lg transition dark:bg-gray-900 dark:text-lime-300 dark:border-lime-900 dark:hover:bg-lime-950/20 cursor-pointer"
                    >
                      Chọn
                    </button>
                  </div>
                )}

                {/* API */}
                {("api".includes(searchQuery.toLowerCase()) || searchQuery === "") && (
                  <div className="flex items-center justify-between p-4 border border-gray-150 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50 hover:shadow-2xs transition duration-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-lime-50 dark:bg-lime-950/20 flex items-center justify-center text-lime-500 dark:text-lime-300 flex-shrink-0">
                        {/* API Icon */}
                        <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200">
                          Tích hợp lưu data từ form về bên thứ 3 qua cổng API.
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase">
                          API
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSelectType("API")}
                      className="px-4 py-1.5 text-xs font-bold text-lime-500 bg-white border border-lime-100 hover:bg-lime-50 rounded-lg transition dark:bg-gray-900 dark:text-lime-300 dark:border-lime-900 dark:hover:bg-lime-950/20 cursor-pointer"
                    >
                      Chọn
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom section */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-650 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tạo tài khoản liên kết</span>
                </button>
                <span className="text-[11px] text-slate-400 font-semibold dark:text-slate-500">
                  Tài khoản đã liên kết (0/3)
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Tên cấu hình Form
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sheets Khách Hàng, API Nhập Liệu"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                  required
                  autoFocus
                />
              </div>

              <div className="p-4 rounded-xl bg-lime-50/50 dark:bg-lime-950/10 border border-lime-50/30 text-xs text-lime-600 dark:text-lime-300 space-y-1 leading-relaxed">
                <p className="font-bold">✓ Đã chọn kết nối: {selectedType}</p>
                <p className="opacity-90 font-medium">Bạn sẽ sử dụng tài khoản hệ thống mặc định để thiết lập. Vui lòng nhập tên gợi nhớ cho cấu hình này và nhấn Hoàn thành để lưu lại.</p>
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
