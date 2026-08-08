"use client";

import type { CustomerCareChannel, CustomerCareConversation } from "@liora/api-types";
import { BellOff, MessageCircle, Pin, Search, SlidersHorizontal, SquarePen, UsersRound } from "lucide-react";
import { CustomerCareSkeleton } from "@/components/customer-care/shared/CustomerCareSkeleton";
import { CustomerCareEmptyState } from "@/components/customer-care/shared/CustomerCareEmptyState";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

const channels: Array<{ value: CustomerCareChannel | "all"; label: string }> = [
  { value: "all", label: "Tất cả kênh" },
  { value: "zalo", label: "Zalo" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
];

export function ConversationList({ conversations, loading, selectedId, onSelect }: {
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
    <section className="flex h-full w-full shrink-0 flex-col bg-white dark:bg-[#11151c]">
      <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-200 px-2 dark:border-white/10">
        <button type="button" disabled title="Chủ động tạo hội thoại sẽ bật khi có danh bạ kênh" className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 opacity-70 dark:border-white/10 dark:bg-white/5">
          <SquarePen className="h-5 w-5" />
        </button>
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, nội dung, số điện thoại" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" />
        </label>
        <label className="relative hidden h-10 w-[116px] shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:flex">
          <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4" />
          <select value={channel} onChange={(event) => setChannel(event.target.value as CustomerCareChannel | "all")} aria-label="Lọc theo kênh" className="h-full w-full appearance-none bg-transparent pl-9 pr-2 text-xs font-medium outline-none">
            {channels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="flex h-8 shrink-0 items-center justify-between border-b border-slate-100 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:border-white/[0.06]">
        <span>{conversations.length} hội thoại</span>
        <span>Thời gian thực</span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {loading ? <CustomerCareSkeleton rows={8} /> : conversations.length === 0 ? (
          <CustomerCareEmptyState title="Không tìm thấy hội thoại" description="Hãy thử một từ khóa hoặc bộ lọc khác." />
        ) : conversations.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} active={conversation.id === selectedId} onClick={() => onSelect(conversation.id)} />
        ))}
      </div>
    </section>
  );
}

function ConversationListItem({ conversation, active, onClick }: { conversation: CustomerCareConversation; active: boolean; onClick: () => void }) {
  const primaryTag = conversation.tags[0];
  return (
    <button type="button" onClick={onClick} className={`group relative flex min-h-[76px] w-full gap-2.5 border-b px-3 py-2 text-left transition-colors dark:border-white/[0.07] ${active ? "border-lime-200 bg-lime-50/80 dark:border-lime-500/20 dark:bg-lime-500/[0.09]" : "border-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.035]"}`}>
      {active ? <span className="absolute inset-y-0 left-0 w-[3px] bg-lime-500" /> : null}
      <div className="relative mt-0.5 h-10 w-10 shrink-0">
        <Avatar name={conversation.customer.name} src={conversation.customer.avatar} />
        <span className="absolute -bottom-1 -left-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#0866ff] text-white dark:border-[#11151c]" title={conversation.channelName ?? conversation.channel}>
          <MessageCircle className="h-3 w-3" />
        </span>
        {conversation.unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-lime-500 px-1 text-[9px] font-bold text-white dark:border-[#11151c]">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span> : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {conversation.pinned ? <Pin className="h-3 w-3 shrink-0 fill-lime-500 text-lime-500" /> : null}
          <span className={`truncate text-sm ${conversation.unreadCount ? "font-bold text-slate-950 dark:text-white" : "font-semibold text-slate-800 dark:text-slate-200"}`}>{conversation.customer.name}</span>
          {conversation.threadType === "group" ? <UsersRound className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : null}
          {conversation.muted ? <BellOff className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : null}
          <span className="ml-auto shrink-0 text-[10px] text-slate-400">{formatRelativeTime(conversation.lastMessageAt)}</span>
        </div>
        <div className="mt-0.5 flex items-start gap-2">
          <p className={`line-clamp-1 flex-1 text-xs leading-4 ${conversation.unreadCount ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>{conversation.lastMessage || "Chưa có tin nhắn"}</p>
        </div>
        <div className="mt-1 flex h-4 items-center gap-1.5">
          {primaryTag ? <span className="max-w-[130px] truncate rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: primaryTag.color }}>{primaryTag.name}</span> : null}
          <span className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">{conversation.status === "unread" ? "Chưa đọc" : conversation.status === "resolved" ? "Đã xử lý" : conversation.status === "pending" ? "Chờ xử lý" : "Đang mở"}</span>
          {conversation.assignee ? <span className="ml-auto truncate text-[10px] text-slate-400">{conversation.assignee.name}</span> : <span className="ml-auto text-[10px] text-amber-500">Chưa gán</span>}
        </div>
      </div>
    </button>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) return <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/15" />;
  const pieces = name.trim().split(/\s+/);
  const label = `${pieces[0]?.[0] || "K"}${pieces.length > 1 ? pieces.at(-1)?.[0] || "" : ""}`.toUpperCase();
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-xs font-bold text-white ring-1 ring-white/20">{label}</div>;
}
