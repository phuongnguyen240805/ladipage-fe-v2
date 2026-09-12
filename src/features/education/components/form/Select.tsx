import React from "react";
import { CustomSelect } from "@/components/ui/select/Select";

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
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue,
  value,
}) => {
  return (
    <CustomSelect
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      className={className}
      defaultValue={defaultValue}
      value={value}
      size="md"
    />
  );
};

export default Select;
