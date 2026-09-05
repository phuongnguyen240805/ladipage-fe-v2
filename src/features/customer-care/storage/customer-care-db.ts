"use client";

import type {
  CustomerCareConversation,
  CustomerCareMessage,
  CustomerCareSyncEvent,
} from "@liora/api-types";
import { requireCustomerCareScope } from '@/features/customer-care/session/customer-care-scope'

const DB_NAME = "ladipage-customer-care-v1";
const DB_VERSION = 1;
const MAX_CACHED_CONVERSATIONS = 500;
const MAX_MESSAGES_PER_CONVERSATION = 300;
const CONVERSATION_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

interface ConversationRecord extends CustomerCareConversation {
  cacheKey: string;
  namespace: string;
  cachedAt: number;
}

interface MessageRecord extends CustomerCareMessage {
  cacheKey: string;
  namespace: string;
  conversationKey: string;
  cachedAt: number;
}

export interface OutboxRecord {
  cacheKey: string;
  namespace: string;
  clientMessageId: string;
  conversationId: string;
  content: string;
  replyToMessageId?: string;
  status: "queued" | "sending" | "failed";
  attemptCount: number;
  nextRetryAt: number;
  lastError?: string;
  createdAt: string;
}

interface DraftRecord {
  cacheKey: string;
  namespace: string;
  conversationId: string;
  content: string;
  updatedAt: number;
}

interface SyncStateRecord {
  namespace: string;
  lastSequence: number;
  lastSyncedAt: number;
}

interface PendingEventRecord extends CustomerCareSyncEvent {
  cacheKey: string;
  namespace: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
let activeDb: IDBDatabase | null = null;

export function customerCareNamespace() {
  return requireCustomerCareScope().key;
}

export async function requestPersistentCustomerCareStorage() {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB is unavailable"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
    request.onblocked = () => {
      dbPromise = null;
      reject(new Error("Customer Care database upgrade is blocked"));
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("conversations")) {
        const store = db.createObjectStore("conversations", { keyPath: "cacheKey" });
        store.createIndex("namespace", "namespace", { unique: false });
      }
      if (!db.objectStoreNames.contains("messages")) {
        const store = db.createObjectStore("messages", { keyPath: "cacheKey" });
        store.createIndex("conversationKey", "conversationKey", { unique: false });
        store.createIndex("namespace", "namespace", { unique: false });
      }
      if (!db.objectStoreNames.contains("outbox")) {
        const store = db.createObjectStore("outbox", { keyPath: "cacheKey" });
        store.createIndex("namespace", "namespace", { unique: false });
      }
      if (!db.objectStoreNames.contains("drafts")) {
        const store = db.createObjectStore("drafts", { keyPath: "cacheKey" });
        store.createIndex("namespace", "namespace", { unique: false });
      }
      if (!db.objectStoreNames.contains("sync_state")) {
        db.createObjectStore("sync_state", { keyPath: "namespace" });
      }
      if (!db.objectStoreNames.contains("pending_events")) {
        const store = db.createObjectStore("pending_events", { keyPath: "cacheKey" });
        store.createIndex("namespace", "namespace", { unique: false });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      activeDb = db;
      const invalidate = () => {
        if (activeDb === db) activeDb = null;
        dbPromise = null;
      };
      db.onversionchange = () => {
        invalidate();
        db.close();
      };
      db.onclose = invalidate;
      resolve(db);
    };
  });
  return dbPromise;
}

function isClosingConnectionError(error: unknown) {
  return error instanceof DOMException &&
    error.name === "InvalidStateError" &&
    /clos|closed|closing/i.test(error.message);
}

function invalidateConnection(db: IDBDatabase) {
  if (activeDb === db) activeDb = null;
  dbPromise = null;
  try { db.close(); } catch { /* The connection may already be closing. */ }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => Promise<T>,
  retry = true,
): Promise<T> {
  const db = await openDb();
  let transaction: IDBTransaction;
  try {
    transaction = db.transaction(storeName, mode);
  } catch (error) {
    if (retry && isClosingConnectionError(error)) {
      invalidateConnection(db);
      await new Promise((resolve) => setTimeout(resolve, 0));
      return withStore(storeName, mode, work, false);
    }
    throw error;
  }
  const completed = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
  const result = await work(transaction.objectStore(storeName));
  await completed;
  return result;
}

