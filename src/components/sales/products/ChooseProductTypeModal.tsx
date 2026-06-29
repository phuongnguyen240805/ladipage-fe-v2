"use client";

import React, { useState } from "react";

// ─── Product type icons ───────────────────────────────────────────────────────
const PhysicalIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#FFF7ED"/>
    <path d="M16 8l6 3.5v7L16 22l-6-3.5v-7L16 8z" stroke="#F97316" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M16 22v-6.5M10 11.5l6 4 6-4" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DigitalIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#EFF6FF"/>
    <path d="M8 20c0-3 2-5 4.5-5.5.5-3 3-5 5.5-5 3.5 0 6 2.5 6 6 0 .3 0 .6-.1.9C25.3 17 26 18 26 19c0 1.7-1.3 3-3 3H10c-1.1 0-2-.9-2-2z" stroke="#65a30d" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 22l2 2 2-2" stroke="#65a30d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="19" x2="16" y2="24" stroke="#65a30d" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const EventIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#FFF1F2"/>
    <rect x="8" y="10" width="16" height="14" rx="2" stroke="#F43F5E" strokeWidth="1.8"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="20" y1="8" x2="20" y2="12" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="8" y1="16" x2="24" y2="16" stroke="#F43F5E" strokeWidth="1.8"/>
    <rect x="12" y="19" width="3" height="2" rx="0.5" fill="#F43F5E"/>
  </svg>
);

const ServiceIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#F0FDF4"/>
    <path d="M16 10a3 3 0 100 6 3 3 0 000-6z" stroke="#22C55E" strokeWidth="1.8"/>
    <path d="M10 24c0-3 2.7-5 6-5s6 2 6 5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M21 14l2-2M23 14l-2-2" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ComboIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#F5F3FF"/>
    <circle cx="16" cy="16" r="5" stroke="#7C3AED" strokeWidth="1.8"/>
    <circle cx="16" cy="16" r="2" stroke="#7C3AED" strokeWidth="1.8"/>
    <circle cx="16" cy="9" r="1.5" fill="#7C3AED"/>
    <circle cx="16" cy="23" r="1.5" fill="#7C3AED"/>
    <circle cx="9" cy="16" r="1.5" fill="#7C3AED"/>
    <circle cx="23" cy="16" r="1.5" fill="#7C3AED"/>
  </svg>
);

const PRODUCT_TYPES = [
  {
    id: "physical",
    icon: <PhysicalIcon />,
    name: "Sản phẩm vật lý",
    desc: "Hàng hoá hữu hình cần đóng gói và vận chuyển.",
    tags: ["Biến thể", "Tồn kho", "Vận chuyển", "Bảo hành"],
  },
  {
    id: "digital",
    icon: <DigitalIcon />,
    name: "Sản phẩm số",
    desc: "Tệp tải về, mã kích hoạt, màu, ebook.",
    tags: ["Tệp", "Bản quyền", "Giới hạn tải", "Phiên bản"],
  },
  {
    id: "event",
    icon: <EventIcon />,
    name: "Sự kiện",
    desc: "Hội thảo, workshop, sự kiện có lịch cụ thể.",
    tags: ["Lịch", "Địa điểm", "Sức chứa", "Vé", "Đặt giá"],
  },
  {
    id: "service",
    icon: <ServiceIcon />,
    name: "Dịch vụ",
    desc: "Dịch vụ đặt lịch tại cửa hàng, tại nhà hoặc online.",
    tags: ["Thời lượng", "Lịch đặt", "Huỷ", "Đặt cọc"],
  },
  {
    id: "combo",
    icon: <ComboIcon />,
    name: "Combo",
    desc: "Combo gói nhiều sản phẩm với giá ưu đãi.",
    tags: ["Sản phẩm con", "Loại combo", "Tiết kiệm"],
  },
];

// ─── Choose Product Type Modal ────────────────────────────────────────────────
interface ChooseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (typeId: string, typeName: string) => void;
}

export const ChooseProductTypeModal: React.FC<ChooseTypeModalProps> = ({
  isOpen,
  onClose,
  onChoose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl w-full max-w-[640px] animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Chọn loại sản phẩm
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Mỗi loại có thiết lập riêng. Có thể đổi loại sau khi tạo nhưng một số thông tin sẽ phải nhập lại.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition ml-4 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Type cards grid */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onChoose(type.id, type.name)}
              className={`flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition cursor-pointer hover:border-lime-300 hover:bg-lime-50/40 dark:hover:bg-lime-950/20 dark:hover:border-lime-600 ${
                type.id === "combo"
                  ? "col-span-1"
                  : ""
              } border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 group`}
            >
              <div className="flex-shrink-0 mt-0.5">{type.icon}</div>
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-lime-500 dark:group-hover:text-lime-300 transition">
                  {type.name}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {type.desc}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {type.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold text-slate-500 dark:text-slate-500"
                    >
                      {tag}
                      {type.tags.indexOf(tag) < type.tags.length - 1 && (
                        <span className="ml-1">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tip footer */}
        <div className="px-6 pb-5">
          <p className="text-[11px] font-medium text-lime-500 dark:text-lime-300">
            <span className="font-bold">Mẹo:</span> chọn loại sát nhất với cách bạn vận hành — bạn sẽ thấy đúng các trường cần thiết cho loại đó.
          </p>
        </div>
      </div>
    </div>
  );
};
