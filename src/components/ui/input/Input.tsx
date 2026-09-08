import React, { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-gray-400 hover:border-gray-300 focus:border-lime-500 focus:ring-3 focus:ring-lime-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-lime-500 dark:disabled:bg-gray-900/60 ${className}`}
      {...props}
    />
  );
});

export default Input;