export async function readCachedConversations(namespace = customerCareNamespace()) {
  const records = await withStore("conversations", "readonly", async (store) =>
    requestResult(store.index("namespace").getAll(namespace))
  ) as ConversationRecord[];
  const cutoff = Date.now() - CONVERSATION_RETENTION_MS;
  return records
    .filter((record) => record.cachedAt >= cutoff)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .map(stripCacheFields);
}

export async function writeCachedConversations(
  conversations: CustomerCareConversation[],
  namespace = customerCareNamespace()
) {
  const now = Date.now();
  await withStore("conversations", "readwrite", async (store) => {
    for (const conversation of conversations) {
      store.put({ ...conversation, namespace, cacheKey: `${namespace}:${conversation.id}`, cachedAt: now } satisfies ConversationRecord);
    }
  });
  void pruneOldConversations(namespace);
}

export async function deleteCachedConversation(
  conversationId: string,
  namespace = customerCareNamespace(),
) {
  const conversationKey = `${namespace}:${conversationId}`;

  await withStore("conversations", "readwrite", async (store) => {
    store.delete(conversationKey);
  });

  await withStore("messages", "readwrite", async (store) => {
    const records = await requestResult(
      store.index("conversationKey").getAll(conversationKey),
    ) as MessageRecord[];
    records.forEach((record) => store.delete(record.cacheKey));
  });

  await withStore("drafts", "readwrite", async (store) => {
    store.delete(conversationKey);
  });

  // A queued message must not be sent after its conversation was removed.
  await withStore("outbox", "readwrite", async (store) => {
    const records = await requestResult(
      store.index("namespace").getAll(namespace),
    ) as OutboxRecord[];
    records
      .filter((record) => record.conversationId === conversationId)
      .forEach((record) => store.delete(record.cacheKey));
  });
}

async function pruneOldConversations(namespace: string) {
  const cutoff = Date.now() - CONVERSATION_RETENTION_MS;
  await withStore("conversations", "readwrite", async (store) => {
    const records = await requestResult(store.index("namespace").getAll(namespace)) as ConversationRecord[];
    const retained = records
      .filter((record) => {
        if (record.cachedAt >= cutoff) return true;
        store.delete(record.cacheKey);
        return false;
      })
      .sort(
        (a, b) =>
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );

    retained
      .slice(MAX_CACHED_CONVERSATIONS)
      .forEach((record) => store.delete(record.cacheKey));
  });
}

export async function readCachedMessages(conversationId: string, namespace = customerCareNamespace()) {
  const conversationKey = `${namespace}:${conversationId}`;
  const records = await withStore("messages", "readonly", async (store) =>
    requestResult(store.index("conversationKey").getAll(conversationKey))
  ) as MessageRecord[];
  return records
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(stripCacheFields);
}

export async function writeCachedMessages(
  conversationId: string,
  messages: CustomerCareMessage[],
  namespace = customerCareNamespace()
) {
  const now = Date.now();
  const conversationKey = `${namespace}:${conversationId}`;
  await withStore("messages", "readwrite", async (store) => {
    const existing = await requestResult(store.index("conversationKey").getAll(conversationKey)) as MessageRecord[];
    for (const message of messages) {
      const cacheKey = `${namespace}:${message.id}`;
      if (message.clientMessageId) {
        existing
          .filter((record) => record.clientMessageId === message.clientMessageId && record.cacheKey !== cacheKey)
          .forEach((record) => store.delete(record.cacheKey));
      }
      store.put({ ...message, namespace, conversationKey, cacheKey, cachedAt: now } satisfies MessageRecord);
    }
    const records = await requestResult(store.index("conversationKey").getAll(conversationKey)) as MessageRecord[];
    records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(MAX_MESSAGES_PER_CONVERSATION)
      .forEach((record) => store.delete(record.cacheKey));
  });
}

export async function queueOutgoingMessage(record: Omit<OutboxRecord, "cacheKey" | "namespace">, namespace = customerCareNamespace()) {
  const value: OutboxRecord = { ...record, namespace, cacheKey: `${namespace}:${record.clientMessageId}` };
  await withStore("outbox", "readwrite", async (store) => { store.put(value); });
  return value;
}

