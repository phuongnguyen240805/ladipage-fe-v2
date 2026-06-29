"use client";
import React, { forwardRef, InputHTMLAttributes } from "react";
import { mergeInputClasses } from "@/features/education/utils/design-system";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type = "text",
      disabled = false,
      success = false,
      error = false,
      hint,
      ...props
    },
    ref,
  ) => {
    const inputClasses = mergeInputClasses(error, disabled, className);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {hint && (
          <p
            className={`mt-2 text-sm ${
              error
                ? "text-red-600 dark:text-red-400"
                : success
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
