"use client";

import type {
  CustomerCareCapabilities,
  CustomerCareConversation,
  CustomerCareMessage,
} from "@liora/api-types";
import {
  Archive,
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  CircleHelp,
  ChevronUp,
  Copy,
  Forward,
  ImagePlus,
  Info,
  LoaderCircle,
  MessageSquareReply,
  MoreHorizontal,
  Paperclip,
  Pin,
  RefreshCw,
  Reply,
  Search,
  Send,
  Smile,
  Trash2,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerCareEmptyState } from "@/components/customer-care/shared/CustomerCareEmptyState";
import { CustomerCareSkeleton } from "@/components/customer-care/shared/CustomerCareSkeleton";
import { useConversationDraft } from "@/features/customer-care/hooks/useCustomerCare";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";
import { queryKeys } from "@/lib/query-keys";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDateKey(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Hôm nay";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return formatDateKey(value);
}

const quickReplies = [
  "Xin chào, LadiPage có thể hỗ trợ gì cho bạn?",
  "Cảm ơn bạn đã cung cấp thông tin. Chúng tôi đang kiểm tra ngay.",
  "Bạn vui lòng để lại số điện thoại để đội ngũ tư vấn liên hệ nhé.",
];
const quickEmojis = ["👍", "❤️", "😊", "😮", "🙏", "🎉"];