export async function listOutbox(namespace = customerCareNamespace()) {
  const records = await withStore("outbox", "readonly", async (store) =>
    requestResult(store.index("namespace").getAll(namespace))
  ) as OutboxRecord[];
  return records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function updateOutbox(clientMessageId: string, patch: Partial<OutboxRecord>, namespace = customerCareNamespace()) {
  const key = `${namespace}:${clientMessageId}`;
  await withStore("outbox", "readwrite", async (store) => {
    const current = await requestResult(store.get(key)) as OutboxRecord | undefined;
    if (current) store.put({ ...current, ...patch, cacheKey: key, namespace });
  });
}

export async function removeOutbox(clientMessageId: string, namespace = customerCareNamespace()) {
  await withStore("outbox", "readwrite", async (store) => { store.delete(`${namespace}:${clientMessageId}`); });
}

export async function readDraft(conversationId: string, namespace = customerCareNamespace()) {
  const record = await withStore("drafts", "readonly", async (store) =>
    requestResult(store.get(`${namespace}:${conversationId}`))
  ) as DraftRecord | undefined;
  return record?.content ?? "";
}

export async function writeDraft(conversationId: string, content: string, namespace = customerCareNamespace()) {
  const record: DraftRecord = {
    cacheKey: `${namespace}:${conversationId}`,
    namespace,
    conversationId,
    content,
    updatedAt: Date.now(),
  };
  await withStore("drafts", "readwrite", async (store) => { store.put(record); });
}

export async function deleteDraft(conversationId: string, namespace = customerCareNamespace()) {
  await withStore("drafts", "readwrite", async (store) => { store.delete(`${namespace}:${conversationId}`); });
}

export async function getLastSequence(namespace = customerCareNamespace()) {
  const record = await withStore("sync_state", "readonly", async (store) =>
    requestResult(store.get(namespace))
  ) as SyncStateRecord | undefined;
  return record?.lastSequence ?? 0;
}

export async function setLastSequence(lastSequence: number, namespace = customerCareNamespace()) {
  const value: SyncStateRecord = { namespace, lastSequence, lastSyncedAt: Date.now() };
  await withStore("sync_state", "readwrite", async (store) => { store.put(value); });
}

export async function addPendingEvent(event: CustomerCareSyncEvent, namespace = customerCareNamespace()) {
  const record: PendingEventRecord = { ...event, namespace, cacheKey: `${namespace}:${event.eventId}` };
  await withStore("pending_events", "readwrite", async (store) => { store.put(record); });
}

export async function listPendingEvents(namespace = customerCareNamespace()) {
  const records = await withStore("pending_events", "readonly", async (store) =>
    requestResult(store.index("namespace").getAll(namespace))
  ) as PendingEventRecord[];
  return records.sort((a, b) => a.sequence - b.sequence || a.occurredAt.localeCompare(b.occurredAt));
}

export async function removePendingEvent(eventId: string, namespace = customerCareNamespace()) {
  await withStore("pending_events", "readwrite", async (store) => {
    store.delete(`${namespace}:${eventId}`);
  });
}

export async function clearCustomerCareServerCache(namespace = customerCareNamespace()) {
  for (const storeName of ["conversations", "messages", "pending_events"] as const) {
    await withStore(storeName, "readwrite", async (store) => {
      const index = store.index("namespace");
      const records = await requestResult(index.getAll(namespace)) as Array<{ cacheKey: string }>;
      records.forEach((record) => store.delete(record.cacheKey));
    });
  }
  await withStore("sync_state", "readwrite", async (store) => { store.delete(namespace); });
}

export async function clearCustomerCareCache(namespace = customerCareNamespace()) {
  for (const storeName of ["conversations", "messages", "outbox", "drafts", "pending_events"] as const) {
    await withStore(storeName, "readwrite", async (store) => {
      const index = store.index("namespace");
      const records = await requestResult(index.getAll(namespace)) as Array<{ cacheKey: string }>;
      records.forEach((record) => store.delete(record.cacheKey));
    });
  }
  await withStore("sync_state", "readwrite", async (store) => { store.delete(namespace); });
}

function stripCacheFields<T extends { cacheKey: string; namespace: string; cachedAt?: number; conversationKey?: string }>(record: T) {
  const { cacheKey: _cacheKey, namespace: _namespace, cachedAt: _cachedAt, conversationKey: _conversationKey, ...value } = record;
  return value;
}
