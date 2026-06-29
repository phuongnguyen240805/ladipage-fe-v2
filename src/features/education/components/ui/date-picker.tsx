"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/features/education/components/ui/button";
import { Calendar } from "@/features/education/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/education/components/ui/popover";
import { cn } from "@/features/education/lib/utils";

type DatePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const toDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const toValue = (date?: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDisplay = (value?: string) => {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = toDate(value);

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-10 flex-1 justify-start gap-2 px-3 text-left font-normal",
                !value && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="truncate">{value ? toDisplay(value) : placeholder}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(toValue(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <Button type="button" variant="outline" size="icon" onClick={() => onChange("")} aria-label="Xóa ngày">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

