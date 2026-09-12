"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/select/Select";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
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
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (val: string) => {
    setSelectedValue(val);
    onChange(val);
  };

  return (
    <CustomSelect
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      size="md"
    />
  );
};

export default Select;
