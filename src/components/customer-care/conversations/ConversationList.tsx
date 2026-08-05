"use client";

import type {
  CustomerCareChannel,
  CustomerCareConversation,
} from "@liora/api-types";
import {
  Mail,
  Search,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";
import { CustomerCareSkeleton } from "@/components/customer-care/shared/CustomerCareSkeleton";
import { CustomerCareEmptyState } from "@/components/customer-care/shared/CustomerCareEmptyState";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `${new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)} hôm qua`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

const channels: Array<{ value: CustomerCareChannel | "all"; label: string }> = [
  { value: "all", label: "Lọc theo" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "zalo", label: "Zalo" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
];

export function ConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
}: {
  conversations: CustomerCareConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  const search = useConversationUiStore((state) => state.search);
  const setSearch = useConversationUiStore((state) => state.setSearch);
  const channel = useConversationUiStore((state) => state.channel);
  const setChannel = useConversationUiStore((state) => state.setChannel);

  return (
    <section className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c] md:w-[350px] lg:w-[390px] 2xl:w-[430px]">
      <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-200 px-2 dark:border-white/10">
        <button
          type="button"
          title="Tạo hội thoại"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-lime-400 hover:bg-lime-50 hover:text-lime-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-lime-500/50 dark:hover:bg-lime-500/10 dark:hover:text-lime-300"
        >
          <SquarePen className="h-5 w-5" />
        </button>

        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500/50 dark:focus:bg-white/[0.07]"
          />
        </label>

        <label className="relative hidden h-10 w-[128px] shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:flex">
          <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4" />
          <select
            value={channel}
            onChange={(event) =>
              setChannel(event.target.value as CustomerCareChannel | "all")
            }
            aria-label="Lọc theo kênh"
            className="h-full w-full appearance-none bg-transparent pl-9 pr-2 text-xs font-medium outline-none"
          >
            {channels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <CustomerCareSkeleton rows={8} />
        ) : conversations.length === 0 ? (
          <CustomerCareEmptyState
            title="Không tìm thấy hội thoại"
            description="Hãy thử một từ khóa hoặc bộ lọc khác."
          />
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === selectedId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ConversationListItem({
  conversation,
  active,
  onClick,
}: {
  conversation: CustomerCareConversation;
  active: boolean;
  onClick: () => void;
}) {
  const preview = conversation.lastMessage || "[SYSTEM MESSAGE]";
  const primaryTag = conversation.tags[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-[98px] w-full gap-3 border-b px-3 py-3 text-left transition-colors dark:border-white/[0.07] ${
        active
          ? "border-lime-200 bg-lime-50/80 dark:border-lime-500/20 dark:bg-lime-500/[0.09]"
          : "border-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.035]"
      }`}
    >
      {active ? (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-lime-500" />
      ) : null}

      <div className="relative mt-0.5 h-12 w-12 shrink-0">
        <img
          src={conversation.customer.avatar}
          alt=""
          className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/15"
        />
        {conversation.unreadCount > 0 ? (
          <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-slate-600 px-1 text-[10px] font-bold text-white dark:border-[#11151c] dark:bg-slate-500">
            {conversation.unreadCount > 99 ? "99+" : `+${conversation.unreadCount}`}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate text-sm ${
              conversation.unreadCount
                ? "font-bold text-slate-950 dark:text-white"
                : "font-semibold text-slate-800 dark:text-slate-200"
            }`}
          >
            {conversation.customer.name}
          </span>
          <span className="ml-auto shrink-0 text-[11px] text-slate-400">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="mt-1 flex items-start gap-2">
          <p
            className={`line-clamp-2 flex-1 text-[13px] leading-5 ${
              conversation.unreadCount
                ? "font-semibold text-slate-800 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {preview}
          </p>
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 group-hover:text-lime-600 dark:group-hover:text-lime-300" />
        </div>

        <div className="mt-1.5 flex h-5 items-center gap-1.5">
          {primaryTag ? (
            <span
              className="max-w-[150px] truncate rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: primaryTag.color }}
            >
              {primaryTag.name}
            </span>
          ) : null}
          {conversation.assignee ? (
            <span className="ml-auto truncate text-[10px] text-slate-400">
              {conversation.assignee.name}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
