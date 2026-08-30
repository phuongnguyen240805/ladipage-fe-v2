"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationFilterRail } from "@/components/customer-care/conversations/ConversationFilterRail";
import { ConversationList } from "@/components/customer-care/conversations/ConversationList";
import { MessagePanel } from "@/components/customer-care/conversations/MessagePanel";
import { CustomerDetailPanel } from "@/components/customer-care/conversations/CustomerDetailPanel";
import {
  findConversation,
  useConversationMessages,
  useCustomerCareCapabilities,
  useCustomerCareConversations,
  useCustomerCareRuntime,
  useSendCustomerCareMessage,
} from "@/features/customer-care/hooks/useCustomerCare";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";
import { customerCareSocket } from "@/features/customer-care/realtime/customer-care-socket";

export function ConversationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = useConversationUiStore((state) => state.selectedConversationId);
  const setSelectedConversationId = useConversationUiStore((state) => state.setSelectedConversationId);
  const mobileView = useConversationUiStore((state) => state.mobileView);
  const setMobileView = useConversationUiStore((state) => state.setMobileView);
  const customerPanelOpen = useConversationUiStore((state) => state.customerPanelOpen);
  const setCustomerPanelOpen = useConversationUiStore((state) => state.setCustomerPanelOpen);
  const conversationListWidth = useConversationUiStore((state) => state.conversationListWidth);
  const setConversationListWidth = useConversationUiStore((state) => state.setConversationListWidth);
  const customerPanelWidth = useConversationUiStore((state) => state.customerPanelWidth);
  const setCustomerPanelWidth = useConversationUiStore((state) => state.setCustomerPanelWidth);

  const conversationsQuery = useCustomerCareConversations();
  const conversations = conversationsQuery.data ?? [];
  const conversation = findConversation(conversations, selectedConversationId);
  const messagesQuery = useConversationMessages(selectedConversationId);
  const sendMessage = useSendCustomerCareMessage();
  const capabilitiesQuery = useCustomerCareCapabilities();
  const runtime = useCustomerCareRuntime(selectedConversationId);

  useEffect(() => {
    const fromUrl = searchParams.get("conversationId");
    if (fromUrl && fromUrl !== selectedConversationId) {
      setSelectedConversationId(fromUrl);
      setMobileView("chat");
      if (typeof window !== "undefined" && window.innerWidth < 1700) setCustomerPanelOpen(false);
      return;
    }
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, searchParams, selectedConversationId, setCustomerPanelOpen, setMobileView, setSelectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !conversation?.unreadCount) return;
    void customerCareApi.markRead(selectedConversationId).catch(() => undefined);
  }, [conversation?.unreadCount, selectedConversationId]);

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
    if (typeof window !== "undefined" && window.innerWidth < 1700) setCustomerPanelOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("conversationId", conversationId);
    router.replace(`/cskh/hoi-thoai?${params.toString()}`, { scroll: false });
  };

  const backToList = () => {
    setMobileView("list");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("conversationId");
    router.replace(`/cskh/hoi-thoai${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const connectionError =
    conversationsQuery.error instanceof Error
      ? conversationsQuery.error.message
      : messagesQuery.error instanceof Error
        ? messagesQuery.error.message
        : null;

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-white dark:bg-[#10121a]">
      {connectionError ? (
        <div className="absolute left-1/2 top-3 z-50 max-w-[90%] -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          Không thể đồng bộ Customer Care: {connectionError}
        </div>
      ) : null}
      <ConversationFilterRail />
      <div
        style={{ "--conversation-list-width": `${conversationListWidth}px` } as React.CSSProperties}
        className={`${mobileView === "chat" ? "hidden md:flex" : "flex"} min-h-0 w-full shrink-0 md:w-[320px] lg:w-[360px] xl:w-[var(--conversation-list-width)]`}
      >
        <ConversationList
          conversations={conversations}
          loading={conversationsQuery.isLoading && conversations.length === 0}
          selectedId={selectedConversationId}
          onSelect={selectConversation}
        />
      </div>
      <ResizeHandle onResize={(delta) => setConversationListWidth(conversationListWidth + delta)} className="hidden xl:block" />
      <div className={`${mobileView === "list" ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1`}>
        <MessagePanel
          conversation={conversation}
          conversations={conversations}
          messages={messagesQuery.data ?? []}
          loading={messagesQuery.isLoading && messagesQuery.data.length === 0}
          hasOlder={messagesQuery.hasOlder}
          loadingOlder={messagesQuery.loadingOlder}
          onLoadOlder={messagesQuery.loadOlder}
          sending={sendMessage.isPending}
          realtimeConnected={runtime.connected}
          online={runtime.online}
          capabilities={capabilitiesQuery.data}
          onBack={backToList}
          onToggleCustomerPanel={() => setCustomerPanelOpen(!customerPanelOpen)}
          onTypingStart={(conversationId) => customerCareSocket.typingStart(conversationId)}
          onTypingStop={(conversationId) => customerCareSocket.typingStop(conversationId)}
          onAiSuggest={async () => {
            if (!selectedConversationId) throw new Error("Chưa chọn hội thoại.");
            return customerCareApi.generateAiReply(selectedConversationId);
          }}
          onSend={async (content, replyToMessageId, files) => {
            if (!selectedConversationId) return;
            const uploaded = await Promise.all(files.map(async (file) => {
              const media = await customerCareApi.uploadMedia(file);
              const objectUrl = URL.createObjectURL(file);
              return {
                id: Number(media.id),
                preview: {
                  ...media,
                  id: String(media.id),
                  url: objectUrl,
                  thumbnailUrl: file.type.startsWith("image/") ? objectUrl : undefined,
                },
              };
            }));
            await sendMessage.mutateAsync({
              conversationId: selectedConversationId,
              content,
              replyToMessageId,
              clientMessageId: crypto.randomUUID(),
              attachments: uploaded,
            });
            uploaded.forEach((item) => {
              if (item.preview.url?.startsWith("blob:")) URL.revokeObjectURL(item.preview.url);
            });
          }}
        />
        {customerPanelOpen && conversation ? (
          <ResizeHandle onResize={(delta) => setCustomerPanelWidth(customerPanelWidth - delta)} className="hidden min-[1700px]:block" />
        ) : null}
        <CustomerDetailPanel
          conversation={conversation}
          open={customerPanelOpen}
          onClose={() => setCustomerPanelOpen(false)}
          width={customerPanelWidth}
        />
      </div>
    </div>
  );
}

function ResizeHandle({ onResize, className = "" }: {
  onResize: (delta: number) => void;
  className?: string;
}) {
  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const initialX = event.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - initialX;
      onResize(delta);
    };
    const stop = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={start}
      className={`group relative z-30 w-1 shrink-0 cursor-col-resize bg-slate-200/80 transition hover:bg-[#5b78b5] dark:bg-white/10 ${className}`}
    >
      <span className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}
