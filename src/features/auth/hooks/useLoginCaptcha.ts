"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImageCaptcha } from "@liora/api-types";
import { authApi } from "@/lib/endpoints/auth.api";

export function useLoginCaptcha() {
  const [captcha, setCaptcha] = useState<ImageCaptcha | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getCaptchaImage();
      setCaptcha(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không tải được captcha";
      setError(message);
      setCaptcha(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { captcha, loading, error, refresh };
}