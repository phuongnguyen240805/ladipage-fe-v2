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
  setSelectedConversationId: (id: string | null) => void;
  setFilter: (filter: CustomerCareFilter) => void;
  setChannel: (channel: CustomerCareChannel | "all") => void;
  setSearch: (search: string) => void;
  setCustomerPanelOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
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
      setSelectedConversationId: (selectedConversationId) => set({ selectedConversationId }),
      setFilter: (filter) => set({ filter }),
      setChannel: (channel) => set({ channel }),
      setSearch: (search) => set({ search }),
      setCustomerPanelOpen: (customerPanelOpen) => set({ customerPanelOpen }),
      setMobileView: (mobileView) => set({ mobileView }),
    }),
    {
      name: "customer-care-conversation-ui-v2",
      partialize: (state) => ({
        filter: state.filter,
        channel: state.channel,
        customerPanelOpen: state.customerPanelOpen,
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
