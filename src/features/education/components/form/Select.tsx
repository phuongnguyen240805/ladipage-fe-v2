import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); // Trigger parent handler
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-sm font-medium shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none dark:border-slate-700 dark:bg-white/[0.03] dark:text-slate-400 dark:placeholder:text-white/30 ${
        selectedValue
          ? "text-slate-900 dark:text-white/90"
          : "text-slate-400 dark:text-slate-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-slate-900 dark:bg-white/[0.03] dark:text-slate-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-slate-900 dark:bg-white/[0.03] dark:text-slate-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
