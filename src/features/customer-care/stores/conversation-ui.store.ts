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

export type CustomerCareApp =
  | "zalo"
  | "facebook"
  | "telegram"
  | "instagram"
  | "whatsapp"
  | "tiktok"
  | "website";

export type ActiveChannelAccountIds = Partial<Record<CustomerCareApp, string>>;

interface ConversationUiState {
  selectedConversationId: string | null;
  filter: CustomerCareFilter;

  /**
   * Legacy single-channel state kept for backward compatibility with the
   * original Customer Care source. The new conversation header uses
   * selectedChannels instead.
   */
  channel: CustomerCareChannel | "all";

  /**
   * Legacy selected account. Existing connection/login components still use
   * this value, so it is intentionally preserved.
   */
  selectedChannelAccountId: string | null;

  /** One active account per social application. */
  activeChannelAccountIds: ActiveChannelAccountIds;

  /**
   * Empty array means "all active applications". Otherwise conversations are
   * merged only from the selected applications.
   */
  selectedChannels: CustomerCareApp[];

  search: string;
  customerPanelOpen: boolean;
  mobileView: "list" | "chat";
  conversationListWidth: number;
  customerPanelWidth: number;

  setSelectedConversationId: (id: string | null) => void;
  setFilter: (filter: CustomerCareFilter) => void;
  setChannel: (channel: CustomerCareChannel | "all") => void;
  setSelectedChannelAccountId: (id: string | null) => void;
  setActiveChannelAccountId: (app: CustomerCareApp, id: string | null) => void;
  setSelectedChannels: (channels: CustomerCareApp[]) => void;
  toggleSelectedChannel: (channel: CustomerCareApp) => void;
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
      activeChannelAccountIds: {},
      selectedChannels: [],
      search: "",
      customerPanelOpen: true,
      mobileView: "list",
      conversationListWidth: 400,
      customerPanelWidth: 390,

      setSelectedConversationId: (selectedConversationId) => set({ selectedConversationId }),
      setFilter: (filter) => set({ filter }),
      setChannel: (channel) => set({ channel }),
      setSelectedChannelAccountId: (selectedChannelAccountId) =>
        set({ selectedChannelAccountId, selectedConversationId: null }),
      setActiveChannelAccountId: (app, id) =>
        set((state) => ({
          activeChannelAccountIds: {
            ...state.activeChannelAccountIds,
            [app]: id ?? undefined,
          },
          // Keep the original login/status hooks compatible with the account
          // the user has just selected in the sub-menu.
          selectedChannelAccountId: id,
          selectedConversationId: null,
        })),
      setSelectedChannels: (selectedChannels) =>
        set({ selectedChannels: [...new Set(selectedChannels)], selectedConversationId: null }),
      toggleSelectedChannel: (channel) =>
        set((state) => ({
          selectedChannels: state.selectedChannels.includes(channel)
            ? state.selectedChannels.filter((item) => item !== channel)
            : [...state.selectedChannels, channel],
          selectedConversationId: null,
        })),
      setSearch: (search) => set({ search }),
      setCustomerPanelOpen: (customerPanelOpen) => set({ customerPanelOpen }),
      setMobileView: (mobileView) => set({ mobileView }),
      setConversationListWidth: (width) =>
        set({ conversationListWidth: Math.max(280, Math.min(560, width)) }),
      setCustomerPanelWidth: (width) =>
        set({ customerPanelWidth: Math.max(300, Math.min(560, width)) }),
      resetSession: () =>
        set({
          selectedConversationId: null,
          search: "",
          mobileView: "list",
          selectedChannelAccountId: null,
          activeChannelAccountIds: {},
          selectedChannels: [],
        }),
    }),
    {
      name: "customer-care-conversation-ui-v3",
      partialize: (state) => ({
        filter: state.filter,
        channel: state.channel,
        activeChannelAccountIds: state.activeChannelAccountIds,
        selectedChannels: state.selectedChannels,
        customerPanelOpen: state.customerPanelOpen,
        conversationListWidth: state.conversationListWidth,
        customerPanelWidth: state.customerPanelWidth,
      }),
    }
  )
);

export function customerCareProviderToApp(provider?: string | null): CustomerCareApp | null {
  const value = String(provider ?? "").trim().toLowerCase();
  if (!value) return null;
  if (value.includes("zalo")) return "zalo";
  if (value.includes("facebook") || value.includes("messenger")) return "facebook";
  if (value.includes("telegram")) return "telegram";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("whatsapp")) return "whatsapp";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("website") || value.includes("webchat") || value.includes("widget")) return "website";
  return null;
}

export function customerCareChannelToApp(channel?: string | null): CustomerCareApp | null {
  return customerCareProviderToApp(channel);
}

export function mapUiFilterToStatus(
  filter: CustomerCareFilter
): CustomerCareConversationStatus | undefined {
  if (["unread", "open", "pending", "resolved"].includes(filter)) {
    return filter as CustomerCareConversationStatus;
  }
  return undefined;
}
