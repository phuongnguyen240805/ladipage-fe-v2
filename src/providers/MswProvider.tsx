"use client";

import React, { useEffect, useState } from "react";

interface MswProviderProps {
  children: React.ReactNode;
}

export function MswProvider({ children }: MswProviderProps) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== "true") return;

    async function startMsw() {
      const { worker } = await import("@/mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      setReady(true);
    }

    void startMsw();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-slate-400">
        Đang khởi tạo mock API...
      </div>
    );
  }

  return <>{children}</>;
}