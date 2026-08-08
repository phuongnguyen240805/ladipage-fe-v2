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
  addPendingEvent,
  clearCustomerCareCache,
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
  return useQuery({
    queryKey: ["customer-care", "capabilities"],
    queryFn: () => customerCareApi.capabilities(),
    staleTime: 5 * 60_000,
  });
}

export function useZaloConnectionStatus() {
  return useQuery({
    queryKey: ["customer-care", "zalo", "status"],
    queryFn: () => customerCareApi.getZaloStatus(),
    refetchInterval: (query) =>
      query.state.data?.phase === "connected" ? 20_000 : 2_000,
    retry: 1,
  });
}

export function useZaloQrUrl(enabled: boolean) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }
    let cancelled = false;
    void customerCareApi
      .getZaloQrBlob()
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
  }, [enabled, version]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return { url, error, refresh: () => setVersion((value) => value + 1) };
}

export function useRefreshZaloQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => customerCareApi.refreshZaloQr(),
    onSuccess: (status) => {
      queryClient.setQueryData(["customer-care", "zalo", "status"], status);
    },
  });
}

export function useCustomerCareConversations() {
  const filter = useConversationUiStore((state) => state.filter);
  const channel = useConversationUiStore((state) => state.channel);
  const search = useConversationUiStore((state) => state.search);
  const queryClient = useQueryClient();
  const key = queryKeys.customerCare.conversations({ filter, channel, search });

  useEffect(() => {
    void readCachedConversations().then((cached) => {
      if (cached.length) queryClient.setQueryData(key, cached);
    }).catch(() => undefined);
  }, [queryClient, filter, channel, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const page = await customerCareApi.listConversations({
        search: search || undefined,
        status: filter === "all" || filter === "unassigned" ? undefined : filter,
        channel: channel === "all" ? undefined : channel,
        limit: 100,
      });
      await writeCachedConversations(page.items).catch(() => undefined);
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
  const queryClient = useQueryClient();
  const key = queryKeys.customerCare.messages(conversationId ?? "none");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    setNextCursor(undefined);
    if (!conversationId) return;
    void readCachedMessages(conversationId).then((cached) => {
      if (cached.length) queryClient.setQueryData(key, cached);
    }).catch(() => undefined);
  }, [conversationId, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const page = await customerCareApi.listMessages(conversationId ?? "");
      const items = mergeMessages([], page.items);
      setNextCursor(page.nextCursor);
      await writeCachedMessages(conversationId ?? "", items).catch(() => undefined);
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
        void writeCachedMessages(conversationId, next);
        return next;
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, key, loadingOlder, nextCursor, queryClient]);

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
      });
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
        await removeOutbox(clientMessageId);
        return message;
      } catch (error) {
        await updateOutbox(clientMessageId, {
          status: "failed",
          attemptCount: 1,
          nextRetryAt: Date.now() + 5_000,
          lastError: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onMutate: async ({ conversationId, content, replyToMessageId, clientMessageId, attachments = [] }) => {
      const key = queryKeys.customerCare.messages(conversationId);
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
      await writeCachedMessages(conversationId, [...(previous ?? []), optimistic]).catch(() => undefined);
      return { previous, optimisticId: optimistic.id, clientMessageId };
    },
    onSuccess: (message, variables, context) => {
      const key = queryKeys.customerCare.messages(variables.conversationId);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => {
        const next = current.map((item) =>
          item.id === context?.optimisticId || item.clientMessageId === context?.clientMessageId
            ? { ...message, clientMessageId: context?.clientMessageId }
            : item
        );
        void writeCachedMessages(variables.conversationId, next);
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
    },
    onError: (error, variables, context) => {
      const key = queryKeys.customerCare.messages(variables.conversationId);
      queryClient.setQueryData<CustomerCareMessage[]>(key, (current = []) => {
        const next = current.map((item) =>
          item.id === context?.optimisticId
            ? { ...item, status: "failed" as const, error: error instanceof Error ? error.message : String(error) }
            : item
        );
        void writeCachedMessages(variables.conversationId, next);
        return next;
      });
    },
  });
}

export function useConversationDraft(conversationId: string | null) {
  const [draft, setDraftState] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setDraftState("");
      return;
    }
    let active = true;
    void readDraft(conversationId).then((value) => {
      if (active) setDraftState(value);
    });
    return () => {
      active = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [conversationId]);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    if (!conversationId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void writeDraft(conversationId, value);
      void customerCareApi.saveDraft(conversationId, value).catch(() => undefined);
    }, 500);
  }, [conversationId]);

  const clearDraft = useCallback(async () => {
    if (!conversationId) return;
    setDraftState("");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await deleteDraft(conversationId).catch(() => undefined);
    await customerCareApi.deleteDraft(conversationId).catch(() => undefined);
  }, [conversationId]);

  return { draft, setDraft, clearDraft };
}

