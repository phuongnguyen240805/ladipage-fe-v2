import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerCareChannel, CustomerCareConversationStatus } from "@liora/api-types";

export type CustomerCareFilter =
  | "all"
  | "unread"
  | "open"
  | "pending"
  | "resolved"
  | "unassigned";

interface ConversationUiState {
  selectedConversationId: string | null;
  filter: CustomerCareFilter;
  channel: CustomerCareChannel | "all";
  selectedChannelAccountId: string | null;
  search: string;
  customerPanelOpen: boolean;
  mobileView: "list" | "chat";
  conversationListWidth: number;
  customerPanelWidth: number;
  setSelectedConversationId: (id: string | null) => void;
  setFilter: (filter: CustomerCareFilter) => void;
  setChannel: (channel: CustomerCareChannel | "all") => void;
  setSelectedChannelAccountId: (id: string | null) => void;
  setSearch: (search: string) => void;
  setCustomerPanelOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
  setConversationListWidth: (width: number) => void;
  setCustomerPanelWidth: (width: number) => void;
  resetSession: () => void;
}

export const useConversationUiStore = create<ConversationUiState>()(
  persist(
    (set) => ({
      selectedConversationId: null,
      filter: "all",
      channel: "all",
      selectedChannelAccountId: null,
      search: "",
      customerPanelOpen: true,
      mobileView: "list",
      conversationListWidth: 400,
      customerPanelWidth: 390,
      setSelectedConversationId: (selectedConversationId) => set({ selectedConversationId }),
      setFilter: (filter) => set({ filter }),
      setChannel: (channel) => set({ channel }),
      setSelectedChannelAccountId: (selectedChannelAccountId) => set({ selectedChannelAccountId, selectedConversationId: null }),
      setSearch: (search) => set({ search }),
      setCustomerPanelOpen: (customerPanelOpen) => set({ customerPanelOpen }),
      setMobileView: (mobileView) => set({ mobileView }),
      setConversationListWidth: (width) => set({ conversationListWidth: Math.max(280, Math.min(560, width)) }),
      setCustomerPanelWidth: (width) => set({ customerPanelWidth: Math.max(300, Math.min(560, width)) }),
      resetSession: () => set({
        selectedConversationId: null,
        search: "",
        mobileView: "list",
        selectedChannelAccountId: null,
      }),
    }),
    {
      name: "customer-care-conversation-ui-v2",
      partialize: (state) => ({
        filter: state.filter,
        channel: state.channel,
        customerPanelOpen: state.customerPanelOpen,
        conversationListWidth: state.conversationListWidth,
        customerPanelWidth: state.customerPanelWidth,
      }),
    }
  )
);

export function mapUiFilterToStatus(
  filter: CustomerCareFilter
): CustomerCareConversationStatus | undefined {
  if (["unread", "open", "pending", "resolved"].includes(filter)) {
    return filter as CustomerCareConversationStatus;
  }
  return undefined;
}
