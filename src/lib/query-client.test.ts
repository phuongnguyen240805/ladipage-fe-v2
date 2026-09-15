import { beforeEach, describe, expect, it } from "vitest";

import {
  appQueryClient,
  resetQueryCacheScopeForTests,
  syncQueryCacheScope,
} from "./query-client";

describe("query cache tenant/user scope", () => {
  beforeEach(() => {
    appQueryClient.clear();
    resetQueryCacheScopeForTests();
  });

  it("keeps cache for the same authenticated scope", () => {
    syncQueryCacheScope("tenant:1:user:a@example.com");
    appQueryClient.setQueryData(["crm", "customers"], [{ id: 1 }]);

    syncQueryCacheScope("tenant:1:user:a@example.com");

    expect(appQueryClient.getQueryData(["crm", "customers"])).toEqual([
      { id: 1 },
    ]);
  });

  it("clears cached authenticated data when tenant/user scope changes", () => {
    syncQueryCacheScope("tenant:1:user:a@example.com");
    appQueryClient.setQueryData(["crm", "customers"], [{ id: 1 }]);

    syncQueryCacheScope("tenant:2:user:b@example.com");

    expect(appQueryClient.getQueryData(["crm", "customers"])).toBeUndefined();
  });

  it("clears cached authenticated data on logout", () => {
    syncQueryCacheScope("tenant:1:user:a@example.com");
    appQueryClient.setQueryData(["account", "private"], { email: "a@example.com" });

    syncQueryCacheScope("anonymous");

    expect(appQueryClient.getQueryData(["account", "private"])).toBeUndefined();
  });
});