export function useCustomerCareRuntime(selectedConversationId: string | null) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );

  useEffect(() => {
    let disposed = false;
    let syncPromise: Promise<void> | null = null;

    const drainPending = async () => {
      const rows = await listPendingEvents().catch(() => []);
      for (const event of rows) {
        if (disposed) return;
        const current = await getLastSequence().catch(() => 0);
        if (event.sequence > 0 && event.sequence > current + 1) break;
        const applied = await applyRealtimeEvent(queryClient, event);
        if (!applied) break;
      }
    };

    const sync = async () => {
      if (syncPromise) return syncPromise;
      syncPromise = (async () => {
        await drainPending();
        while (!disposed) {
          const cursor = await getLastSequence().catch(() => 0);
          const page = await customerCareApi.sync(cursor).catch(() => null);
          if (!page) break;
          if (page.resetRequired) {
            await clearCustomerCareServerCache().catch(() => undefined);
            await setLastSequence(page.cursor).catch(() => undefined);
            queryClient.removeQueries({ queryKey: ["customer-care", "conversations"] });
            queryClient.removeQueries({ queryKey: ["customer-care", "messages"] });
            await queryClient.invalidateQueries({ queryKey: ["customer-care"] });
            break;
          }
          if (page.events.length === 0) break;
          let failed = false;
          for (const event of page.events) {
            if (disposed) return;
            const applied = await applyRealtimeEvent(queryClient, event);
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

    const unsubscribeAuth = useAuthStore.subscribe((state, previous) => {
      const previousTenant = previous.platform.tenant.tenantId ?? previous.platform.tenant.activeTenantId;
      const nextTenant = state.platform.tenant.tenantId ?? state.platform.tenant.activeTenantId;
      const previousProfile = previous.platform.profile as { id?: string | number; uid?: string | number } | null;
      const nextProfile = state.platform.profile as { id?: string | number; uid?: string | number } | null;
      const previousUser = previousProfile?.id ?? previousProfile?.uid;
      const nextUser = nextProfile?.id ?? nextProfile?.uid;
      const identityChanged = previousTenant !== nextTenant || previousUser !== nextUser;
      const tokenChanged = previous.platform.nestToken !== state.platform.nestToken;
      if (identityChanged || (previous.platform.nestToken && !state.platform.nestToken)) {
        const previousNamespace = `${previousTenant ?? "unknown"}:${previousUser ?? "anonymous"}`;
        void clearCustomerCareCache(previousNamespace).catch(() => undefined);
      }
      if (identityChanged || tokenChanged) {
        customerCareSocket.disconnect();
        setConnected(false);
        if (state.platform.nestToken) {
          customerCareSocket.connect();
          void sync();
        }
      }
    });

    void requestPersistentCustomerCareStorage();
    customerCareSocket.connect();
    const unsubscribeConnection = customerCareSocket.subscribeConnection(setConnected);
    const unsubscribe = customerCareSocket.subscribe((event) => {
      void applyRealtimeEvent(queryClient, event).then((applied) => {
        if (!applied) return sync();
        return drainPending();
      });
    });

    const handleOnline = () => {
      setOnline(true);
      void flushClientOutbox(queryClient);
      void sync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const outboxInterval = window.setInterval(
      () => void flushClientOutbox(queryClient),
      15_000
    );
    const syncInterval = window.setInterval(() => void sync(), 45_000);

    void sync();
    void flushClientOutbox(queryClient);

    return () => {
      disposed = true;
      unsubscribe();
      unsubscribeConnection();
      unsubscribeAuth();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(outboxInterval);
      window.clearInterval(syncInterval);
      customerCareSocket.disconnect();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!selectedConversationId) return;
    customerCareSocket.joinConversation(selectedConversationId);
    return () => customerCareSocket.leaveConversation(selectedConversationId);
  }, [selectedConversationId]);

  return { connected, online };
}

async function applyRealtimeEvent(
  queryClient: ReturnType<typeof useQueryClient>,
  event: CustomerCareRealtimeEvent
) {
  const currentSequence = await getLastSequence().catch(() => 0);
  if (event.sequence > 0 && event.sequence > currentSequence + 1) {
    await addPendingEvent(event).catch(() => undefined);
    return false;
  }

  try {
    if (event.type === "message.created" || event.type === "conversation.created") {
      const message = event.data.message as CustomerCareMessage | undefined;
      const conversationId = String(
        event.data.conversationId ?? message?.conversationId ?? event.aggregateId ?? ""
      );
      if (message && conversationId) {
        updateMessageCache(queryClient, conversationId, (current) =>
          mergeMessages(current, [message])
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
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
        updateMessageCache(queryClient, conversationId, (current) =>
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
        updateConversationCache(queryClient, conversationId, { typing: isTyping });
        const timer = typingExpiryTimers.get(conversationId);
        if (timer) clearTimeout(timer);
        typingExpiryTimers.delete(conversationId);
        if (isTyping) {
          typingExpiryTimers.set(
            conversationId,
            setTimeout(() => {
              updateConversationCache(queryClient, conversationId, { typing: false });
              typingExpiryTimers.delete(conversationId);
            }, 4_000)
          );
        }
      }
    } else if (event.type.startsWith("conversation.") || event.type === "contact.updated") {
      void queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
    } else if (event.type === "channel.status.changed") {
      void queryClient.invalidateQueries({ queryKey: ["customer-care", "zalo", "status"] });
    }

    if (event.sequence > currentSequence) await setLastSequence(event.sequence);
    await removePendingEvent(event.eventId).catch(() => undefined);
    return true;
  } catch {
    await addPendingEvent(event).catch(() => undefined);
    return false;
  }
}

function updateConversationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  patch: Partial<CustomerCareConversation>
) {
  queryClient.setQueriesData<CustomerCareConversation[]>(
    { queryKey: ["customer-care", "conversations"] },
    (current = []) => {
      const next = current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, ...patch } : conversation
      );
      void writeCachedConversations(next);
      return next;
    }
  );
}

function updateMessageCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  update: (current: CustomerCareMessage[]) => CustomerCareMessage[]
) {
  queryClient.setQueriesData<CustomerCareMessage[]>(
    { queryKey: ["customer-care", "messages", conversationId] },
    (current = []) => {
      const next = update(current);
      void writeCachedMessages(conversationId, next);
      return next;
    }
  );
}

async function flushClientOutbox(queryClient: ReturnType<typeof useQueryClient>) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const rows = await listOutbox().catch(() => []);
  for (const row of rows) {
    if (row.nextRetryAt > Date.now()) continue;
    await updateOutbox(row.clientMessageId, { status: "sending" }).catch(() => undefined);
    try {
      const message = await customerCareApi.sendMessage(row.conversationId, {
        clientMessageId: row.clientMessageId,
        content: row.content,
        type: "text",
        replyToMessageId: row.replyToMessageId,
      });
      await removeOutbox(row.clientMessageId);
      updateMessageCache(queryClient, row.conversationId, (current) =>
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
      });
      updateMessageCache(queryClient, row.conversationId, (current) =>
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
  const byKey = new Map<string, CustomerCareMessage>();
  for (const message of [...current, ...incoming]) {
    const key = message.clientMessageId
      ? `client:${message.clientMessageId}`
      : `server:${message.id}`;
    const previous = byKey.get(key);
    byKey.set(key, previous ? { ...previous, ...message } : message);
  }
  return [...byKey.values()].sort(
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
