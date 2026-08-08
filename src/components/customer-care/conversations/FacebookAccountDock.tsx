"use client";

import { useState } from "react";
import { LoaderCircle, LogOut, ShieldCheck, X } from "lucide-react";
import {
  useDisconnectFacebook,
  useFacebookConnectionStatus,
  useLoginFacebook,
} from "@/features/customer-care/hooks/useCustomerCare";

export function FacebookAccountDock() {
  const [open, setOpen] = useState(false);
  const [cookie, setCookie] = useState("");
  const status = useFacebookConnectionStatus();
  const login = useLoginFacebook();
  const disconnect = useDisconnectFacebook();
  const connected = status.data?.phase === "connected";
  const error = login.error instanceof Error ? login.error.message : status.data?.last_error;

  const submit = () => {
    const value = cookie.trim();
    if (!value) return;
    login.mutate(value, {
      onSuccess: () => {
        setCookie("");
        setOpen(false);
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={connected ? "Tài khoản Facebook đã kết nối" : "Kết nối Facebook"}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white transition hover:scale-105 ${connected ? "bg-[#1877f2]" : "bg-slate-400 dark:bg-white/15"}`}
      >
        f
        <span className="pointer-events-none absolute left-[48px] z-[70] whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 font-sans text-xs font-medium leading-none text-white opacity-0 shadow-xl transition group-hover:opacity-100">
          {connected ? "Facebook đã kết nối" : "Kết nối Facebook"}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#171b25]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877f2] text-xl font-black text-white">f</div>
                <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Kết nối Facebook Messenger</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Phiên được mã hóa trên connector. Cookie không được trả lại trình duyệt sau khi gửi.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>

            {connected ? (
              <div className="mt-6">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" /> Facebook đang kết nối ({status.data?.account_id}).
                </div>
                <button type="button" disabled={disconnect.isPending} onClick={() => disconnect.mutate(undefined, { onSuccess: () => setOpen(false) })} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" /> Đăng xuất Facebook
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Cookie Facebook (bắt buộc có c_user và xs)</label>
                <textarea value={cookie} onChange={(event) => setCookie(event.target.value)} rows={6} spellCheck={false} placeholder="c_user=...; xs=...; datr=..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-[#1877f2] dark:border-white/10 dark:bg-white/5" />
                <button type="button" disabled={login.isPending || !cookie.trim()} onClick={submit} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] text-sm font-semibold text-white hover:bg-[#1468d8] disabled:opacity-50">
                  {login.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  Đăng nhập Facebook
                </button>
                {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p> : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
