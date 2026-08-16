"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomerCareCapabilities,
  CustomerCareAttachment,
  CustomerCareChannelAccount,
  CustomerCareConversation,
  CustomerCareDateRange,
  CustomerCareMessage,
  CustomerCareSettings,
  CustomerCareSyncEvent,
} from "@liora/api-types";
import { queryKeys } from "@/lib/query-keys";
import {
  customerCareOverview,
  customerCareSettings,
} from "@/features/customer-care/data/mock-customer-care";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";
import {
  customerCareChannelToApp,
  customerCareProviderToApp,
  useConversationUiStore,
  type CustomerCareApp,
} from "@/features/customer-care/stores/conversation-ui.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  customerCareQueryKey,
  useCustomerCareScopeKey,
} from '@/features/customer-care/session/customer-care-scope'
import {
  addPendingEvent,
  clearCustomerCareServerCache,
  deleteCachedConversation,
  deleteDraft,
  getLastSequence,
  listOutbox,
  listPendingEvents,
  queueOutgoingMessage,
  readCachedConversations,
  readCachedMessages,
  readDraft,
  removeOutbox,
  removePendingEvent,
  requestPersistentCustomerCareStorage,
  setLastSequence,
  updateOutbox,
  writeCachedConversations,
  writeCachedMessages,
  writeDraft,
} from "@/features/customer-care/storage/customer-care-db";
import {
  customerCareSocket,
  type CustomerCareRealtimeEvent,
} from "@/features/customer-care/realtime/customer-care-socket";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const typingExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>();
// WebSocket is primary; polling is only a quiet recovery path.
const CUSTOMER_CARE_POLL_MS = 30_000;

const CUSTOMER_CARE_DELIVERY_STATUS_RANK: Partial<
  Record<CustomerCareMessage["status"], number>
> = {
  queued: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

function mergeCustomerCareDeliveryStatus(
  current: CustomerCareMessage["status"],
  incoming: CustomerCareMessage["status"],
): CustomerCareMessage["status"] {
  if (current === "recalled") return current;
  if (incoming === "recalled") return incoming;

  // A delivery failure is meaningful while a message is still being sent.
  // Never let a late failure event downgrade a message already sent/delivered/read.
  if (incoming === "failed") {
    return current === "queued" || current === "sending" ? incoming : current;
  }

  // A successful retry may recover a previously failed optimistic message.
  if (current === "failed") return incoming;

  const currentRank = CUSTOMER_CARE_DELIVERY_STATUS_RANK[current];
  const incomingRank = CUSTOMER_CARE_DELIVERY_STATUS_RANK[incoming];
  if (currentRank === undefined || incomingRank === undefined) return incoming;
  return incomingRank >= currentRank ? incoming : current;
}

export function useCustomerCareCapabilities() {
  const scopeKey = useCustomerCareScopeKey()
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'capabilities'),
    enabled: Boolean(scopeKey),
    queryFn: () => customerCareApi.capabilities(),
    staleTime: 5 * 60_000,
  });
}

function channelIdentityKey(account: CustomerCareChannelAccount) {
  const statusAccountId = String(account.status?.account_id ?? "").trim();
  const externalAccountId = String(account.externalAccountId ?? "").trim();
  if (statusAccountId && !statusAccountId.startsWith("pending:")) {
    return `${account.provider}:${statusAccountId}`;
  }
  if (externalAccountId && !externalAccountId.startsWith("pending:")) {
    return `${account.provider}:${externalAccountId}`;
  }
  return `${account.provider}:row:${account.id}`;
}

function channelQuality(account: CustomerCareChannelAccount) {
  const phase = String(account.status?.phase ?? "").toLowerCase();
  const connected = phase === "connected" ? 100 : 0;
  const persistedIdentity = String(account.externalAccountId ?? "").startsWith("pending:") ? 0 : 20;
  const healthy = phase !== "error" ? 5 : 0;
  return connected + persistedIdentity + healthy;
}

function isVisibleChannel(account: CustomerCareChannelAccount) {
  // Keep fresh pending rows visible because the first-time QR/login gate needs
  // them immediately after POST /channels. The backend retires true duplicate
  // identities and suppresses stale abandoned drafts.
  return account.enabled !== false;
}

export function dedupeCustomerCareChannels(rows: CustomerCareChannelAccount[]) {
  const byIdentity = new Map<string, CustomerCareChannelAccount>();
  for (const row of rows.filter(isVisibleChannel)) {
    const key = channelIdentityKey(row);
    const current = byIdentity.get(key);
    if (!current || channelQuality(row) > channelQuality(current)) {
      byIdentity.set(key, row);
    }
  }
  return [...byIdentity.values()].sort((a, b) => Number(a.id) - Number(b.id));
}