export function MessagePanel({
  conversation,
  conversations,
  messages,
  loading,
  hasOlder,
  loadingOlder,
  onLoadOlder,
  onSend,
  onBack,
  onToggleCustomerPanel,
  sending,
  realtimeConnected,
  online,
  capabilities,
  onTypingStart,
  onTypingStop,
}: {
  conversation: CustomerCareConversation | null;
  conversations: CustomerCareConversation[];
  messages: CustomerCareMessage[];
  loading: boolean;
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => Promise<void>;
  sending: boolean;
  realtimeConnected: boolean;
  online: boolean;
  capabilities?: CustomerCareCapabilities;
  onSend: (content: string, replyToMessageId?: string) => Promise<void>;
  onBack: () => void;
  onToggleCustomerPanel: () => void;
  onTypingStart: (conversationId: string) => void;
  onTypingStop: (conversationId: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousConversationRef = useRef<string | null>(null);
  const previousLastMessageRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingActiveRef = useRef(false);
  const typingConversationIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [conversationMenuOpen, setConversationMenuOpen] = useState(false);
  const [conversationActionBusy, setConversationActionBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<CustomerCareMessage | null>(null);
  const [forwardMessage, setForwardMessage] = useState<CustomerCareMessage | null>(null);
  const [forwardTarget, setForwardTarget] = useState("");
  const [forwardSearch, setForwardSearch] = useState("");
  const [forwardBusy, setForwardBusy] = useState(false);
  const [forwardError, setForwardError] = useState<string | null>(null);
  const { draft, setDraft, clearDraft } = useConversationDraft(conversation?.id ?? null);

  const lastMessageId = messages.at(-1)?.id ?? null;

  useEffect(() => {
    const conversationChanged = previousConversationRef.current !== (conversation?.id ?? null);
    const newestMessageChanged = previousLastMessageRef.current !== lastMessageId;
    if (conversationChanged || newestMessageChanged) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: conversationChanged ? "auto" : "smooth",
        });
      });
    }
    previousConversationRef.current = conversation?.id ?? null;
    previousLastMessageRef.current = lastMessageId;
  }, [conversation?.id, lastMessageId]);

  const stopTyping = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    const typingConversationId = typingConversationIdRef.current;
    if (typingActiveRef.current && typingConversationId) {
      typingActiveRef.current = false;
      typingConversationIdRef.current = null;
      onTypingStop(typingConversationId);
    }
  };

  const signalTyping = () => {
    const conversationId = conversation?.id;
    if (!conversationId) return;
    if (typingActiveRef.current && typingConversationIdRef.current !== conversationId) {
      stopTyping();
    }
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      typingConversationIdRef.current = conversationId;
      onTypingStart(conversationId);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 1_500);
  };

  useEffect(() => {
    setReplyTo(null);
    setForwardMessage(null);
    setForwardTarget("");
    setForwardSearch("");
    setForwardError(null);
    stopTyping();
    return stopTyping;
    // Typing state must be reset when switching threads or unmounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  const visibleMessages = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("vi");
    return value
      ? messages.filter((message) => message.content.toLocaleLowerCase("vi").includes(value))
      : messages;
  }, [messages, search]);

  const grouped = useMemo(() => {
    const result: Array<{ key: string; label: string; messages: CustomerCareMessage[] }> = [];
    for (const message of visibleMessages) {
      const key = formatDateKey(message.createdAt);
      const current = result[result.length - 1];
      if (!current || current.key !== key) {
        result.push({ key, label: formatDateLabel(message.createdAt), messages: [message] });
      } else {
        current.messages.push(message);
      }
    }
    return result;
  }, [visibleMessages]);

  const forwardCandidates = useMemo(() => {
    const currentConversationId = conversation?.id;
    const value = forwardSearch.trim().toLocaleLowerCase("vi");
    return conversations
      .filter((item) => item.id !== currentConversationId && !item.archived)
      .filter((item) => {
        if (!value) return true;
        return [item.customer.name, item.lastMessage, item.channelName]
          .filter(Boolean)
          .some((part) => String(part).toLocaleLowerCase("vi").includes(value));
      })
      .slice(0, 50);
  }, [conversation?.id, conversations, forwardSearch]);

  if (!conversation) {
    return (
      <section className="hidden min-w-0 flex-1 bg-slate-100 dark:bg-[#10141b] md:block">
        <CustomerCareEmptyState
          title="Chọn một hội thoại"
          description="Nội dung tin nhắn, lịch sử chăm sóc và công cụ xử lý sẽ xuất hiện tại đây."
        />
      </section>
    );
  }

  const submit = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSendError(null);
    try {
      stopTyping();
      await onSend(content, replyTo?.id);
      await clearDraft();
      setReplyTo(null);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Không thể gửi tin nhắn.");
    }
  };

  const refreshMessages = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.customerCare.messages(conversation.id) });

  const updateConversation = async (patch: Record<string, unknown>) => {
    setConversationActionBusy(true);
    try {
      await customerCareApi.updateConversation(conversation.id, patch);
      await queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
      setConversationMenuOpen(false);
    } finally {
      setConversationActionBusy(false);
    }
  };

  const openForward = (message: CustomerCareMessage) => {
    setForwardMessage(message);
    setForwardTarget("");
    setForwardSearch("");
    setForwardError(null);
  };

  const closeForward = () => {
    if (forwardBusy) return;
    setForwardMessage(null);
    setForwardTarget("");
    setForwardSearch("");
    setForwardError(null);
  };

  const submitForward = async () => {
    if (!forwardMessage || !forwardTarget || forwardBusy) return;
    setForwardBusy(true);
    setForwardError(null);
    try {
      await customerCareApi.forwardMessage(
        conversation.id,
        forwardMessage.id,
        forwardTarget,
        forwardMessage.content,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customerCare.messages(forwardTarget) }),
      ]);
      setForwardMessage(null);
      setForwardTarget("");
      setForwardSearch("");
    } catch (error) {
      setForwardError(error instanceof Error ? error.message : "Không thể chuyển tiếp tin nhắn.");
    } finally {
      setForwardBusy(false);
    }
  };

  return (
    <section className="relative flex min-w-0 flex-1 flex-col bg-slate-100 dark:bg-[#10141b]">
      <header className="flex h-[70px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-[#11151c] sm:px-4">
        <button type="button" onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-white/5" aria-label="Quay lại danh sách">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar name={conversation.customer.name} src={conversation.customer.avatar} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{conversation.customer.name}</h2>
            {conversation.threadType === "group" ? <UsersRound className="h-3.5 w-3.5 text-slate-400" /> : null}
          </div>
          <p className={`mt-0.5 truncate text-[11px] ${conversation.typing ? "font-semibold text-lime-600 dark:text-lime-300" : "text-slate-500 dark:text-slate-400"}`}>
            {conversation.typing
              ? "Đang nhập tin nhắn…"
              : `${conversation.channelName ?? "Zalo cá nhân"}${conversation.assignee ? ` • ${conversation.assignee.name}` : " • Chưa phân công"}`}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
            {online ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5 text-amber-500" />}
            <span className={realtimeConnected ? "text-emerald-600" : "text-slate-400"}>
              {realtimeConnected ? "Đồng bộ thời gian thực" : online ? "Đang kết nối lại" : "Ngoại tuyến — tin sẽ được xếp hàng"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 text-slate-500 dark:text-slate-300">
          <button type="button" onClick={() => setSearchOpen((value) => !value)} className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${searchOpen ? "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300" : "hover:bg-slate-100 dark:hover:bg-white/5"}`} title="Tìm trong hội thoại">
            <Search className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => void refreshMessages()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="Đồng bộ lại tin nhắn">
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button type="button" onClick={onToggleCustomerPanel} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="Thông tin khách hàng">
            <Info className="h-5 w-5" />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setConversationMenuOpen((value) => !value)} className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${conversationMenuOpen ? "bg-slate-100 text-lime-700 dark:bg-white/10 dark:text-lime-300" : "hover:bg-slate-100 dark:hover:bg-white/5"}`} title="Thao tác hội thoại">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {conversationMenuOpen ? (
              <div className="absolute right-0 top-11 z-40 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#181d25]">
                <ConversationAction label={conversation.pinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"} icon={<Pin className="h-4 w-4" />} disabled={conversationActionBusy} onClick={() => void updateConversation({ pinned: !conversation.pinned })} />
                <ConversationAction label={conversation.muted ? "Bật thông báo" : "Tắt thông báo"} icon={conversation.muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />} disabled={conversationActionBusy} onClick={() => void updateConversation({ muted: !conversation.muted })} />
                <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                <ConversationAction label="Đánh dấu đang mở" disabled={conversationActionBusy} onClick={() => void updateConversation({ status: "open" })} />
                <ConversationAction label="Chuyển sang chờ xử lý" disabled={conversationActionBusy} onClick={() => void updateConversation({ status: "pending" })} />
                <ConversationAction label="Đánh dấu đã xử lý" disabled={conversationActionBusy} onClick={() => void updateConversation({ status: "resolved" })} />
                <ConversationAction label="Đánh dấu chưa đọc" disabled={conversationActionBusy} onClick={async () => { setConversationActionBusy(true); try { await customerCareApi.markUnread(conversation.id); await queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] }); setConversationMenuOpen(false); } finally { setConversationActionBusy(false); } }} />
                <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                <ConversationAction label={conversation.archived ? "Khôi phục hội thoại" : "Lưu trữ hội thoại"} icon={<Archive className="h-4 w-4" />} disabled={conversationActionBusy} danger={!conversation.archived} onClick={() => void updateConversation({ archived: !conversation.archived })} />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-[#11151c]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nội dung tin nhắn..." className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-9 text-xs outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            {search ? <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button> : null}
          </div>
        </div>
      ) : null}

      {!online ? (
        <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <WifiOff className="h-3.5 w-3.5" /> Mất kết nối mạng. Tin gửi mới được lưu an toàn trong IndexedDB và tự gửi lại khi có mạng.
        </div>
      ) : null}

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(100,116,139,0.08) 1px, transparent 0)", backgroundSize: "22px 22px" }}>
        {loading ? (
          <CustomerCareSkeleton rows={5} />
        ) : grouped.length === 0 ? (
          <CustomerCareEmptyState title={search ? "Không tìm thấy tin nhắn" : "Chưa có tin nhắn"} description={search ? "Thử từ khóa khác trong hội thoại này." : "Gửi tin nhắn đầu tiên để bắt đầu chăm sóc khách hàng."} />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">
            {hasOlder ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={loadingOlder}
                  onClick={() => void onLoadOlder()}
                  className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-lime-300 hover:text-lime-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#181d25] dark:text-slate-300"
                >
                  {loadingOlder ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  {loadingOlder ? "Đang tải tin cũ…" : "Tải tin nhắn cũ hơn"}
                </button>
              </div>
            ) : null}
            {grouped.map((group) => (
              <div key={group.key}>
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-slate-200/90 px-4 py-1 text-[11px] font-medium text-slate-600 dark:bg-black/30 dark:text-slate-300">{group.label}</span>
                </div>
                <div className="space-y-3.5">
                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      conversation={conversation}
                      capabilities={capabilities}
                      onReply={() => setReplyTo(message)}
                      onForward={() => openForward(message)}
                      onRetry={async () => {
                        await customerCareApi.retryMessage(conversation.id, message.id);
                        await refreshMessages();
                      }}
                      onRecall={async () => {
                        await customerCareApi.recallMessage(conversation.id, message.id);
                        await refreshMessages();
                      }}
                      onReact={async (emoji) => {
                        const current = message.reactions?.find((reaction) => reaction.emoji === emoji);
                        if (current?.reactedByMe) {
                          await customerCareApi.removeReaction(conversation.id, message.id, emoji);
                        } else {
                          await customerCareApi.addReaction(conversation.id, message.id, emoji);
                        }
                        await refreshMessages();
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <footer className="relative shrink-0 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c]">
        {replyTo ? (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg border-l-4 border-lime-500 bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
            <MessageSquareReply className="h-4 w-4 shrink-0 text-lime-600" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-700 dark:text-slate-200">Trả lời {replyTo.senderName}</div>
              <div className="truncate text-slate-500">{replyTo.content}</div>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
        ) : null}

        {sendError ? (
          <div className="mx-3 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{sendError}</div>
        ) : null}

        <textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value.trim()) signalTyping();
            else stopTyping();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder={`Nhập tin nhắn cho ${conversation.customer.name}...`}
          className="block min-h-[62px] w-full resize-none bg-transparent px-4 pt-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
        />

        <div className="flex h-12 items-center gap-1 px-2 pb-1 text-slate-500 dark:text-slate-300">
          <CircleHelp className="mr-1 h-4.5 w-4.5 text-slate-400" />
          <ComposerButton label={capabilities?.messages.file ? "Đính kèm file" : "Kênh hiện tại chưa hỗ trợ file"} disabled={!capabilities?.messages.file}><Paperclip className="h-5 w-5" /></ComposerButton>
          <ComposerButton label={capabilities?.messages.image ? "Gửi hình ảnh" : "Kênh hiện tại chưa hỗ trợ hình ảnh"} disabled={!capabilities?.messages.image}><ImagePlus className="h-5 w-5" /></ComposerButton>
          <div className="group relative">
            <ComposerButton label="Emoji"><Smile className="h-5 w-5" /></ComposerButton>
            <div className="invisible absolute bottom-10 left-0 z-30 flex rounded-xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 dark:border-white/10 dark:bg-[#181d25]">
              {quickEmojis.map((emoji) => <button key={emoji} type="button" onClick={() => setDraft(`${draft}${emoji}`)} className="rounded-lg p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-white/10">{emoji}</button>)}
            </div>
          </div>

          <div className="relative ml-auto">
            <button type="button" onClick={() => setQuickRepliesOpen((value) => !value)} className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/5 dark:hover:text-lime-300" title="Trả lời nhanh">
              <MoreHorizontal className="h-5 w-5" /> <span className="hidden sm:inline">Mẫu trả lời</span>
            </button>
            {quickRepliesOpen ? (
              <div className="absolute bottom-11 right-0 z-30 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#181d25]">
                {quickReplies.map((reply) => (
                  <button key={reply} type="button" onClick={() => { setDraft(reply); setQuickRepliesOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs leading-5 text-slate-600 hover:bg-lime-50 hover:text-lime-700 dark:text-slate-300 dark:hover:bg-lime-500/10 dark:hover:text-lime-300">{reply}</button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" disabled={!draft.trim() || sending} onClick={() => void submit()} className="ml-1 flex h-10 min-w-11 items-center justify-center rounded-xl bg-lime-500 px-3 text-white shadow-sm transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-40" title="Gửi tin nhắn">
            {sending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </footer>

      {forwardMessage ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Chuyển tiếp tin nhắn">
          <div className="flex max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#171c24]">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300"><Forward className="h-4.5 w-4.5" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chuyển tiếp tin nhắn</h3>
                <p className="truncate text-[11px] text-slate-500">{forwardMessage.content || "Tin nhắn có tệp đính kèm"}</p>
              </div>
              <button type="button" disabled={forwardBusy} onClick={closeForward} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-white/5 dark:hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="border-b border-slate-100 p-3 dark:border-white/[0.07]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input autoFocus value={forwardSearch} onChange={(event) => setForwardSearch(event.target.value)} placeholder="Tìm hội thoại nhận..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
            </div>
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
              {forwardCandidates.length ? forwardCandidates.map((item) => (
                <button key={item.id} type="button" onClick={() => setForwardTarget(item.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${forwardTarget === item.id ? "border-lime-400 bg-lime-50 dark:border-lime-500/50 dark:bg-lime-500/10" : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                  <Avatar name={item.customer.name} src={item.customer.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{item.customer.name}</div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-400">{item.channelName ?? "Zalo cá nhân"} • {item.lastMessage || "Chưa có nội dung"}</div>
                  </div>
                  {forwardTarget === item.id ? <Check className="h-4 w-4 shrink-0 text-lime-600" /> : null}
                </button>
              )) : <div className="p-8 text-center text-xs text-slate-400">Không có hội thoại phù hợp để chuyển tiếp.</div>}
            </div>
            {forwardError ? <div className="mx-3 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{forwardError}</div> : null}
            <div className="flex justify-end gap-2 border-t border-slate-200 p-3 dark:border-white/10">
              <button type="button" disabled={forwardBusy} onClick={closeForward} className="h-9 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Hủy</button>
              <button type="button" disabled={!forwardTarget || forwardBusy} onClick={() => void submitForward()} className="inline-flex h-9 items-center gap-2 rounded-xl bg-lime-500 px-4 text-xs font-bold text-white hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-40">{forwardBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Forward className="h-4 w-4" />} Chuyển tiếp</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ConversationAction({
  label,
  icon,
  disabled = false,
  danger = false,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void onClick()}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}
    >
      {icon}<span>{label}</span>
    </button>
  );
}

function ComposerButton({ label, children, disabled = false }: { label: string; children: React.ReactNode; disabled?: boolean }) {
  return <button type="button" disabled={disabled} title={label} className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-lime-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/5 dark:hover:text-lime-300">{children}</button>;
}

function Avatar({ name, src, size = "md" }: { name: string; src?: string; size?: "sm" | "md" | "lg" }) {
  const classes = size === "lg" ? "h-11 w-11 text-sm" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs";
  if (src) return <img src={src} alt={name} className={`${classes} shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/15`} />;
  return <div aria-label={name} className={`${classes} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 font-bold text-white ring-1 ring-white/20`}>{initials(name)}</div>;
}

function MessageBubble({
  message,
  conversation,
  capabilities,
  onReply,
  onForward,
  onRetry,
  onRecall,
  onReact,
}: {
  message: CustomerCareMessage;
  conversation: CustomerCareConversation;
  capabilities?: CustomerCareCapabilities;
  onReply: () => void;
  onForward: () => void;
  onRetry: () => Promise<void>;
  onRecall: () => Promise<void>;
  onReact: (emoji: string) => Promise<void>;
}) {
  const outgoing = message.direction === "outgoing";
  const [actionsOpen, setActionsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const avatar = outgoing ? conversation.assignee?.avatar : message.senderAvatar || conversation.customer.avatar;
  const senderName = outgoing ? conversation.assignee?.name || "Bạn" : message.senderName || conversation.customer.name;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); } finally { setBusy(false); setActionsOpen(false); }
  };

  return (
    <div className={`group flex items-end gap-2 ${outgoing ? "justify-end" : "justify-start"}`}>
      {!outgoing ? <Avatar name={senderName} src={avatar} /> : null}
      <div className={`relative max-w-[84%] sm:max-w-[72%] ${outgoing ? "items-end" : "items-start"}`}>
        <div className={`absolute top-0 z-20 flex -translate-y-1/2 items-center rounded-lg border border-slate-200 bg-white p-0.5 opacity-0 shadow-sm transition group-hover:opacity-100 dark:border-white/10 dark:bg-[#1b2029] ${outgoing ? "right-2" : "left-2"}`}>
          <button type="button" onClick={onReply} title="Trả lời" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/10"><Reply className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => void navigator.clipboard.writeText(message.content)} title="Sao chép" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/10"><Copy className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setActionsOpen((value) => !value)} title="Thêm" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/10"><MoreHorizontal className="h-3.5 w-3.5" /></button>
        </div>

        {actionsOpen ? (
          <div className={`absolute top-7 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#181d25] ${outgoing ? "right-0" : "left-0"}`}>
            <div className="flex justify-between px-1 py-1">
              {quickEmojis.map((emoji) => <button key={emoji} type="button" disabled={!capabilities?.messages.reactions.local || busy} onClick={() => void run(() => onReact(emoji))} className="rounded p-1 text-base hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/10">{emoji}</button>)}
            </div>
            {capabilities?.messages.forward ? <ActionRow icon={<Forward className="h-4 w-4" />} label="Chuyển tiếp" onClick={() => { setActionsOpen(false); onForward(); }} /> : null}
            {message.status === "failed" ? <ActionRow icon={<RefreshCw className="h-4 w-4" />} label="Gửi lại" onClick={() => void run(onRetry)} /> : null}
            {outgoing && capabilities?.messages.recall.local && !message.recalled ? <ActionRow icon={<Trash2 className="h-4 w-4" />} label="Thu hồi khỏi hệ thống" danger onClick={() => void run(onRecall)} /> : null}
          </div>
        ) : null}

        <div className={`overflow-hidden rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm ${outgoing ? "rounded-br-md bg-lime-500 text-slate-950" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#151a20] dark:text-slate-100"} ${message.status === "failed" ? "ring-1 ring-red-400" : ""}`}>
          {message.replyTo ? (
            <button type="button" onClick={onReply} className={`mb-2 block w-full rounded-lg border-l-2 px-2 py-1 text-left text-[11px] ${outgoing ? "border-black/30 bg-black/10" : "border-lime-500 bg-slate-50 dark:bg-white/5"}`}>
              <div className="font-semibold">{message.replyTo.senderName || "Tin nhắn được trả lời"}</div>
              <div className="truncate opacity-75">{message.replyTo.content}</div>
            </button>
          ) : null}
          {message.attachments?.map((attachment) => attachment.type === "image" && attachment.url ? (
            <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="mb-2 block overflow-hidden rounded-xl"><img src={attachment.thumbnailUrl || attachment.url} alt={attachment.name} className="max-h-72 w-full object-cover" /></a>
          ) : (
            <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className={`mb-2 flex min-w-48 items-center gap-2 rounded-lg p-2 ${outgoing ? "bg-black/10" : "bg-slate-50 dark:bg-white/5"}`}><Paperclip className="h-4 w-4" /><span className="truncate text-[11px] font-semibold">{attachment.name}</span></a>
          ))}
          <p className={`whitespace-pre-wrap break-words ${message.recalled ? "italic opacity-60" : ""}`}>{message.recalled ? "Tin nhắn đã được thu hồi" : message.content}</p>
        </div>

        {message.reactions?.length ? (
          <div className={`mt-1 flex flex-wrap gap-1 ${outgoing ? "justify-end" : "justify-start"}`}>
            {message.reactions.map((reaction) => <button key={reaction.emoji} type="button" onClick={() => void onReact(reaction.emoji)} className={`rounded-full border px-2 py-0.5 text-[11px] shadow-sm transition ${reaction.reactedByMe ? "border-lime-300 bg-lime-50 text-lime-800 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#181d25]"}`}>{reaction.emoji} {reaction.count}</button>)}
          </div>
        ) : null}

        <div className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${outgoing ? "justify-end" : "justify-start"}`}>
          <span>{senderName}</span><span>•</span><span>{formatTime(message.createdAt)}</span>
          {outgoing ? <MessageStatus status={message.status} /> : null}
          {message.error ? <span className="max-w-56 truncate text-red-500" title={message.error}>{message.error}</span> : null}
        </div>
      </div>
      {outgoing ? <Avatar name={senderName} src={avatar} size="sm" /> : null}
    </div>
  );
}

function MessageStatus({ status }: { status: CustomerCareMessage["status"] }) {
  if (status === "queued") return <span className="text-amber-500">Đang chờ mạng</span>;
  if (status === "sending") return <LoaderCircle className="h-3.5 w-3.5 animate-spin" />;
  if (status === "failed") return <span className="text-red-500">Gửi lỗi</span>;
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />;
  if (status === "recalled") return <span>Đã thu hồi</span>;
  return <Check className="h-3.5 w-3.5" />;
}

function ActionRow({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${danger ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}>{icon}{label}</button>;
}

function initials(name: string) {
  const value = name.trim().split(/\s+/).filter(Boolean);
  return `${value.at(0)?.[0] || "K"}${value.length > 1 ? value.at(-1)?.[0] || "" : ""}`.toUpperCase();
}
