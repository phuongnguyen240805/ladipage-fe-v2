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
      return;
    }
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, searchParams, selectedConversationId, setMobileView, setSelectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !conversation?.unreadCount) return;
    void customerCareApi.markRead(selectedConversationId).catch(() => undefined);
  }, [conversation?.unreadCount, selectedConversationId]);

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
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
      <div className={`${mobileView === "chat" ? "hidden md:flex" : "flex"} min-h-0 w-full md:w-auto`}>
        <ConversationList
          conversations={conversations}
          loading={conversationsQuery.isLoading && conversations.length === 0}
          selectedId={selectedConversationId}
          onSelect={selectConversation}
        />
      </div>
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
          onSend={async (content, replyToMessageId) => {
            if (!selectedConversationId) return;
            await sendMessage.mutateAsync({
              conversationId: selectedConversationId,
              content,
              replyToMessageId,
              clientMessageId: crypto.randomUUID(),
            });
          }}
        />
        <CustomerDetailPanel
          conversation={conversation}
          open={customerPanelOpen}
          onClose={() => setCustomerPanelOpen(false)}
        />
      </div>
    </div>
  );
}
