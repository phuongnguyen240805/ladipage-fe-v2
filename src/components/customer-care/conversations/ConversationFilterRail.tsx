"use client";

import {
  CheckCheck,
  Clock3,
  Mail,
  MessageSquareMore,
  MessagesSquare,
  UserRoundX,
} from "lucide-react";
import {
  useConversationUiStore,
  type CustomerCareFilter,
} from "@/features/customer-care/stores/conversation-ui.store";

import { ZaloAccountDock } from "@/components/customer-care/conversations/ZaloAccountDock";
import { FacebookAccountDock } from "@/components/customer-care/conversations/FacebookAccountDock";

const filters: Array<{
  key: CustomerCareFilter;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "all", label: "Táº¥t cáº£ há»™i thoáº¡i", icon: <MessageSquareMore className="h-5 w-5" /> },
  { key: "unread", label: "ChÆ°a Ä‘á»c", icon: <MessagesSquare className="h-5 w-5" /> },
  { key: "open", label: "Äang má»Ÿ", icon: <Mail className="h-5 w-5" /> },
  { key: "pending", label: "Chá» xá»­ lÃ½", icon: <Clock3 className="h-5 w-5" /> },
  { key: "resolved", label: "ÄÃ£ xá»­ lÃ½", icon: <CheckCheck className="h-5 w-5" /> },
  { key: "unassigned", label: "ChÆ°a phÃ¢n cÃ´ng", icon: <UserRoundX className="h-5 w-5" /> },
];

export function ConversationFilterRail() {
  const filter = useConversationUiStore((state) => state.filter);
  const setFilter = useConversationUiStore((state) => state.setFilter);

  return (
    <aside className="relative z-40 hidden w-[64px] shrink-0 flex-col border-r border-gray-200 bg-[#f4f4fa] py-2 dark:border-gray-800 dark:bg-[#13141f] md:flex">
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
                  ? "bg-[#e5ecff] text-[#65a30d] shadow-sm dark:bg-lime-950/40 dark:text-lime-300"
                  : "text-slate-500 hover:bg-gray-200/70 hover:text-[#65a30d] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-lime-300"
              }`}
            >
              {item.icon}
              <span className="pointer-events-none absolute left-[50px] top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 font-sans text-xs font-medium leading-none tracking-normal text-white opacity-0 shadow-xl transition duration-150 group-hover:translate-x-1 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-1.5 px-1.5 pb-1">
        <FacebookAccountDock />
        <ZaloAccountDock />
      </div>
    </aside>
  );
}

