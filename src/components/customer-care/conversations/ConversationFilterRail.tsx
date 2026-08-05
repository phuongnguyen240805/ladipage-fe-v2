"use client";

import {
  CalendarDays,
  Clock3,
  Headphones,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquareMore,
  Phone,
  PhoneOff,
  UsersRound,
  WalletCards,
} from "lucide-react";
import {
  useConversationUiStore,
  type CustomerCareFilter,
} from "@/features/customer-care/stores/conversation-ui.store";

const filters: Array<{
  key: CustomerCareFilter;
  label: string;
  icon: React.ReactNode;
  count?: number;
}> = [
  { key: "all", label: "Hội thoại", icon: <MessageSquareMore className="h-5 w-5" /> },
  { key: "unread", label: "Chưa đọc", icon: <Headphones className="h-5 w-5" />, count: 24 },
  { key: "open", label: "Tin nhắn", icon: <MessageCircle className="h-5 w-5" />, count: 68 },
  { key: "pending", label: "Email", icon: <Mail className="h-5 w-5" />, count: 13 },
  { key: "resolved", label: "Cuộc gọi", icon: <Phone className="h-5 w-5" /> },
  { key: "unassigned", label: "Chưa gán", icon: <PhoneOff className="h-5 w-5" />, count: 7 },
];

const secondaryTools = [
  { label: "Lịch sử", icon: <Clock3 className="h-5 w-5" /> },
  { label: "Lịch hẹn", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Thanh toán", icon: <WalletCards className="h-5 w-5" /> },
  { label: "Khách hàng", icon: <UsersRound className="h-5 w-5" /> },
  { label: "Hộp thư", icon: <Inbox className="h-5 w-5" /> },
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
              onClick={() => setFilter(item.key)}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-lime-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-lime-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-lime-300"
              }`}
            >
              {item.icon}
              {item.count ? (
                <span
                  className={`absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full px-1 text-center text-[9px] font-bold leading-[17px] ${
                    active
                      ? "bg-white text-lime-700"
                      : "bg-lime-500 text-white"
                  }`}
                >
                  {item.count > 99 ? "99+" : item.count}
                </span>
              ) : null}
              <span className="pointer-events-none absolute left-[50px] z-50 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-3 my-2 h-px bg-slate-200 dark:bg-white/10" />

      <div className="flex flex-col items-center gap-1.5 px-1.5">
        {secondaryTools.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-lime-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-lime-300"
          >
            {item.icon}
            <span className="pointer-events-none absolute left-[50px] z-50 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
