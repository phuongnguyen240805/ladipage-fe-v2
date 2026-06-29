"use client";
import React, { useState } from "react";
import { User, Phone, Zap, X, Calendar, ShieldCheck } from "lucide-react";

interface QuickLeadFormProps {
  onClose: () => void;
  createdBy?: string;
  createdDate?: string;
}

const QuickLeadForm: React.FC<QuickLeadFormProps> = ({
  onClose,
  createdBy = "Võ Phương Duy",
  createdDate = "05/02/2026",
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`🚀 Mona System: Đã tạo Lead thành công!\n👤: ${name}\n📞: ${phone}`);
    onClose();
  };

  return (
    <div className="animate-in zoom-in relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl duration-300 dark:bg-slate-900">
      {/* Header Form */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
            <Zap size={20} fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white/90 leading-snug leading-snug">
            Tạo nhanh lead
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Họ tên */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[11px] font-semibold tracking-widest text-slate-400">
            Họ và tên khách hàng
          </label>
          <div className="relative">
            <User
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên khách hàng..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-sm font-bold outline-none focus:border-blue-400 dark:border-slate-800 dark:bg-white/[0.03] dark:text-white"
              required
            />
          </div>
        </div>

        {/* Input Số điện thoại */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[11px] font-semibold tracking-widest text-slate-400">
            Số điện thoại liên hệ
          </label>
          <div className="relative">
            <Phone
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 leading-relaxed"
              size={18}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 090xxxxxxx"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-sm font-bold outline-none focus:border-blue-400 dark:border-slate-800 dark:bg-white/[0.03] dark:text-white"
              required
            />
          </div>
        </div>

        {/* Thông tin metadata */}
        <div className="space-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <ShieldCheck size={14} />
            <span>
              Người tạo:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {createdBy}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Calendar size={14} />
            <span>
              Ngày tạo:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {createdDate}
              </strong>
            </span>
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 dark:shadow-none"
        >
          XÁC NHẬN TẠO LEAD
        </button>
      </form>
    </div>
  );
};

export default QuickLeadForm;



