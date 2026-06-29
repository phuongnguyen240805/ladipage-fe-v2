const DB_NAME = "via_webapp_db";
const DB_VERSION = 18;

const STORES = {
  settings: "settings",
  facebookAuth: "facebookAuth",
  adsData: "adsData",
  bmData: "bmData",
  pageData: "pageData",
  friendsData: "friendsData",
  fetchMeta: "fetchMeta",
  processLogs: "processLogs",
  createdEmails: "created_emails",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

export type FacebookAuthRecord = {
  id: "active";
  uid?: string;
  name?: string;
  email?: string;
  birthday?: string;
  gender?: string;
  avatar?: string;
  friends?: string;
  accountQuality?: string;
  accountQualityColor?: string;
  status?: string;
  cookie?: string;
  cookieText?: string;
  accessToken?: string;
  token?: string;
  accessToken2?: string;
  accessToken4?: string;
  accessToken5?: string;
  dtsg?: string;
  dtsg2?: string;
  lsd?: string;
  updatedAt?: string;
};

export type CreatedEmailRecord = {
  id: string;
  email: string;
  provider?: string;
  createdAt?: number;
  meta?: unknown;
};

export type ResourceDataRecord<T = unknown> = {
  id: string;
  uid?: string;
  data?: T;
  snapshotNotice?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type AppSettingsRecord<T = Record<string, unknown>> = {
  id: "app";
  data: T;
};

type ModuleSettingRecord<T = unknown> = {
  key: string;
  value: T;
  updatedAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function asRequest<T>(request: IDBRequest) {
  return request as IDBRequest<T>;
}

function createIndexIfMissing(store: IDBObjectStore, name: string, keyPath: string | string[]) {
  if (!store.indexNames.contains(name)) {
    store.createIndex(name, keyPath, { unique: false });
  }
}

function createResourceStore(db: IDBDatabase, storeName: StoreName) {
  const store = db.createObjectStore(storeName, { keyPath: ["uid", "id"] });
  createIndexIfMissing(store, "uid", "uid");
  createIndexIfMissing(store, "id", "id");
  createIndexIfMissing(store, "updatedAt", "updatedAt");
}

function ensureSchema(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(STORES.settings)) {
    db.createObjectStore(STORES.settings, { keyPath: "id" });
  }

  if (!db.objectStoreNames.contains(STORES.facebookAuth)) {
    const store = db.createObjectStore(STORES.facebookAuth, { keyPath: "id" });
    createIndexIfMissing(store, "updatedAt", "updatedAt");
  }

  if (!db.objectStoreNames.contains(STORES.adsData)) createResourceStore(db, STORES.adsData);
  if (!db.objectStoreNames.contains(STORES.bmData)) createResourceStore(db, STORES.bmData);
  if (!db.objectStoreNames.contains(STORES.pageData)) createResourceStore(db, STORES.pageData);
  if (!db.objectStoreNames.contains(STORES.friendsData)) createResourceStore(db, STORES.friendsData);

  if (!db.objectStoreNames.contains(STORES.fetchMeta)) {
    const store = db.createObjectStore(STORES.fetchMeta, { keyPath: ["uid", "resource"] });
    createIndexIfMissing(store, "uid", "uid");
    createIndexIfMissing(store, "resource", "resource");
    createIndexIfMissing(store, "updatedAt", "updatedAt");
  }

  if (!db.objectStoreNames.contains(STORES.processLogs)) {
    const store = db.createObjectStore(STORES.processLogs, { keyPath: "id", autoIncrement: true });
    createIndexIfMissing(store, "uid", "uid");
    createIndexIfMissing(store, "resource", "resource");
    createIndexIfMissing(store, "itemId", "itemId");
    createIndexIfMissing(store, "runId", "runId");
  }

  if (!db.objectStoreNames.contains(STORES.createdEmails)) {
    const store = db.createObjectStore(STORES.createdEmails, { keyPath: "id" });
    createIndexIfMissing(store, "email", "email");
    createIndexIfMissing(store, "createdAt", "createdAt");
  }
}

function openClientDb() {
  if (!canUseIndexedDb()) {
    return Promise.reject(new Error("IndexedDB is not available on this client."));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      ensureSchema(request.result);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Cannot open IndexedDB."));
  });

  return dbPromise;
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
) {
  const db = await openClientDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);
    let result: T;

    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => reject(request.error || new Error(`IndexedDB request failed: ${storeName}`));
    }

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error(`IndexedDB transaction failed: ${storeName}`));
    transaction.onabort = () => reject(transaction.error || new Error(`IndexedDB transaction aborted: ${storeName}`));
  });
}

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function normalizeToken(value: unknown) {
  const token = normalizeText(value);
  return token.includes("_MOCK_") ? "" : token;
}

