import React from "react";
import { Playbook } from "../types";
import { BookOpen, Sparkles } from "lucide-react";

interface PlaybookSelectorProps {
  playbooks?: Playbook[];
  onSelect: (prompt: string) => void;
}

export function PlaybookSelector({ playbooks = [], onSelect }: PlaybookSelectorProps) {
  if (playbooks.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" />
        Chọn Playbook (Mẫu Gợi Ý)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {playbooks.map((playbook) => (
          <button
            key={playbook.id}
            onClick={() => onSelect(playbook.prompt)}
            className="flex flex-col text-left p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 hover:bg-blue-50/50 dark:bg-gray-900/30 dark:hover:bg-blue-950/10 hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400 animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 transition-colors">
              {playbook.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {playbook.prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default PlaybookSelector;
