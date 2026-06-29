"use client";

import React, { useEffect, useId, useState } from "react";

type Option = { value: string; label: string };

type ComboInputProps = {
  id?: string;
  value?: string | null;
  options?: Option[];
  placeholder?: string;
  className?: string;
  onChange: (value?: string | null) => void;
};

export function ComboInput({ id, value, options = [], placeholder, className, onChange }: ComboInputProps) {
  const generatedId = useId();
  const listId = `${id ?? generatedId}-datalist`;
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value == null) {
      setDisplay("");
      return;
    }
    const found = options.find((o) => o.value === value);
    setDisplay(found ? found.label : String(value));
  }, [value, options]);

  const commit = (text: string) => {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) return onChange(undefined);
    const found = options.find((o) => o.label === trimmed || o.value === trimmed);
    if (found) return onChange(found.value);
    return onChange(trimmed);
  };

  return (
    <>
      <input
        id={id}
        list={listId}
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>
    </>
  );
}

export default ComboInput;