function normalizeCookie(value: unknown) {
  const cookie = normalizeText(value);
  return cookie.includes("mock_session") || cookie.includes("xs=mock_") ? "" : cookie;
}

function normalizeFacebookAuth(
  incoming: Partial<FacebookAuthRecord>,
  current?: Partial<FacebookAuthRecord>
): FacebookAuthRecord {
  const currentUid = normalizeText(current?.uid);
  const incomingUid = normalizeText(incoming.uid);
  const resetForNewUid = !!incomingUid && !!currentUid && incomingUid !== currentUid;
  const base = resetForNewUid ? { id: "active" as const, uid: incomingUid } : current || {};

  return {
    ...base,
    ...incoming,
    id: "active",
    uid: normalizeText(incoming.uid || base.uid),
    accessToken: normalizeToken(incoming.accessToken || incoming.token || base.accessToken || base.token),
    token: normalizeToken(incoming.accessToken || incoming.token || base.accessToken || base.token),
    accessToken2: normalizeToken(incoming.accessToken2 || base.accessToken2),
    accessToken4: normalizeToken(incoming.accessToken4 || base.accessToken4),
    accessToken5: normalizeToken(incoming.accessToken5 || base.accessToken5),
    cookie: normalizeCookie(incoming.cookie || incoming.cookieText || base.cookie || base.cookieText),
    dtsg: normalizeText(incoming.dtsg || base.dtsg),
    dtsg2: normalizeText(incoming.dtsg2 || base.dtsg2),
    lsd: normalizeText(incoming.lsd || base.lsd),
    updatedAt: new Date().toISOString(),
  };
}

async function getRowsByUid<T>(storeName: StoreName, uid: string) {
  if (!uid) return [];
  return withStore<T[]>(storeName, "readonly", (store) => asRequest<T[]>(store.index("uid").getAll(uid)));
}

async function saveRows<T extends { uid?: string; id?: string }>(storeName: StoreName, uid: string, rows: T[]) {
  const now = new Date().toISOString();
  await withStore<unknown>(storeName, "readwrite", (store) => {
    rows.forEach((row) => {
      if (uid && row.id) {
        store.put({ ...row, uid, updatedAt: now });
      }
    });
  });
}