export function useCustomerCareChannels() {
  const scopeKey = useCustomerCareScopeKey()
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'channels'),
    enabled: Boolean(scopeKey),
    queryFn: () => customerCareApi.listChannels(),
    select: dedupeCustomerCareChannels,
    staleTime: 10_000,
    refetchInterval: 20_000,
  })
}

function useSelectedChannel(provider: 'zalo_personal' | 'facebook_personal') {
  const channels = useCustomerCareChannels()
  const selectedId = useConversationUiStore((state) => state.selectedChannelAccountId)
  const activeChannelAccountIds = useConversationUiStore((state) => state.activeChannelAccountIds)
  const providerChannels = (channels.data ?? []).filter((item) => item.provider === provider)
  const app = customerCareProviderToApp(provider)
  const activeId = app ? activeChannelAccountIds[app] : undefined
  const channel = providerChannels.find((item) => item.id === activeId)
    ?? providerChannels.find((item) => item.id === selectedId)
    ?? providerChannels[0]
  return { channels, channel }
}

export function useCreateCustomerCareChannel() {
  const queryClient = useQueryClient()
  const scopeKey = useCustomerCareScopeKey()
  const setSelected = useConversationUiStore((state) => state.setSelectedChannelAccountId)
  return useMutation({
    mutationFn: (provider: 'zalo_personal' | 'facebook_personal') => customerCareApi.createChannel(provider),
    onSuccess: (channel) => {
      setSelected(channel.id)
      if (scopeKey) void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, 'channels') })
    },
  })
}

export function useZaloConnectionStatus() {
  const scopeKey = useCustomerCareScopeKey()
  const { channel } = useSelectedChannel('zalo_personal')
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'channel', channel?.id ?? 'none', 'status'),
    enabled: Boolean(scopeKey && channel),
    queryFn: () => customerCareApi.getZaloStatus(channel!.id),
    refetchInterval: (query) =>
      query.state.data?.phase === "connected" ? 20_000 : 2_000,
    retry: 1,
  });
}

export function useFacebookConnectionStatus() {
  const scopeKey = useCustomerCareScopeKey()
  const { channel } = useSelectedChannel('facebook_personal')
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'channel', channel?.id ?? 'none', 'status'),
    enabled: Boolean(scopeKey && channel),
    queryFn: () => customerCareApi.getFacebookStatus(channel!.id),
    refetchInterval: (query) => query.state.data?.phase === "connected" ? 20_000 : false,
    retry: 1,
  });
}

export function useLoginFacebook() {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey()
  return useMutation({
    mutationFn: ({ channelId, cookie }: { channelId: string; cookie: string }) => {
      if (!channelId) throw new Error('Hãy chọn tài khoản Facebook cần kết nối')
      return customerCareApi.loginFacebook(channelId, cookie)
    },
    onSuccess: (status, { channelId }) => {
      if (scopeKey) queryClient.setQueryData(customerCareQueryKey(scopeKey, 'channel', channelId, 'status'), status)
    },
  });
}

export function useDisconnectFacebook() {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey()
  const { channel } = useSelectedChannel('facebook_personal')
  const setSelected = useConversationUiStore((state) => state.setSelectedChannelAccountId)
  const setActive = useConversationUiStore((state) => state.setActiveChannelAccountId)
  return useMutation({
    mutationFn: () => {
      if (!channel) throw new Error('Hãy chọn tài khoản Facebook')
      return customerCareApi.disconnectFacebookSession(channel.id)
    },
    onSuccess: () => {
      if (!scopeKey || !channel) return
      queryClient.setQueryData<CustomerCareChannelAccount[]>(
        customerCareQueryKey(scopeKey, 'channels'),
        (current) => (current ?? []).filter((item) => item.id !== channel.id),
      )
      queryClient.removeQueries({ queryKey: customerCareQueryKey(scopeKey, 'channel', channel.id) })
      setSelected(null)
      setActive('facebook', null)
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, 'channels') })
    },
  });
}

export function useZaloQrUrl(enabled: boolean) {
  const { channel } = useSelectedChannel('zalo_personal')
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled || !channel) {
      setUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }
    let cancelled = false;
    void customerCareApi
      .getZaloQrBlob(channel.id)
      .then((blob) => {
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        setUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return next;
        });
        setError(null);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason : new Error(String(reason)));
      });
    return () => {
      cancelled = true;
    };
  }, [channel, enabled, version]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return { url, error, refresh: () => setVersion((value) => value + 1) };
}

