"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomerCareConversation,
  CustomerCareDateRange,
  CustomerCareMessage,
  CustomerCareSettings,
} from "@liora/api-types";
import { queryKeys } from "@/lib/query-keys";
import {
  customerCareConversations,
  customerCareMessages,
  customerCareOverview,
  customerCareSettings,
} from "@/features/customer-care/data/mock-customer-care";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCustomerCareConversations() {
  const filter = useConversationUiStore((state) => state.filter);
  const channel = useConversationUiStore((state) => state.channel);
  const search = useConversationUiStore((state) => state.search);

  const query = useQuery({
    queryKey: queryKeys.customerCare.conversations({ filter, channel, search }),
    queryFn: async () => {
      await delay();
      return customerCareConversations;
    },
  });

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    return (query.data ?? []).filter((conversation) => {
      const filterMatches =
        filter === "all" ||
        (filter === "unassigned" && !conversation.assignee) ||
        conversation.status === filter;
      const channelMatches = channel === "all" || conversation.channel === channel;
      const searchMatches =
        !normalizedSearch ||
        conversation.customer.name.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.lastMessage.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.customer.phone?.includes(normalizedSearch);
      return filterMatches && channelMatches && searchMatches;
    });
  }, [channel, filter, query.data, search]);

  return { ...query, data: filtered };
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.customerCare.messages(conversationId ?? "none"),
    enabled: Boolean(conversationId),
    queryFn: async () => {
      await delay(140);
      return [...(customerCareMessages[conversationId ?? ""] ?? [])];
    },
  });
}

export function useSendCustomerCareMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      await delay(360);
      const message: CustomerCareMessage = {
        id: `local-${Date.now()}`,
        conversationId,
        direction: "outgoing",
        content,
        createdAt: new Date().toISOString(),
        senderName: "Bạn",
        status: "sent",
      };
      return message;
    },
    onMutate: async ({ conversationId, content }) => {
      const key = queryKeys.customerCare.messages(conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CustomerCareMessage[]>(key);
      const optimistic: CustomerCareMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        direction: "outgoing",
        content,
        createdAt: new Date().toISOString(),
        senderName: "Bạn",
        status: "sending",
      };
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => [
        ...current,
        optimistic,
      ]);
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: (message, variables, context) => {
      const key = queryKeys.customerCare.messages(variables.conversationId);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) =>
        current.map((item) => (item.id === context?.optimisticId ? message : item))
      );
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(
        queryKeys.customerCare.messages(variables.conversationId),
        context?.previous
      );
    },
  });
}

export function useCustomerCareOverview(dateRange: CustomerCareDateRange) {
  return useQuery({
    queryKey: queryKeys.customerCare.overview(dateRange),
    queryFn: async () => {
      await delay(320);
      return customerCareOverview;
    },
  });
}

export function useCustomerCareSettings() {
  return useQuery({
    queryKey: queryKeys.customerCare.settings,
    queryFn: async () => {
      await delay(220);
      return structuredClone(customerCareSettings);
    },
  });
}

export function useUpdateCustomerCareSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: CustomerCareSettings) => {
      await delay(500);
      return settings;
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.customerCare.settings, settings);
    },
  });
}

export function findConversation(
  conversations: CustomerCareConversation[] | undefined,
  id: string | null
) {
  return conversations?.find((conversation) => conversation.id === id) ?? null;
}
