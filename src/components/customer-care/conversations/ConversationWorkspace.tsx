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
  useCustomerCareConversations,
  useSendCustomerCareMessage,
} from "@/features/customer-care/hooks/useCustomerCare";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";

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
  const conversation = findConversation(customerCareSource(conversationsQuery), selectedConversationId);
  const messagesQuery = useConversationMessages(selectedConversationId);
  const sendMessage = useSendCustomerCareMessage();

  useEffect(() => {
    const fromUrl = searchParams.get("conversationId");
    if (fromUrl && fromUrl !== selectedConversationId) {
      setSelectedConversationId(fromUrl);
      setMobileView("chat");
      return;
    }
    if (!selectedConversationId && conversations.length > 0) {
      const first = conversations[0].id;
      setSelectedConversationId(first);
    }
  }, [conversations, searchParams, selectedConversationId, setMobileView, setSelectedConversationId]);

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

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-white dark:bg-[#10121a]">
      <ConversationFilterRail />
      <div className={`${mobileView === "chat" ? "hidden md:flex" : "flex"} min-h-0 w-full md:w-auto`}>
        <ConversationList
          conversations={conversations}
          loading={conversationsQuery.isLoading}
          selectedId={selectedConversationId}
          onSelect={selectConversation}
        />
      </div>
      <div className={`${mobileView === "list" ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1`}>
        <MessagePanel
          conversation={conversation}
          messages={messagesQuery.data ?? []}
          loading={messagesQuery.isLoading}
          sending={sendMessage.isPending}
          onBack={backToList}
          onToggleCustomerPanel={() => setCustomerPanelOpen(!customerPanelOpen)}
          onSend={async (content) => {
            if (!selectedConversationId) return;
            await sendMessage.mutateAsync({ conversationId: selectedConversationId, content });
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

/**
 * The list hook returns filtered data for the left rail. The selected URL can
 * still point to a record that is hidden by the current filter, so keep the
 * selected object from the visible list when possible.
 */
function customerCareSource(query: ReturnType<typeof useCustomerCareConversations>) {
  return query.data;
}