export function useRefreshZaloQr() {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey()
  const { channel } = useSelectedChannel('zalo_personal')
  return useMutation({
    mutationFn: () => {
      if (!channel) throw new Error('Hãy chọn tài khoản Zalo')
      return customerCareApi.refreshZaloQr(channel.id)
    },
    onSuccess: (status) => {
      if (scopeKey && channel) queryClient.setQueryData(customerCareQueryKey(scopeKey, 'channel', channel.id, 'status'), status);
    },
  });
}

export function useCustomerCareConversations() {
  const scopeKey = useCustomerCareScopeKey()
  const filter = useConversationUiStore((state) => state.filter);
  const legacyChannel = useConversationUiStore((state) => state.channel);
  const search = useConversationUiStore((state) => state.search);
  const selectedChannels = useConversationUiStore((state) => state.selectedChannels);
  const activeChannelAccountIds = useConversationUiStore((state) => state.activeChannelAccountIds);
  const legacyChannelAccountId = useConversationUiStore((state) => state.selectedChannelAccountId);
  const channelsQuery = useCustomerCareChannels();
  const queryClient = useQueryClient();
  const multiAccountMode = (channelsQuery.data ?? []).filter((item) => item.enabled !== false).length > 1;

  const accountSignature = useMemo(
    () => (channelsQuery.data ?? [])
      .map((item) => `${item.id}:${item.provider}:${item.enabled ? 1 : 0}`)
      .sort()
      .join('|'),
    [channelsQuery.data],
  );
  const activeSignature = useMemo(
    () => Object.entries(activeChannelAccountIds)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([app, id]) => `${app}:${id ?? ''}`)
      .join('|'),
    [activeChannelAccountIds],
  );
  const selectedSignature = selectedChannels.join('|');
  const key = customerCareQueryKey(scopeKey ?? 'signed-out', 'conversations', {
    filter,
    search,
    selectedSignature,
    activeSignature,
    accountSignature,
    legacyChannel,
    legacyChannelAccountId,
  });

  useEffect(() => {
    if (!scopeKey || multiAccountMode) return;
    // The IndexedDB conversation cache is namespace-wide, not account-scoped.
    // Hydrating it while multiple accounts are selectable briefly mixed the
    // previous account into the newly selected inbox. In multi-account mode
    // the network/query cache is the source of truth.
    void readCachedConversations(scopeKey).then((cached) => {
      if (cached.length) queryClient.setQueryData(key, cached);
    }).catch(() => undefined);
  }, [key, multiAccountMode, queryClient, scopeKey]);

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(scopeKey),
    queryFn: async () => {
      const channelAccounts = (channelsQuery.data ?? []).filter((item) => item.enabled !== false);
      const availableApps = [...new Set(
        channelAccounts
          .map((item) => customerCareProviderToApp(item.provider))
          .filter((app): app is CustomerCareApp => Boolean(app)),
      )];

      // Empty selection means Unified Inbox: one active account per available app.
      // If there are no channel accounts yet, keep the original API behaviour.
      const apps = selectedChannels.length ? selectedChannels : availableApps;
      const requests: Array<Promise<{ items: CustomerCareConversation[] }>> = [];

      for (const app of apps) {
        const appAccounts = channelAccounts.filter(
          (item) => customerCareProviderToApp(item.provider) === app,
        );
        if (!appAccounts.length) continue;

        const preferredId = activeChannelAccountIds[app];
        const activeAccount = appAccounts.find((item) => item.id === preferredId) ?? appAccounts[0];
        const numericAccountId = Number(activeAccount.id);

        requests.push(
          customerCareApi.listConversations({
            search: search || undefined,
            status: filter === "all" || filter === "unassigned" ? undefined : filter,
            channel: app,
            channelAccountId: Number.isFinite(numericAccountId) ? numericAccountId : undefined,
            limit: 100,
          }),
        );
      }

      // Preserve the source project's original behaviour before accounts exist
      // or for legacy installations that have not migrated to per-app selection.
      if (!requests.length) {
        // An explicit app selection with no account must show an empty inbox,
        // not leak conversations from another application/account.
        if (selectedChannels.length > 0 && channelAccounts.length > 0) {
          return [];
        }
        requests.push(
          customerCareApi.listConversations({
            search: search || undefined,
            status: filter === "all" || filter === "unassigned" ? undefined : filter,
            channel: legacyChannel === "all" ? undefined : legacyChannel,
            channelAccountId: legacyChannelAccountId ? Number(legacyChannelAccountId) : undefined,
            limit: 100,
          }),
        );
      }

      const pages = await Promise.all(requests);
      const merged = new Map<string, CustomerCareConversation>();
      for (const page of pages) {
        for (const conversation of page.items) merged.set(conversation.id, conversation);
      }
      const items = [...merged.values()].sort(
        (left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
      );

      if (scopeKey) await writeCachedConversations(items, scopeKey).catch(() => undefined);
      return items;
    },
    refetchInterval: CUSTOMER_CARE_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    return (query.data ?? []).filter((conversation) => {
      const filterMatches =
        filter === "all" ||
        (filter === "unassigned" && !conversation.assignee) ||
        conversation.status === filter;
      const conversationApp = customerCareChannelToApp(String(conversation.channel));
      const channelMatches =
        selectedChannels.length === 0 ||
        (conversationApp ? selectedChannels.includes(conversationApp) : false);
      const expectedAccountId = conversationApp ? activeChannelAccountIds[conversationApp] : undefined;
      const accountMatches =
        !expectedAccountId ||
        !conversation.channelAccountId ||
        String(conversation.channelAccountId) === String(expectedAccountId);
      const searchMatches =
        !normalizedSearch ||
        conversation.customer.name.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.lastMessage.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.customer.phone?.includes(normalizedSearch);
      return filterMatches && channelMatches && accountMatches && searchMatches && !conversation.archived;
    });
  }, [activeChannelAccountIds, filter, query.data, search, selectedChannels]);

  return { ...query, data: filtered };
}

