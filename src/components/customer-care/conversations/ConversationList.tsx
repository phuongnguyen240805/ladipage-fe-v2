"use client";

import { useEffect, useRef, useState } from "react";
import type { CustomerCareConversation } from "@liora/api-types";
import {
  BellOff,
  Check,
  ChevronDown,
  MessageCircle,
  Pin,
  Search,
  SlidersHorizontal,
  SquarePen,
  Trash2,
  UsersRound,
} from "lucide-react";
import { CustomerCareSkeleton } from "@/components/customer-care/shared/CustomerCareSkeleton";
import { CustomerCareEmptyState } from "@/components/customer-care/shared/CustomerCareEmptyState";
import {
  useConversationUiStore,
  type CustomerCareApp,
} from "@/features/customer-care/stores/conversation-ui.store";
import { useDeleteCustomerCareConversation } from "@/features/customer-care/hooks/useCustomerCare";

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

const channels: Array<{
  value: CustomerCareApp;
  label: string;
  short: string;
  color: string;
}> = [
  { value: "zalo", label: "Zalo", short: "Z", color: "#0866ff" },
  { value: "facebook", label: "Facebook", short: "f", color: "#1877f2" },
  { value: "telegram", label: "Telegram", short: "TG", color: "#229ED9" },
  { value: "instagram", label: "Instagram", short: "IG", color: "#c13584" },
  { value: "whatsapp", label: "WhatsApp", short: "WA", color: "#25D366" },
  { value: "tiktok", label: "TikTok", short: "TT", color: "#111827" },
  { value: "website", label: "Website", short: "W", color: "#64748b" },
];

