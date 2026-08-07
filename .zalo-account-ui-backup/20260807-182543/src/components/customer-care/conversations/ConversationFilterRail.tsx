"use client";

import {
  CheckCheck,
  CircleDotDashed,
  Inbox,
  MessageSquareMore,
  UserRoundX,
} from "lucide-react";
import {
  useConversationUiStore,
  type CustomerCareFilter,
} from "@/features/customer-care/stores/conversation-ui.store";

const filters: Array<{
  key: CustomerCareFilter;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "all", label: "Tất cả hội thoại", icon: <MessageSquareMore className="h-5 w-5" /> },
  { key: "unread", label: "Chưa đọc", icon: <Inbox className="h-5 w-5" /> },
  { key: "open", label: "Đang mở", icon: <CircleDotDashed className="h-5 w-5" /> },
  { key: "pending", label: "Chờ xử lý", icon: <CircleDotDashed className="h-5 w-5" /> },
  { key: "resolved", label: "Đã xử lý", icon: <CheckCheck className="h-5 w-5" /> },
  { key: "unassigned", label: "Chưa phân công", icon: <UserRoundX className="h-5 w-5" /> },
];

export function ConversationFilterRail() {
  const filter = useConversationUiStore((state) => state.filter);
  const setFilter = useConversationUiStore((state) => state.setFilter);

  return (
    <aside className="hidden w-[64px] shrink-0 flex-col border-r border-slate-200 bg-slate-100 py-2 dark:border-white/10 dark:bg-[#151923] md:flex">
      <div className="flex flex-col items-center gap-1.5 px-1.5">
        {filters.map((item) => {
          const active = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => setFilter(item.key)}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-lime-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-lime-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-lime-300"
              }`}
            >
              {item.icon}
              <span className="pointer-events-none absolute left-[50px] z-50 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
