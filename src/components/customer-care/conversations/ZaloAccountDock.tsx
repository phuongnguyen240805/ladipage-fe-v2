"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, UserRound, X } from "lucide-react";
import { useZaloConnectionStatus } from "@/features/customer-care/hooks/useCustomerCare";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";
import { customerCareQueryKey, useCustomerCareScopeKey } from "@/features/customer-care/session/customer-care-scope";

type ProfileView = {
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  accountId: string;
  phone?: string;
  bio?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function profileView(raw: unknown, accountId: string): ProfileView {
  const root = asRecord(raw);
  const nested = asRecord(root.profile ?? root.data ?? root.user);
  const source = { ...root, ...nested };
  return {
    name:
      firstString(source, ["displayName", "display_name", "name", "zaloName", "username"]) ||
      "Tài khoản Zalo",
    avatarUrl: firstString(source, ["avatarUrl", "avatar_url", "avatar", "picture", "photoUrl"]),
    coverUrl: firstString(source, ["coverUrl", "cover_url", "cover", "backgroundUrl", "background_url"]),
    accountId,
    phone: firstString(source, ["phone", "phoneNumber", "phone_number"]),
    bio: firstString(source, ["bio", "status", "statusMessage", "status_message", "about"]),
  };
}

export function ZaloAccountDock() {
  const statusQuery = useZaloConnectionStatus();
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const status = statusQuery.data;
  const connected = status?.phase === "connected";
  const profile = profileView(status?.profile, status?.account_id || "Chưa xác định");

  const disconnect = useMutation({
    mutationFn: () => {
      if (!status?.channelId) throw new Error("Hãy chọn tài khoản Zalo");
      return customerCareApi.disconnectZaloSession(status.channelId);
    },
    onSuccess: () => {
      if (scopeKey && status?.channelId) {
        queryClient.removeQueries({ queryKey: customerCareQueryKey(scopeKey, "channel", status.channelId) });
        void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "channels") });
      }
      setMenuOpen(false);
      setProfileOpen(false);
    },
  });

  if (!connected) {
    return (
      <div
        title="Chưa kết nối tài khoản Zalo"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-xs font-bold text-slate-400 dark:border-white/15 dark:bg-white/5"
      >
        Z
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#0866ff] text-sm font-bold text-white shadow-md ring-1 ring-slate-200 transition hover:scale-[1.03] dark:border-[#151923] dark:ring-white/15"
          title="Tài khoản Zalo"
          aria-label="Mở tùy chọn tài khoản Zalo"
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            profile.name.slice(0, 1).toUpperCase()
          )}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#151923]" />
        </button>

        {menuOpen ? (
          <div className="absolute bottom-0 left-[52px] z-[90] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#171b25]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <UserRound className="h-4 w-4" />
              Hồ sơ Zalo
            </button>
            <button
              type="button"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              {disconnect.isPending ? "Đang đăng xuất…" : "Đăng xuất Zalo"}
            </button>

            {disconnect.error instanceof Error ? (
              <div className="px-3 pb-2 pt-1 text-[11px] leading-4 text-red-600 dark:text-red-400">
                {disconnect.error.message}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {profileOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151821]">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#1677ff] via-[#0b8cff] to-[#62d5ff]">
              {profile.coverUrl ? (
                <img src={profile.coverUrl} alt="Ảnh bìa Zalo" className="h-full w-full object-cover" />
              ) : null}
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/45"
                aria-label="Đóng hồ sơ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative px-6 pb-7">
              <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#0866ff] text-center text-3xl font-bold leading-[88px] text-white shadow-lg dark:border-[#151821]">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile.name.slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold text-slate-950 dark:text-white">{profile.name}</h2>
                  <div className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Đang kết nối
                  </div>
                </div>
                <div className="rounded-xl bg-[#eaf3ff] px-3 py-2 text-xs font-bold text-[#0866ff] dark:bg-blue-500/10 dark:text-blue-300">
                  Zalo
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/[0.04]">
                <ProfileRow label="Account ID" value={profile.accountId} />
                {profile.phone ? <ProfileRow label="Số điện thoại" value={profile.phone} /> : null}
                {profile.bio ? <ProfileRow label="Giới thiệu" value={profile.bio} /> : null}
                {status?.last_connected_at ? (
                  <ProfileRow label="Kết nối gần nhất" value={new Date(status.last_connected_at).toLocaleString("vi-VN")} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 break-words font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
