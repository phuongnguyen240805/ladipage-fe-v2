import { APP_REGISTRY, type AppRegistryEntry } from "@/config/app-registry";
import type { ApplicationRecord } from "@/lib/endpoints/application.api";
import type { AppItem } from "../types";
import {
  formatApplicationPrice,
  formatInstallCount,
} from "./format-application-price";

function mergeEntry(
  registry: AppRegistryEntry,
  record?: ApplicationRecord
): AppItem {
  const isInstalled = record?.status_active === true;
  const price = record?.price ?? 0;

  return {
    id: registry.feId,
    code: registry.code,
    name: record?.name ?? registry.name,
    description: registry.description,
    iconName: registry.iconName,
    status: isInstalled ? "INSTALLED" : "NOT_INSTALLED",
    category: registry.category,
    downloads: formatInstallCount(record?.installs_count),
    price: formatApplicationPrice(price, isInstalled, registry.upcoming),
    isPinned: record?.status_pin === true,
    tags: registry.tags,
    upcoming: registry.upcoming,
  };
}

export function mergeApplicationsWithRegistry(
  records: ApplicationRecord[]
): AppItem[] {
  const recordsByCode = new Map(
    records.map((record) => [String(record.code ?? ""), record])
  );

  return APP_REGISTRY.map((entry) =>
    mergeEntry(entry, recordsByCode.get(entry.code))
  );
}

export function buildFallbackApplications(): AppItem[] {
  return APP_REGISTRY.map((entry) => mergeEntry(entry));
}