export const clientIndexedDb = {
  async getSetting<T = string>(key: string): Promise<T | undefined> {
    const settings = await this.getSettings<Record<string, T>>();
    return settings[key];
  },

  async setSetting<T>(key: string, value: T): Promise<void> {
    const currentSettings = await this.getSettings<Record<string, unknown>>();
    await this.saveSettings({ ...currentSettings, [key]: value });
  },

  async getSettings<T = Record<string, unknown>>(): Promise<T> {
    const record = await withStore<AppSettingsRecord<T> | undefined>(STORES.settings, "readonly", (store) =>
      asRequest<AppSettingsRecord<T> | undefined>(store.get("app"))
    );
    return (record?.data || {}) as T;
  },

  async saveSettings<T extends Record<string, unknown>>(settings: T): Promise<T> {
    await withStore<unknown>(STORES.settings, "readwrite", (store) =>
      asRequest<unknown>(store.put({ id: "app", data: settings } satisfies AppSettingsRecord<T>))
    );
    return settings;
  },

  async getModuleSetting<T = unknown>(moduleSlug: string, key: string, defaultValue?: T) {
    const storeName = normalizeText(moduleSlug);
    if (!storeName || !key) return null;

    const record = await getDynamicStoreRecord<ModuleSettingRecord<T>>(storeName, key);
    return record
      ? { ...record, moduleSlug: storeName, exists: true }
      : { key, value: defaultValue ?? null, moduleSlug: storeName, exists: false };
  },

  async setModuleSetting<T>(moduleSlug: string, key: string, value: T) {
    const storeName = normalizeText(moduleSlug);
    if (!storeName || !key) throw new Error("Module slug and setting key are required.");

    const record: ModuleSettingRecord<T> = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };

    await putDynamicStoreRecord(storeName, record);
    return { ...record, moduleSlug: storeName, exists: true };
  },

  async getFacebookAuth(): Promise<FacebookAuthRecord | undefined> {
    const record = await withStore<FacebookAuthRecord | undefined>(STORES.facebookAuth, "readonly", (store) =>
      asRequest<FacebookAuthRecord | undefined>(store.get("active"))
    );
    return record ? normalizeFacebookAuth(record, record) : undefined;
  },

  async saveFacebookAuth(auth: Omit<FacebookAuthRecord, "id" | "updatedAt">): Promise<FacebookAuthRecord> {
    const current = await this.getFacebookAuth();
    const record = normalizeFacebookAuth(auth, current);

    await withStore<unknown>(STORES.facebookAuth, "readwrite", (store) => asRequest<unknown>(store.put(record)));
    return record;
  },

  async clearFacebookAuth(): Promise<boolean> {
    await withStore<unknown>(STORES.facebookAuth, "readwrite", (store) => asRequest<unknown>(store.delete("active")));
    return true;
  },

  async listCreatedEmails(): Promise<CreatedEmailRecord[]> {
    return withStore<CreatedEmailRecord[]>(STORES.createdEmails, "readonly", (store) =>
      asRequest<CreatedEmailRecord[]>(store.getAll())
    );
  },

  async saveCreatedEmail(email: CreatedEmailRecord): Promise<void> {
    await withStore<unknown>(STORES.createdEmails, "readwrite", (store) =>
      asRequest<unknown>(store.put({ ...email, createdAt: email.createdAt || Date.now() }))
    );
  },

  async getResourceRows<T = ResourceDataRecord>(resource: "ads" | "bm" | "page" | "friends", uid: string): Promise<T[]> {
    const storeName = getResourceStoreName(resource);
    return getRowsByUid<T>(storeName, uid);
  },

  async saveResourceRows<T extends { uid?: string; id?: string }>(
    resource: "ads" | "bm" | "page" | "friends",
    uid: string,
    rows: T[]
  ): Promise<T[]> {
    const storeName = getResourceStoreName(resource);
    await saveRows(storeName, uid, rows);
    return this.getResourceRows<T>(resource, uid);
  },

  async purgeUidData(uid: string): Promise<{ ok: boolean; uid: string }> {
    const stores: StoreName[] = [
      STORES.adsData,
      STORES.bmData,
      STORES.pageData,
      STORES.friendsData,
      STORES.fetchMeta,
      STORES.processLogs,
    ];

    await Promise.all(stores.map((storeName) => deleteRowsByUid(storeName, uid)));
    await withStore<unknown>(STORES.facebookAuth, "readwrite", (store) => asRequest<unknown>(store.delete("active")));
    return { ok: true, uid };
  },
};

function getResourceStoreName(resource: "ads" | "bm" | "page" | "friends"): StoreName {
  if (resource === "ads") return STORES.adsData;
  if (resource === "bm") return STORES.bmData;
  if (resource === "page") return STORES.pageData;
  return STORES.friendsData;
}

async function deleteRowsByUid(storeName: StoreName, uid: string) {
  if (!uid) return;

  const rows = await getRowsByUid<{ uid?: string; id?: string; resource?: string }>(storeName, uid);
  await withStore<unknown>(storeName, "readwrite", (store) => {
    rows.forEach((row) => {
      if (storeName === STORES.fetchMeta && row.resource) {
        store.delete([uid, row.resource]);
        return;
      }

      if (row.id) {
        const key = storeName === STORES.processLogs ? row.id : [uid, row.id];
        store.delete(key);
      }
    });
  });
}

async function getDynamicStoreRecord<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openClientDbWithDynamicStore(storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error || new Error(`Cannot read module setting '${key}'.`));
  });
}

async function putDynamicStoreRecord(storeName: string, record: ModuleSettingRecord) {
  const db = await openClientDbWithDynamicStore(storeName);
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error(`Cannot save module setting '${record.key}'.`));
  });
}

async function openClientDbWithDynamicStore(storeName: string) {
  const db = await openClientDb();
  if (db.objectStoreNames.contains(storeName)) return db;

  const nextVersion = db.version + 1;
  db.close();
  dbPromise = null;

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, nextVersion);
    request.onupgradeneeded = () => {
      const upgradedDb = request.result;
      if (!upgradedDb.objectStoreNames.contains(storeName)) {
        upgradedDb.createObjectStore(storeName, { keyPath: "key" });
      }
    };
    request.onsuccess = () => {
      dbPromise = Promise.resolve(request.result);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error || new Error(`Cannot open module settings store '${storeName}'.`));
  });
}
