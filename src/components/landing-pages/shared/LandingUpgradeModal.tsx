"use client";

import React from "react";
import { IconX } from "../dung-chung/icons";

interface LandingUpgradeModalProps {
  isOpen: boolean;
  featureName: string;
  description?: string;
  onClose: () => void;
  onUpgrade: () => void | Promise<void>;
}

export const LandingUpgradeModal: React.FC<LandingUpgradeModalProps> = ({
  isOpen,
  featureName,
  description,
  onClose,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {featureName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 p-1 cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        <p className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          {description ??
            "Tính năng này cần quyền landing tương ứng và gói Pro trở lên."}
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => void onUpgrade()}
            className="px-4 py-2 text-sm font-black text-white rounded-lg bg-lime-500 hover:bg-lime-600 shadow-sm cursor-pointer"
          >
            Nâng cấp ngay
          </button>
        </div>
      </div>
    </div>
  );
};