export function useDeleteCustomerCareConversation() {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey();
  const selectedConversationId = useConversationUiStore(
    (state) => state.selectedConversationId,
  );
  const setSelectedConversationId = useConversationUiStore(
    (state) => state.setSelectedConversationId,
  );

  return useMutation({
    mutationFn: ({
      conversationId,
      channelAccountId,
    }: {
      conversationId: string;
      channelAccountId?: string;
    }) => customerCareApi.deleteConversation(conversationId, channelAccountId),

    onMutate: async ({ conversationId }) => {
      if (!scopeKey) return undefined;

      const conversationsKey = customerCareQueryKey(scopeKey, "conversations");
      await queryClient.cancelQueries({ queryKey: conversationsKey });

      const snapshots =
        queryClient.getQueriesData<CustomerCareConversation[]>({
          queryKey: conversationsKey,
        });

      for (const [queryKey, current] of snapshots) {
        if (!Array.isArray(current)) continue;
        queryClient.setQueryData(
          queryKey,
          current.filter((item) => item.id !== conversationId),
        );
      }

      const wasSelected = selectedConversationId === conversationId;
      if (wasSelected) setSelectedConversationId(null);

      await deleteCachedConversation(conversationId, scopeKey).catch(
        () => undefined,
      );
      queryClient.removeQueries({
        queryKey: customerCareQueryKey(scopeKey, "messages", conversationId),
      });

      return { snapshots, wasSelected };
    },

    onError: (_error, variables, context) => {
      for (const [queryKey, previous] of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, previous);
      }
      if (context?.wasSelected) {
        setSelectedConversationId(variables.conversationId);
      }
    },

    onSettled: () => {
      if (!scopeKey) return;
      void queryClient.invalidateQueries({
        queryKey: customerCareQueryKey(scopeKey, "conversations"),
      });
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  const scopeKey = useCustomerCareScopeKey()
  const queryClient = useQueryClient();
  const key = customerCareQueryKey(scopeKey ?? 'signed-out', 'messages', conversationId ?? 'none');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    setNextCursor(undefined);
    if (!conversationId || !scopeKey) return;
    void readCachedMessages(conversationId, scopeKey).then((cached) => {
      if (cached.length) queryClient.setQueryData(key, cached);
    }).catch(() => undefined);
  }, [conversationId, key, queryClient, scopeKey]);

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(scopeKey && conversationId),
    queryFn: async () => {
      const page = await customerCareApi.listMessages(conversationId ?? "");
      const items = mergeMessages([], page.items);
      setNextCursor(page.nextCursor);
      if (scopeKey) await writeCachedMessages(conversationId ?? "", items, scopeKey).catch(() => undefined);
      return items;
    },
    refetchInterval: conversationId ? CUSTOMER_CARE_POLL_MS : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const loadOlder = useCallback(async () => {
    if (!conversationId || !nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await customerCareApi.listMessages(conversationId, nextCursor);
      setNextCursor(page.nextCursor);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => {
        const next = mergeMessages(current, page.items);
        if (scopeKey) void writeCachedMessages(conversationId, next, scopeKey);
        return next;
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, key, loadingOlder, nextCursor, queryClient, scopeKey]);

  return {
    ...query,
    data: query.data ?? [],
    hasOlder: Boolean(nextCursor),
    loadingOlder,
    loadOlder,
  };
}

export function useSendCustomerCareMessage() {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      replyToMessageId,
      clientMessageId,
      attachments = [],
    }: {
      conversationId: string;
      content: string;
      replyToMessageId?: string;
      clientMessageId: string;
      attachments?: Array<{ id: number; preview: CustomerCareAttachment }>;
    }) => {
      if (!scopeKey) throw new Error('Customer Care session is not authenticated')
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      if (offline && attachments.length) {
        throw new Error("Cần kết nối mạng để gửi ảnh hoặc tệp đính kèm.");
      }
      const createdAt = new Date().toISOString();
      await queueOutgoingMessage({
        clientMessageId,
        conversationId,
        content,
        replyToMessageId,
        status: offline ? "queued" : "sending",
        attemptCount: 0,
        nextRetryAt: Date.now(),
        createdAt,
      }, scopeKey);
      if (offline) {
        return {
          id: `local:${clientMessageId}`,
          clientMessageId,
          conversationId,
          direction: "outgoing" as const,
          type: attachments.some((item) => item.preview.type === "image") ? "image" as const : "text" as const,
          content,
          attachments: attachments.map((item) => item.preview),
          createdAt,
          sender: { name: "Bạn" },
          senderName: "Bạn",
          status: "queued" as const,
          replyTo: replyToMessageId
            ? { id: replyToMessageId, content: "Đang trả lời tin nhắn" }
            : undefined,
        } satisfies CustomerCareMessage;
      }
      try {
        const message = await customerCareApi.sendMessage(conversationId, {
          clientMessageId,
          content,
          type: attachments.some((item) => item.preview.type === "image") ? "image" : attachments.length ? "file" : "text",
          attachments: attachments.map((item) => item.id),
          replyToMessageId,
        });
        await removeOutbox(clientMessageId, scopeKey);
        return message;
      } catch (error) {
        await updateOutbox(clientMessageId, {
          status: "failed",
          attemptCount: 1,
          nextRetryAt: Date.now() + 5_000,
          lastError: error instanceof Error ? error.message : String(error),
        }, scopeKey);
        throw error;
      }
    },
    onMutate: async ({ conversationId, content, replyToMessageId, clientMessageId, attachments = [] }) => {
      if (!scopeKey) throw new Error('Customer Care session is not authenticated')
      const key = customerCareQueryKey(scopeKey, 'messages', conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CustomerCareMessage[]>(key);
      const optimistic: CustomerCareMessage = {
        id: `local:${clientMessageId}`,
        clientMessageId,
        conversationId,
        direction: "outgoing",
        type: attachments.some((item) => item.preview.type === "image") ? "image" : attachments.length ? "file" : "text",
        content,
        attachments: attachments.map((item) => item.preview),
        createdAt: new Date().toISOString(),
        sender: { name: "Bạn" },
        senderName: "Bạn",
        status: typeof navigator !== "undefined" && !navigator.onLine ? "queued" : "sending",
        replyTo: replyToMessageId
          ? { id: replyToMessageId, content: "Đang trả lời tin nhắn" }
          : undefined,
      };
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => [
        ...current.filter((item) => item.clientMessageId !== clientMessageId),
        optimistic,
      ]);
      await writeCachedMessages(conversationId, [...(previous ?? []), optimistic], scopeKey).catch(() => undefined);
      return { previous, optimisticId: optimistic.id, clientMessageId };
    },
    onSuccess: (message, variables, context) => {
      if (!scopeKey) return
      const key = customerCareQueryKey(scopeKey, 'messages', variables.conversationId);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => {
        const next = current.map((item) =>
          item.id === context?.optimisticId || item.clientMessageId === context?.clientMessageId
            ? { ...message, clientMessageId: context?.clientMessageId }
            : item
        );
        void writeCachedMessages(variables.conversationId, next, scopeKey);
        return next;
      });
      if (message.status === "sending" || message.status === "queued") {
        window.setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: key });
        }, 1_000);
      }
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, 'conversations') });
    },
    onError: (error, variables, context) => {
      if (!scopeKey) return
      const key = customerCareQueryKey(scopeKey, 'messages', variables.conversationId);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => {
        const next = current.map((item) =>
          item.id === context?.optimisticId
            ? { ...item, status: "failed" as const, error: error instanceof Error ? error.message : String(error) }
            : item
        );
        void writeCachedMessages(variables.conversationId, next, scopeKey);
        return next;
      });
    },
  });
}

