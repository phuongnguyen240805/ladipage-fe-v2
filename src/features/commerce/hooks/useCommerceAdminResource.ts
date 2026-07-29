"use client";

import { useCallback, useEffect, useState } from "react";
import {
  commerceApi,
  isCommerceApiEnabled,
  type CommerceAdminResourceKind,
} from "@/lib/endpoints/commerce.api";

export function useCommerceAdminResource<T>(
  kind: CommerceAdminResourceKind,
  normalize: (value: Record<string, unknown>) => T,
) {
  const [items, setItems] = useState<T[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const values =
        await commerceApi.listAdminResource<Record<string, unknown>>(kind);
      setItems(values.map(normalize));
      setReady(true);
    } catch (error) {
      console.warn(`[commerce] ${kind} API unavailable`, error);
      setReady(false);
    }
  }, [kind, normalize]);

  useEffect(() => {
    if (!isCommerceApiEnabled()) return;
    void commerceApi.listAdminResource<Record<string, unknown>>(kind).then(
      (values) => {
        setItems(values.map(normalize));
        setReady(true);
      },
      (error) => {
        console.warn(`[commerce] ${kind} API unavailable`, error);
        setReady(false);
      },
    );
  }, [kind, normalize]);

  const create = useCallback(async (body: Record<string, unknown>) => {
    const value = await commerceApi.createAdminResource<Record<string, unknown>>(
      kind,
      body,
    );
    await refresh();
    return normalize(value);
  }, [kind, normalize, refresh]);

  const update = useCallback(async (
    id: string,
    body: Record<string, unknown>,
  ) => {
    const value = await commerceApi.updateAdminResource<Record<string, unknown>>(
      kind,
      id,
      body,
    );
    await refresh();
    return normalize(value);
  }, [kind, normalize, refresh]);

  const remove = useCallback(async (id: string) => {
    await commerceApi.deleteAdminResource(kind, id);
    await refresh();
  }, [kind, refresh]);

  return { items, ready, create, update, remove, refresh };
}