export function ConversationList({ conversations, loading, selectedId, onSelect }: {
  conversations: CustomerCareConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  const search = useConversationUiStore((state) => state.search);
  const setSearch = useConversationUiStore((state) => state.setSearch);
  const selectedChannels = useConversationUiStore((state) => state.selectedChannels);
  const setSelectedChannels = useConversationUiStore((state) => state.setSelectedChannels);
  const toggleSelectedChannel = useConversationUiStore((state) => state.toggleSelectedChannel);
  const [channelMenuOpen, setChannelMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const deleteConversation = useDeleteCustomerCareConversation();

  useEffect(() => {
    if (!channelMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setChannelMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [channelMenuOpen]);

  const channelLabel = selectedChannels.length === 0
    ? "Tất cả kênh"
    : selectedChannels.length === 1
      ? channels.find((item) => item.value === selectedChannels[0])?.label ?? "1 kênh"
      : `${selectedChannels.length} kênh`;

  return (
    <section className="flex h-full w-full shrink-0 flex-col bg-white dark:bg-[#11151c]">
      <div className="shrink-0 border-b border-slate-200 dark:border-white/10">
        <div className="flex h-[46px] items-center justify-between gap-3 px-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-950 dark:text-white">Hội thoại</h1>
            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">Hộp thư đa kênh</p>
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setChannelMenuOpen((open) => !open)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-lime-400 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-expanded={channelMenuOpen}
              aria-label="Lọc hội thoại theo kênh"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{channelLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition ${channelMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {channelMenuOpen ? (
              <div className="absolute right-0 top-[38px] z-[90] w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#171b25]">
                <button
                  type="button"
                  onClick={() => setSelectedChannels([])}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${selectedChannels.length === 0 ? "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 dark:border-white/15">
                    {selectedChannels.length === 0 ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="font-medium">Tất cả kênh đang dùng</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-white/10" />

                {channels.map((item) => {
                  const checked = selectedChannels.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleSelectedChannel(item.value)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? "border-lime-500 bg-lime-500 text-white" : "border-slate-200 dark:border-white/15"}`}>
                        {checked ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: item.color }}>{item.short}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex h-[42px] items-center gap-2 px-2 pb-2">
          <button
            type="button"
            disabled
            title="Chủ động tạo hội thoại sẽ bật khi có danh bạ kênh"
            className="flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 opacity-70 dark:border-white/10 dark:bg-white/5"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm hội thoại"
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
        </div>
      </div>

      <div className="flex h-8 shrink-0 items-center justify-between border-b border-slate-100 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:border-white/[0.06]">
        <span>{conversations.length} hội thoại</span>
        <span>Thời gian thực</span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {loading ? <CustomerCareSkeleton rows={8} /> : conversations.length === 0 ? (
          <CustomerCareEmptyState title="Không tìm thấy hội thoại" description="Hãy thử một từ khóa hoặc bộ lọc khác." />
        ) : conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === selectedId}
            deleting={
              deleteConversation.isPending &&
              deleteConversation.variables?.conversationId === conversation.id
            }
            onClick={() => onSelect(conversation.id)}
            onDelete={() => {
              const source =
                conversation.channelAccountName ||
                conversation.channelName ||
                conversation.channel;
              const confirmed = window.confirm(
                `Xóa cuộc hội thoại với ${conversation.customer.name} khỏi ${source}?\n\n` +
                  "Hội thoại sẽ được gỡ khỏi hộp thư của tài khoản này. Nếu khách nhắn lại, cuộc hội thoại sẽ xuất hiện lại.",
              );
              if (!confirmed) return;
              deleteConversation.mutate({
                conversationId: conversation.id,
                channelAccountId: conversation.channelAccountId,
              });
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ConversationListItem({
  conversation,
  active,
  deleting,
  onClick,
  onDelete,
}: {
  conversation: CustomerCareConversation;
  active: boolean;
  deleting: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const primaryTag = conversation.tags[0];

  return (
    <div
      className={`group relative min-h-[76px] w-full border-b transition-colors dark:border-white/[0.07] ${
        active
          ? "border-lime-200 bg-lime-50/80 dark:border-lime-500/20 dark:bg-lime-500/[0.09]"
          : "border-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.035]"
      }`}
    >
      {active ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[3px] bg-lime-500" />
      ) : null}

      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[76px] w-full gap-2.5 px-3 py-2 text-left"
      >
        <div className="relative mt-0.5 h-10 w-10 shrink-0">
          <Avatar name={conversation.customer.name} src={conversation.customer.avatar} />
          <span
            className="absolute -bottom-1 -left-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#0866ff] text-white dark:border-[#11151c]"
            title={conversation.channelAccountName ?? conversation.channelName ?? conversation.channel}
          >
            <MessageCircle className="h-3 w-3" />
          </span>
          {conversation.unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-lime-500 px-1 text-[9px] font-bold text-white dark:border-[#11151c]">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {conversation.pinned ? (
              <Pin className="h-3 w-3 shrink-0 fill-lime-500 text-lime-500" />
            ) : null}
            <span
              className={`truncate text-sm ${
                conversation.unreadCount
                  ? "font-bold text-slate-950 dark:text-white"
                  : "font-semibold text-slate-800 dark:text-slate-200"
              }`}
            >
              {conversation.customer.name}
            </span>
            {conversation.threadType === "group" ? (
              <UsersRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            ) : null}
            {conversation.muted ? (
              <BellOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            ) : null}
            <span className="ml-auto shrink-0 pr-7 text-[10px] text-slate-400">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="mt-0.5 flex items-start gap-2">
            <p
              className={`line-clamp-1 flex-1 pr-7 text-xs leading-4 ${
                conversation.unreadCount
                  ? "font-semibold text-slate-800 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {conversation.lastMessage || "Chưa có tin nhắn"}
            </p>
          </div>

          <div className="mt-1 flex h-4 items-center gap-1.5 pr-7">
            {primaryTag ? (
              <span
                className="max-w-[130px] truncate rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: primaryTag.color }}
              >
                {primaryTag.name}
              </span>
            ) : null}
            <span className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {conversation.status === "unread"
                ? "Chưa đọc"
                : conversation.status === "resolved"
                  ? "Đã xử lý"
                  : conversation.status === "pending"
                    ? "Chờ xử lý"
                    : "Đang mở"}
            </span>
            {conversation.assignee ? (
              <span className="ml-auto truncate text-[10px] text-slate-400">
                {conversation.assignee.name}
              </span>
            ) : (
              <span className="ml-auto text-[10px] text-amber-500">Chưa gán</span>
            )}
          </div>
        </div>
      </button>

      <button
        type="button"
        disabled={deleting}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        title="Xóa hội thoại khỏi tài khoản này"
        aria-label={`Xóa hội thoại với ${conversation.customer.name}`}
        className="absolute right-2 top-8 z-20 flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-white/90 text-slate-400 opacity-100 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60 dark:bg-[#171b25]/90 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      >
        <Trash2 className={`h-3.5 w-3.5 ${deleting ? "animate-pulse" : ""}`} />
      </button>
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) return <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/15" />;
  const pieces = name.trim().split(/\s+/);
  const label = `${pieces[0]?.[0] || "K"}${pieces.length > 1 ? pieces.at(-1)?.[0] || "" : ""}`.toUpperCase();
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-xs font-bold text-white ring-1 ring-white/20">{label}</div>;
}
