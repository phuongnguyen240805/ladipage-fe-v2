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
  search: string;
  customerPanelOpen: boolean;
  mobileView: "list" | "chat";
  drafts: Record<string, string>;
  setSelectedConversationId: (id: string | null) => void;
  setFilter: (filter: CustomerCareFilter) => void;
  setChannel: (channel: CustomerCareChannel | "all") => void;
  setSearch: (search: string) => void;
  setCustomerPanelOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
  setDraft: (conversationId: string, value: string) => void;
  clearDraft: (conversationId: string) => void;
}

export const useConversationUiStore = create<ConversationUiState>()(
  persist(
    (set) => ({
      selectedConversationId: null,
      filter: "all",
      channel: "all",
      search: "",
      customerPanelOpen: true,
      mobileView: "list",
      drafts: {},
      setSelectedConversationId: (selectedConversationId) => set({ selectedConversationId }),
      setFilter: (filter) => set({ filter }),
      setChannel: (channel) => set({ channel }),
      setSearch: (search) => set({ search }),
      setCustomerPanelOpen: (customerPanelOpen) => set({ customerPanelOpen }),
      setMobileView: (mobileView) => set({ mobileView }),
      setDraft: (conversationId, value) =>
        set((state) => ({ drafts: { ...state.drafts, [conversationId]: value } })),
      clearDraft: (conversationId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[conversationId];
          return { drafts };
        }),
    }),
    {
      name: "customer-care-conversation-ui-v1",
      partialize: (state) => ({
        filter: state.filter,
        channel: state.channel,
        customerPanelOpen: state.customerPanelOpen,
        drafts: state.drafts,
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