export function useConversationDraft(conversationId: string | null) {
  const scopeKey = useCustomerCareScopeKey()
  const [draft, setDraftState] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !scopeKey) {
      setDraftState("");
      return;
    }
    let active = true;
    void readDraft(conversationId, scopeKey).then((value) => {
      if (active) setDraftState(value);
    });
    return () => {
      active = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [conversationId, scopeKey]);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    if (!conversationId || !scopeKey) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void writeDraft(conversationId, value, scopeKey);
      void customerCareApi.saveDraft(conversationId, value).catch(() => undefined);
    }, 500);
  }, [conversationId, scopeKey]);

  const clearDraft = useCallback(async () => {
    if (!conversationId || !scopeKey) return;
    setDraftState("");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await deleteDraft(conversationId, scopeKey).catch(() => undefined);
    await customerCareApi.deleteDraft(conversationId).catch(() => undefined);
  }, [conversationId, scopeKey]);

  return { draft, setDraft, clearDraft };
}

export function useCustomerCareRuntime(selectedConversationId: string | null) {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey()
  const authToken = useAuthStore((state) => state.platform.nestToken)
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );

  useEffect(() => {
    if (!scopeKey || !authToken) {
      customerCareSocket.disconnect()
      setConnected(false)
      return
    }
    let disposed = false;
    let syncPromise: Promise<void> | null = null;

    const drainPending = async () => {
      const rows = await listPendingEvents(scopeKey).catch(() => []);
      for (const event of rows) {
        if (disposed) return;
        const current = await getLastSequence(scopeKey).catch(() => 0);
        if (event.sequence > 0 && event.sequence > current + 1) break;
        const applied = await applyRealtimeEvent(queryClient, event, scopeKey);
        if (!applied) break;
      }
    };

    const sync = async () => {
      if (syncPromise) return syncPromise;
      syncPromise = (async () => {
        await drainPending();
        while (!disposed) {
          const cursor = await getLastSequence(scopeKey).catch(() => 0);
          const page = await customerCareApi.sync(cursor).catch(() => null);
          if (!page) break;
          if (page.resetRequired) {
            await clearCustomerCareServerCache(scopeKey).catch(() => undefined);
            await setLastSequence(page.cursor, scopeKey).catch(() => undefined);
            queryClient.removeQueries({ queryKey: customerCareQueryKey(scopeKey, 'conversations') });
            queryClient.removeQueries({ queryKey: customerCareQueryKey(scopeKey, 'messages') });
            await queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey) });
            break;
          }
          if (page.events.length === 0) break;
          let failed = false;
          for (const event of page.events) {
            if (disposed) return;
            const applied = await applyRealtimeEvent(queryClient, event, scopeKey);
            if (!applied) {
              failed = true;
              break;
            }
          }
          if (failed || !page.hasMore) break;
        }
        await drainPending();
      })().finally(() => {
        syncPromise = null;
      });
      return syncPromise;
    };

    void requestPersistentCustomerCareStorage();
    customerCareSocket.connect();
    const unsubscribeConnection = customerCareSocket.subscribeConnection(setConnected);
    const unsubscribe = customerCareSocket.subscribe((event) => {
      void applyRealtimeEvent(queryClient, event, scopeKey).then((applied) => {
        if (!applied) return sync();
        return drainPending();
      });
    });

    const handleOnline = () => {
      setOnline(true);
      void flushClientOutbox(queryClient, scopeKey);
      void sync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const outboxInterval = window.setInterval(
      () => void flushClientOutbox(queryClient, scopeKey),
      15_000
    );
    const syncInterval = window.setInterval(() => void sync(), 45_000);

    void sync();
    void flushClientOutbox(queryClient, scopeKey);

    return () => {
      disposed = true;
      unsubscribe();
      unsubscribeConnection();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(outboxInterval);
      window.clearInterval(syncInterval);
      customerCareSocket.disconnect();
    };
  }, [authToken, queryClient, scopeKey]);

  useEffect(() => {
    if (!selectedConversationId) return;
    customerCareSocket.joinConversation(selectedConversationId);
    return () => customerCareSocket.leaveConversation(selectedConversationId);
  }, [selectedConversationId]);

  return { connected, online };
}

