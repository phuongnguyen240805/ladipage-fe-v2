import React, { forwardRef } from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`h-10 rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm font-medium text-gray-700 outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-gray-300 focus:border-lime-500 focus:ring-3 focus:ring-lime-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:focus:border-lime-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;
