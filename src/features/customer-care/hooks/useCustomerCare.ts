"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomerCareCapabilities,
  CustomerCareAttachment,
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
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  customerCareQueryKey,
  useCustomerCareScopeKey,
} from '@/features/customer-care/session/customer-care-scope'
import {
  addPendingEvent,
  clearCustomerCareServerCache,
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

export function useCustomerCareCapabilities() {
  const scopeKey = useCustomerCareScopeKey()
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'capabilities'),
    enabled: Boolean(scopeKey),
    queryFn: () => customerCareApi.capabilities(),
    staleTime: 5 * 60_000,
  });
}

export function useCustomerCareChannels() {
  const scopeKey = useCustomerCareScopeKey()
  return useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? 'signed-out', 'channels'),
    enabled: Boolean(scopeKey),
    queryFn: () => customerCareApi.listChannels(),
    staleTime: 10_000,
  })
}

function useSelectedChannel(provider: 'zalo_personal' | 'facebook_personal') {
  const channels = useCustomerCareChannels()
  const selectedId = useConversationUiStore((state) => state.selectedChannelAccountId)
  const providerChannels = (channels.data ?? []).filter((item) => item.provider === provider)
  const channel = providerChannels.find((item) => item.id === selectedId)
    ?? (providerChannels.length === 1 ? providerChannels[0] : undefined)
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
  return useMutation({
    mutationFn: () => {
      if (!channel) throw new Error('Hãy chọn tài khoản Facebook')
      return customerCareApi.disconnectFacebookSession(channel.id)
    },
    onSuccess: (status) => {
      if (scopeKey && channel) queryClient.setQueryData(customerCareQueryKey(scopeKey, 'channel', channel.id, 'status'), status)
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
  const channel = useConversationUiStore((state) => state.channel);
  const search = useConversationUiStore((state) => state.search);
  const channelAccountId = useConversationUiStore((state) => state.selectedChannelAccountId);
  const queryClient = useQueryClient();
  const key = customerCareQueryKey(scopeKey ?? 'signed-out', 'conversations', { filter, channel, channelAccountId, search });

  useEffect(() => {
    if (!scopeKey) return
    void readCachedConversations(scopeKey).then((cached) => {
      if (cached.length) queryClient.setQueryData(key, cached);
    }).catch(() => undefined);
  }, [key, queryClient, scopeKey]);

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(scopeKey),
    queryFn: async () => {
      const page = await customerCareApi.listConversations({
        search: search || undefined,
        status: filter === "all" || filter === "unassigned" ? undefined : filter,
        channel: channel === "all" ? undefined : channel,
        channelAccountId: channelAccountId ? Number(channelAccountId) : undefined,
        limit: 100,
      });
      if (scopeKey) await writeCachedConversations(page.items, scopeKey).catch(() => undefined);
      return page.items;
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
      const channelMatches = channel === "all" || conversation.channel === channel;
      const searchMatches =
        !normalizedSearch ||
        conversation.customer.name.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.lastMessage.toLocaleLowerCase("vi").includes(normalizedSearch) ||
        conversation.customer.phone?.includes(normalizedSearch);
      return filterMatches && channelMatches && searchMatches && !conversation.archived;
    });
  }, [channel, filter, query.data, search]);

  return { ...query, data: filtered };
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
    if (event.type === "message.created" || event.type === "conversation.created") {
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

      if (conversationId && (messageId || fullMessage)) {
        updateMessageCache(queryClient, scopeKey, conversationId, (current) =>
          current.map((item) => {
            if (fullMessage && item.id === fullMessage.id) {
              return { ...item, ...fullMessage };
            }
            if (item.id !== messageId) return item;
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
              return {
                ...item,
                status: status as CustomerCareMessage["status"],
              };
            }
            return item;
          })
        );
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