async function applyRealtimeEvent(
  queryClient: ReturnType<typeof useQueryClient>,
  event: CustomerCareRealtimeEvent,
  scopeKey: string,
) {
  const currentSequence = await getLastSequence(scopeKey).catch(() => 0);
  if (event.sequence > 0 && event.sequence > currentSequence + 1) {
    await addPendingEvent(event, scopeKey).catch(() => undefined);
    return false;
  }

  try {
    if (event.type === "conversation.deleted") {
      const conversationId = String(
        event.data.conversationId ?? event.aggregateId ?? "",
      );
      if (conversationId) {
        queryClient.removeQueries({
          queryKey: customerCareQueryKey(scopeKey, "messages", conversationId),
        });
        await deleteCachedConversation(conversationId, scopeKey).catch(
          () => undefined,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: customerCareQueryKey(scopeKey, "conversations"),
      });
    } else if (event.type === "message.created" || event.type === "conversation.created") {
      const message = event.data.message as CustomerCareMessage | undefined;
      const conversationId = String(
        event.data.conversationId ?? message?.conversationId ?? event.aggregateId ?? ""
      );
      if (message && conversationId) {
        updateMessageCache(queryClient, scopeKey, conversationId, (current) =>
          mergeMessages(current, [message])
        );
      }
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "conversations") });
    } else if (
      event.type === "message.recalled" ||
      event.type === "message.updated" ||
      event.type === "message.delivery.updated"
    ) {
      const messageId = String(
        event.data.messageId ??
          (event.data.message as CustomerCareMessage | undefined)?.id ??
          ""
      );
      const conversationId = String(
        event.data.conversationId ?? event.aggregateId ?? ""
      );
      const fullMessage = event.data.message as CustomerCareMessage | undefined;
      const reaction = event.data.reaction as
        | { emoji?: string; action?: "add" | "remove" }
        | undefined;
      const status = typeof event.data.status === "string" ? event.data.status : undefined;
      const clientMessageId = String(event.data.clientMessageId ?? "");
      const externalMessageId = String(event.data.externalMessageId ?? "");

      if (conversationId && (messageId || clientMessageId || externalMessageId || fullMessage)) {
        updateMessageCache(queryClient, scopeKey, conversationId, (current) =>
          current.map((item) => {
            const matchesMessage =
              Boolean(fullMessage && item.id === fullMessage.id) ||
              Boolean(messageId && item.id === messageId) ||
              Boolean(
                clientMessageId &&
                  (item.clientMessageId === clientMessageId || item.id === `local:${clientMessageId}`),
              ) ||
              Boolean(
                externalMessageId && item.externalMessageId === externalMessageId,
              ) ||
              Boolean(messageId && item.externalMessageId === messageId);

            if (!matchesMessage) return item;

            if (fullMessage && item.id === fullMessage.id) {
              return {
                ...item,
                ...fullMessage,
                status: mergeCustomerCareDeliveryStatus(item.status, fullMessage.status),
              };
            }
            if (event.type === "message.recalled") {
              return {
                ...item,
                recalled: true,
                status: "recalled" as const,
                content: "Tin nhắn đã được thu hồi",
              };
            }
            if (reaction?.emoji && reaction.action) {
              const reactions = [...(item.reactions ?? [])];
              const index = reactions.findIndex((row) => row.emoji === reaction.emoji);
              if (reaction.action === "add") {
                if (index >= 0) {
                  reactions[index] = {
                    ...reactions[index],
                    count: reactions[index].count + 1,
                  };
                } else {
                  reactions.push({ emoji: reaction.emoji, count: 1 });
                }
              } else if (index >= 0) {
                const nextCount = reactions[index].count - 1;
                if (nextCount > 0) reactions[index] = { ...reactions[index], count: nextCount };
                else reactions.splice(index, 1);
              }
              return { ...item, reactions };
            }
            if (status) {
              const incomingStatus = status as CustomerCareMessage["status"];
              const mergedStatus = mergeCustomerCareDeliveryStatus(item.status, incomingStatus);
              const occurredAt = typeof event.data.occurredAt === "string"
                ? event.data.occurredAt
                : undefined;
              return {
                ...item,
                status: mergedStatus,
                externalMessageId: externalMessageId || item.externalMessageId,
                clientMessageId: clientMessageId || item.clientMessageId,
                ...(incomingStatus === "delivered" && occurredAt
                  ? { deliveredAt: item.deliveredAt || occurredAt }
                  : {}),
                ...(incomingStatus === "read" && occurredAt ? { readAt: occurredAt } : {}),
              };
            }
            return item;
          })
        );
      }
    } else if (event.type === "contact.presence.updated") {
      const conversationId = String(
        event.data.conversationId ?? event.aggregateId ?? "",
      );
      const presence = event.data.presence as CustomerCareConversation["presence"] | undefined;
      if (conversationId && presence) {
        updateConversationCache(queryClient, scopeKey, conversationId, { presence });
      }
    } else if (event.type === "typing.started" || event.type === "typing.stopped") {
      const conversationId = String(event.data.conversationId ?? event.aggregateId ?? "");
      if (conversationId) {
        const isTyping = event.type === "typing.started";
        updateConversationCache(queryClient, scopeKey, conversationId, { typing: isTyping });
        const timer = typingExpiryTimers.get(conversationId);
        if (timer) clearTimeout(timer);
        typingExpiryTimers.delete(conversationId);
        if (isTyping) {
          typingExpiryTimers.set(
            conversationId,
            setTimeout(() => {
              updateConversationCache(queryClient, scopeKey, conversationId, { typing: false });
              typingExpiryTimers.delete(conversationId);
            }, 4_000)
          );
        }
      }
    } else if (event.type.startsWith("conversation.") || event.type === "contact.updated") {
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "conversations") });
    } else if (event.type === "channel.status.changed") {
      // Connector status also carries the logged-in social account profile.
      // Refresh the channel list immediately so MessagePanel gets the newest
      // Zalo/Facebook account avatar instead of waiting for the polling window.
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "channels") });
      void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "zalo", "status") });
    }

    if (event.sequence > currentSequence) await setLastSequence(event.sequence, scopeKey);
    await removePendingEvent(event.eventId, scopeKey).catch(() => undefined);
    return true;
  } catch {
    await addPendingEvent(event, scopeKey).catch(() => undefined);
    return false;
  }
}

function updateConversationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  scopeKey: string,
  conversationId: string,
  patch: Partial<CustomerCareConversation>
) {
  queryClient.setQueriesData<CustomerCareConversation[]>(
    { queryKey: customerCareQueryKey(scopeKey, "conversations") },
    (current = []) => {
      const next = current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, ...patch } : conversation
      );
      void writeCachedConversations(next, scopeKey);
      return next;
    }
  );
}

function updateMessageCache(
  queryClient: ReturnType<typeof useQueryClient>,
  scopeKey: string,
  conversationId: string,
  update: (current: CustomerCareMessage[]) => CustomerCareMessage[]
) {
  queryClient.setQueriesData<CustomerCareMessage[]>(
    { queryKey: customerCareQueryKey(scopeKey, "messages", conversationId) },
    (current = []) => {
      const next = update(current);
      void writeCachedMessages(conversationId, next, scopeKey);
      return next;
    }
  );
}

async function flushClientOutbox(
  queryClient: ReturnType<typeof useQueryClient>,
  scopeKey: string,
) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const rows = await listOutbox(scopeKey).catch(() => []);
  for (const row of rows) {
    if (row.nextRetryAt > Date.now()) continue;
    await updateOutbox(row.clientMessageId, { status: "sending" }, scopeKey).catch(() => undefined);
    try {
      const message = await customerCareApi.sendMessage(row.conversationId, {
        clientMessageId: row.clientMessageId,
        content: row.content,
        type: "text",
        replyToMessageId: row.replyToMessageId,
      });
      await removeOutbox(row.clientMessageId, scopeKey);
      updateMessageCache(queryClient, scopeKey, row.conversationId, (current) =>
        mergeMessages(
          current.filter((item) => item.clientMessageId !== row.clientMessageId),
          [{ ...message, clientMessageId: row.clientMessageId }]
        )
      );
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const lastError = error instanceof Error ? error.message : String(error);
      await updateOutbox(row.clientMessageId, {
        status: "failed",
        attemptCount,
        nextRetryAt: Date.now() + Math.min(300_000, 2 ** attemptCount * 1000),
        lastError,
      }, scopeKey);
      updateMessageCache(queryClient, scopeKey, row.conversationId, (current) =>
        current.map((item) =>
          item.clientMessageId === row.clientMessageId
            ? { ...item, status: "failed" as const, error: lastError }
            : item
        )
      );
    }
  }
}


function mergeMessages(
  current: CustomerCareMessage[],
  incoming: CustomerCareMessage[]
) {
  const merged: CustomerCareMessage[] = [];
  for (const message of [...current, ...incoming]) {
    const index = merged.findIndex(
      (item) =>
        item.id === message.id ||
        Boolean(
          item.clientMessageId &&
            message.clientMessageId &&
            item.clientMessageId === message.clientMessageId
        )
    );
    if (index < 0) {
      merged.push(message);
      continue;
    }
    const previous = merged[index];
    merged[index] = {
      ...previous,
      ...message,
      clientMessageId: message.clientMessageId ?? previous.clientMessageId,
    };
  }
  return merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function findConversation(
  conversations: CustomerCareConversation[] | undefined,
  id: string | null
) {
  return conversations?.find((conversation) => conversation.id === id) ?? null;
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

export type { CustomerCareCapabilities };
