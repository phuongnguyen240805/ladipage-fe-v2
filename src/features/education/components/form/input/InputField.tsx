"use client";
import React, { forwardRef, InputHTMLAttributes } from "react";

// 1. Mở rộng Interface từ InputHTMLAttributes chuẩn của React
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string; // Văn bản hướng dẫn/lỗi bên dưới
}

// 2. Sử dụng forwardRef để cha có thể truy cập trực tiếp vào DOM của input nếu cần
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type = "text",
      disabled = false,
      success = false,
      error = false,
      hint,
      ...props // Gom toàn bộ các thuộc tính còn lại (required, name, id, value...)
    },
    ref,
  ) => {
    // Xác định style cơ bản và các trạng thái (Normal, Disabled, Error, Success)
    let inputClasses = `h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-sm transition-all outline-none focus:ring-4 dark:bg-slate-900 dark:text-white/90 ${className}`;

    if (disabled) {
      inputClasses += ` bg-slate-50 text-slate-600 border-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600`;
    } else if (error) {
      inputClasses += ` text-error-800 border-error-500 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
    } else if (success) {
      inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`;
    } else {
      inputClasses += ` bg-transparent text-slate-900 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5 dark:border-slate-700 dark:bg-white/[0.03] dark:text-white/90`;
    }

    return (
      <div className="relative w-full">
        <input
          ref={ref} // Gắn ref ở đây
          type={type}
          disabled={disabled}
          className={inputClasses}
          {...props} // Đổ toàn bộ thuộc tính còn lại vào đây (Bao gồm 'required')
        />

        {/* Hiển thị Hint hoặc Lỗi bên dưới */}
        {hint && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              error
                ? "text-error-500"
                : success
                  ? "text-success-500"
                  : "text-slate-600"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

// Gắn tên hiển thị cho component khi dùng forwardRef
Input.displayName = "Input";

export default Input;
