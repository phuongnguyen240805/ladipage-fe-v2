"use client";

import { useTheme } from "@/features/education/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={() => {
        // Thử toggle trực tiếp bằng JS
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
        }
      }}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600"
    >
      <Moon size={20} />
    </button>
  );
};