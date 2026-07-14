import { describe, expect, it } from "vitest";

import {
  buildEdgeKvKey,
  isValidCustomerHostname,
  mapCloudflareHostnameToDomainStatus,
  mapCloudflareSslToStatus,
  normalizeCustomerHostname,
  normalizeRoutePathPrefix,
} from "./domain-hostname.util";

describe("domain-hostname.util", () => {
  it("normalizes hostnames", () => {
    expect(normalizeCustomerHostname("https://WWW.Shop.VN/path")).toBe("www.shop.vn");
  });

  it("validates customer hostnames", () => {
    expect(isValidCustomerHostname("www.shop.vn")).toBe(true);
    expect(isValidCustomerHostname("shop")).toBe(false);
    expect(isValidCustomerHostname("")).toBe(false);
  });

  it("normalizes path prefix and KV keys", () => {
    expect(normalizeRoutePathPrefix("km-tet")).toBe("/km-tet");
    expect(normalizeRoutePathPrefix("/")).toBe("/");
    expect(buildEdgeKvKey("www.shop.vn", "/")).toBe("www.shop.vn/");
    expect(buildEdgeKvKey("www.shop.vn", "/km-tet")).toBe("www.shop.vn/km-tet");
  });

  it("maps CF ssl/hostname statuses", () => {
    expect(mapCloudflareSslToStatus("active")).toBe("ACTIVE");
    expect(mapCloudflareSslToStatus("pending_validation")).toBe("PENDING");
    expect(
      mapCloudflareHostnameToDomainStatus({
        hostnameStatus: "active",
        sslStatus: "active",
      }),
    ).toBe("VERIFIED");
    expect(
      mapCloudflareHostnameToDomainStatus({
        hostnameStatus: "pending",
        sslStatus: "pending_validation",
      }),
    ).toBe("PENDING");
  });
});
