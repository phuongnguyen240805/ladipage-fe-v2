"use client";

import type {
  CustomerCareConversation,
  CustomerCareMessage,
} from "@liora/api-types";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  ContactRound,
  Copy,
  FileText,
  History,
  ImagePlus,
  Info,
  Link2,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomerCareEmptyState } from "@/components/customer-care/shared/CustomerCareEmptyState";
import { CustomerCareSkeleton } from "@/components/customer-care/shared/CustomerCareSkeleton";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateKey(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
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

const quickTags = [
  { label: "Công việc", className: "bg-lime-700 text-white" },
  { label: "Bạn bè", className: "bg-lime-600 text-white" },
  { label: "Trả lời sau", className: "bg-emerald-600 text-white" },
  { label: "Đồng nghiệp", className: "bg-teal-700 text-white" },
  { label: "Kiểm hàng", className: "bg-slate-600 text-white" },
  { label: "Câu hỏi", className: "bg-violet-600 text-white" },
  { label: "Mua hàng", className: "bg-blue-600 text-white" },
  { label: "Đã gửi", className: "bg-emerald-700 text-white" },
  { label: "Hết hàng", className: "bg-cyan-700 text-white" },
  { label: "Trả hàng", className: "bg-rose-600 text-white" },
  { label: "Khách hàng", className: "bg-fuchsia-700 text-white" },
  { label: "Gia đình", className: "bg-purple-700 text-white" },
];

export function MessagePanel({
  conversation,
  messages,
  loading,
  onSend,
  onBack,
  onToggleCustomerPanel,
  sending,
}: {
  conversation: CustomerCareConversation | null;
  messages: CustomerCareMessage[];
  loading: boolean;
  sending: boolean;
  onSend: (content: string) => Promise<void>;
  onBack: () => void;
  onToggleCustomerPanel: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const drafts = useConversationUiStore((state) => state.drafts);
  const setDraft = useConversationUiStore((state) => state.setDraft);
  const clearDraft = useConversationUiStore((state) => state.clearDraft);

  const draft = conversation ? drafts[conversation.id] ?? "" : "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, conversation?.id]);

  const grouped = useMemo(() => {
    const result: Array<{
      key: string;
      label: string;
      messages: CustomerCareMessage[];
    }> = [];

    for (const message of messages) {
      const key = formatDateKey(message.createdAt);
      const current = result[result.length - 1];
      if (!current || current.key !== key) {
        result.push({
          key,
          label: formatDateLabel(message.createdAt),
          messages: [message],
        });
      } else {
        current.messages.push(message);
      }
    }
    return result;
  }, [messages]);

  if (!conversation) {
    return (
      <section className="hidden min-w-0 flex-1 bg-slate-100 dark:bg-[#10141b] md:block">
        <CustomerCareEmptyState
          title="Chọn một hội thoại"
          description="Nội dung tin nhắn và công cụ chăm sóc khách hàng sẽ xuất hiện tại đây."
        />
      </section>
    );
  }

  const submit = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    clearDraft(conversation.id);
    await onSend(content);
  };

  const replyFrom = conversation.assignee?.name ?? "LadiPage";

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-slate-100 dark:bg-[#10141b]">
      <header className="flex h-[70px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-[#11151c] sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-white/5"
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <img
          src={conversation.customer.avatar}
          alt=""
          className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/15"
        />

        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {conversation.customer.name}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Chưa có người xem
          </p>
          <div className="mt-1 flex items-center gap-2 text-slate-400">
            <Link2 className="h-3.5 w-3.5" />
            <History className="h-3.5 w-3.5" />
            <span className="h-3.5 w-3.5 rounded-full bg-lime-500 ring-2 ring-lime-500/20" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 text-slate-500 dark:text-slate-300">
          <HeaderTool label="Người tham gia">
            <UsersRound className="h-5 w-5" />
          </HeaderTool>
          <div className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-white/10 lg:block" />
          <HeaderTool label="Sao chép">
            <Copy className="h-5 w-5" />
          </HeaderTool>
          <HeaderTool label="Email">
            <Mail className="h-5 w-5" />
          </HeaderTool>
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              searchOpen
                ? "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300"
                : "hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
            title="Tìm trong hội thoại"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleCustomerPanel}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            title="Thông tin khách hàng"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </header>

      {searchOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-[#11151c]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              placeholder="Tìm nội dung tin nhắn..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>
      ) : null}

      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(100,116,139,0.08) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      >
        {loading ? (
          <CustomerCareSkeleton rows={5} />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">
            {conversation.postTitle ? (
              <div className="mx-auto max-w-lg rounded-xl border border-lime-200 bg-white p-3 text-xs text-slate-600 shadow-sm dark:border-lime-500/20 dark:bg-[#151a20] dark:text-slate-300">
                <div className="mb-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                  <FileText className="h-4 w-4 text-lime-600" /> Hội thoại từ bài viết
                </div>
                <p className="truncate">{conversation.postTitle}</p>
              </div>
            ) : null}

            {grouped.map((group) => (
              <div key={group.key}>
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-slate-200/90 px-4 py-1 text-[11px] font-medium text-slate-600 dark:bg-black/30 dark:text-slate-300">
                    {group.label}
                  </span>
                </div>
                <div className="space-y-3.5">
                  {group.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      conversation={conversation}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c]">
        <div className="grid grid-cols-4 gap-px bg-slate-200 dark:bg-white/10">
          {quickTags.slice(0, 4).map((tag) => (
            <QuickTag
              key={tag.label}
              {...tag}
              onClick={() => setDraft(conversation.id, `${draft}${draft ? " " : ""}#${tag.label}`)}
            />
          ))}
        </div>
        <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-white/10">
          {quickTags.slice(4).map((tag) => (
            <QuickTag
              key={tag.label}
              {...tag}
              onClick={() => setDraft(conversation.id, `${draft}${draft ? " " : ""}#${tag.label}`)}
            />
          ))}
        </div>
      </div>

      <footer className="relative shrink-0 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c]">
        <div className="flex h-10 items-center gap-2 px-3 text-xs text-slate-500 dark:text-slate-400">
          <ContactRound className="h-5 w-5 text-lime-600 dark:text-lime-400" />
          <span>Trả lời từ</span>
          <strong className="font-semibold text-slate-700 dark:text-slate-200">{replyFrom}</strong>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(conversation.id, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder={`Nhập tin nhắn cho ${conversation.customer.name}...`}
          className="block min-h-[54px] w-full resize-none bg-transparent px-4 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
        />

        <div className="flex h-11 items-center gap-1 px-2 pb-1 text-slate-500 dark:text-slate-300">
          <CircleHelp className="mr-auto h-5 w-5 text-slate-400" />
          <ComposerTool label="Thông tin khách hàng">
            <ContactRound className="h-5 w-5" />
          </ComposerTool>
          <ComposerTool label="Ghi chú">
            <MessageSquareText className="h-5 w-5" />
          </ComposerTool>
          <ComposerTool label="Đính kèm">
            <Paperclip className="h-5 w-5" />
          </ComposerTool>
          <ComposerTool label="Hình ảnh">
            <ImagePlus className="h-5 w-5" />
          </ComposerTool>
          <ComposerTool label="Emoji">
            <Smile className="h-5 w-5" />
          </ComposerTool>

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickRepliesOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/5 dark:hover:text-lime-300"
              title="Trả lời nhanh"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {quickRepliesOpen ? (
              <div className="absolute bottom-11 right-0 z-30 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#181d25]">
                {[
                  "Xin chào, LadiPage có thể hỗ trợ gì cho bạn?",
                  "Cảm ơn bạn đã cung cấp thông tin. Chúng tôi đang kiểm tra ngay.",
                  "Bạn vui lòng để lại số điện thoại để đội ngũ tư vấn liên hệ nhé.",
                ].map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => {
                      setDraft(conversation.id, reply);
                      setQuickRepliesOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs leading-5 text-slate-600 hover:bg-lime-50 hover:text-lime-700 dark:text-slate-300 dark:hover:bg-lime-500/10 dark:hover:text-lime-300"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!draft.trim() || sending}
            onClick={() => void submit()}
            className="ml-1 flex h-9 w-10 items-center justify-center rounded-lg bg-lime-500 text-white shadow-sm transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-40"
            title="Gửi tin nhắn"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </section>
  );
}

function HeaderTool({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      className="hidden h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/5 dark:hover:text-lime-300 lg:flex"
    >
      {children}
    </button>
  );
}

function ComposerTool({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/5 dark:hover:text-lime-300"
    >
      {children}
    </button>
  );
}

function QuickTag({
  label,
  className,
  onClick,
}: {
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 truncate px-1 text-[10px] font-semibold transition hover:brightness-110 ${className}`}
    >
      {label}
    </button>
  );
}

function MessageBubble({
  message,
  conversation,
}: {
  message: CustomerCareMessage;
  conversation: CustomerCareConversation;
}) {
  const outgoing = message.direction === "outgoing";
  const avatar = outgoing
    ? conversation.assignee?.avatar ?? conversation.customer.avatar
    : conversation.customer.avatar;

  return (
    <div className={`flex items-end gap-2 ${outgoing ? "justify-end" : "justify-start"}`}>
      {!outgoing ? (
        <img
          src={avatar}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/20"
        />
      ) : null}

      <div className={`max-w-[82%] sm:max-w-[72%] ${outgoing ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-5 shadow-sm ${
            outgoing
              ? "rounded-br-sm bg-lime-500 text-slate-950"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#151a20] dark:text-slate-100"
          }`}
        >
          {message.attachments?.map((attachment) => (
            <div
              key={attachment.id}
              className={`mb-2 flex min-w-[180px] items-center gap-2 rounded-lg p-2 ${
                outgoing ? "bg-black/10" : "bg-slate-50 dark:bg-white/5"
              }`}
            >
              <ImagePlus className="h-5 w-5" />
              <span className="truncate text-[11px] font-semibold">{attachment.name}</span>
            </div>
          ))}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
            outgoing ? "justify-end" : "justify-start"
          }`}
        >
          <span>{message.senderName}</span>
          <span>•</span>
          <span>{formatTime(message.createdAt)}</span>
          {outgoing ? (
            message.status === "delivered" ? (
              <CheckCheck className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          ) : null}
        </div>
      </div>

      {outgoing ? (
        <img
          src={avatar}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/20"
        />
      ) : null}
    </div>
  );
}
