"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  CirclePlus,
  Info,
  LoaderCircle,
  LogOut,
  Plus,
  X,
} from "lucide-react";
import type { CustomerCareChannelAccount } from "@liora/api-types";
import { useCustomerCareChannels } from "@/features/customer-care/hooks/useCustomerCare";
import {
  customerCareProviderToApp,
  useConversationUiStore,
  type CustomerCareApp,
} from "@/features/customer-care/stores/conversation-ui.store";
import {
  customerCareQueryKey,
  useCustomerCareScopeKey,
} from "@/features/customer-care/session/customer-care-scope";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";

const PRIMARY_APPS: CustomerCareApp[] = ["zalo", "facebook", "telegram"];

const APP_META: Record<CustomerCareApp, { label: string; short: string; color: string }> = {
  zalo: { label: "Zalo", short: "Z", color: "#0866ff" },
  facebook: { label: "Facebook", short: "f", color: "#1877f2" },
  telegram: { label: "Telegram", short: "TG", color: "#229ED9" },
  instagram: { label: "Instagram", short: "IG", color: "#c13584" },
  whatsapp: { label: "WhatsApp", short: "WA", color: "#25D366" },
  tiktok: { label: "TikTok", short: "TT", color: "#111827" },
  website: { label: "Website", short: "W", color: "#64748b" },
};

type PopupPosition = { top: number; left: number };
type ConnectDialog =
  | { app: "zalo"; channelId: string; qrUrl: string | null; busy: boolean; error?: string }
  | { app: "facebook"; channelId: string; cookie: string; busy: boolean; error?: string };

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

function accountProfile(account?: CustomerCareChannelAccount | null) {
  const root = asRecord(account?.status?.profile);
  const nested = asRecord(root.profile ?? root.data ?? root.user);
  const source = { ...root, ...nested };
  const rawName =
    firstString(source, ["displayName", "display_name", "name", "username", "zaloName"]) ||
    account?.name ||
    APP_META[customerCareProviderToApp(account?.provider) ?? "website"].label;
  const name = rawName
    .replace(/\b(demo|test|sample)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim() || "Tài khoản hội thoại";

  return {
    name,
    avatarUrl: firstString(source, ["avatarUrl", "avatar_url", "avatar", "picture", "photoUrl"]),
    coverUrl: firstString(source, ["coverUrl", "cover_url", "cover", "backgroundUrl", "background_url"]),
    phone: firstString(source, ["phone", "phoneNumber", "phone_number"]),
    bio: firstString(source, ["bio", "statusMessage", "status_message", "about"]),
  };
}

function accountPhase(account?: CustomerCareChannelAccount | null) {
  return String(account?.status?.phase ?? "disconnected").toLowerCase();
}

function isConnected(account?: CustomerCareChannelAccount | null) {
  return accountPhase(account) === "connected";
}

function providerForNewAccount(app: CustomerCareApp) {
  if (app === "zalo") return "zalo_personal" as const;
  if (app === "facebook") return "facebook_personal" as const;
  return null;
}

export function ChannelAccountSubmenu() {
  const channelsQuery = useCustomerCareChannels();
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey();
  const activeChannelAccountIds = useConversationUiStore((state) => state.activeChannelAccountIds);
  const setActiveChannelAccountId = useConversationUiStore((state) => state.setActiveChannelAccountId);

  const [openApp, setOpenApp] = useState<CustomerCareApp | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({ top: 12, left: 76 });
  const [profileAccount, setProfileAccount] = useState<CustomerCareChannelAccount | null>(null);
  const [connectDialog, setConnectDialog] = useState<ConnectDialog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const anchorRefs = useRef<Partial<Record<CustomerCareApp, HTMLButtonElement | null>>>({});

  const channels = useMemo(() => channelsQuery.data ?? [], [channelsQuery.data]);
  const discoveredApps = useMemo(
    () => [...new Set(channels.map((item) => customerCareProviderToApp(item.provider)).filter(Boolean))] as CustomerCareApp[],
    [channels],
  );
  const apps = useMemo(
    () => [...PRIMARY_APPS, ...discoveredApps.filter((app) => !PRIMARY_APPS.includes(app))],
    [discoveredApps],
  );

  const accountsFor = (app: CustomerCareApp) =>
    channels.filter((item) => customerCareProviderToApp(item.provider) === app);

  const activeAccountFor = (app: CustomerCareApp) => {
    const accounts = accountsFor(app);
    const selectedId = activeChannelAccountIds[app];
    return accounts.find((item) => item.id === selectedId) ?? accounts[0] ?? null;
  };

  useEffect(() => {
    if (!openApp) return;
    const handlePointer = (event: MouseEvent) => {
      const node = event.target as Node;
      const anchor = anchorRefs.current[openApp];
      if (popupRef.current?.contains(node) || anchor?.contains(node)) return;
      setOpenApp(null);
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [openApp]);

  useEffect(() => {
    if (connectDialog?.app !== "zalo") return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      void customerCareApi.getZaloStatus(connectDialog.channelId).then((status) => {
        if (cancelled || status.phase !== "connected") return;
        setConnectDialog((current) => {
          if (current?.app === "zalo" && current.qrUrl) URL.revokeObjectURL(current.qrUrl);
          return null;
        });
        if (scopeKey) {
          void queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "channels") });
        }
      }).catch(() => undefined);
    }, 2200);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [connectDialog, queryClient, scopeKey]);

  useEffect(() => () => {
    if (connectDialog?.app === "zalo" && connectDialog.qrUrl) {
      URL.revokeObjectURL(connectDialog.qrUrl);
    }
  }, [connectDialog]);

  const openMenu = (app: CustomerCareApp) => {
    const anchor = anchorRefs.current[app];
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      const estimatedHeight = Math.min(430, 150 + accountsFor(app).length * 58);
      const top = Math.max(12, Math.min(rect.top - estimatedHeight / 2 + rect.height / 2, window.innerHeight - estimatedHeight - 12));
      setPopupPosition({ top, left: rect.right + 12 });
    }
    setActionError(null);
    setOpenApp((current) => (current === app ? null : app));
  };

  const selectAccount = (app: CustomerCareApp, account: CustomerCareChannelAccount) => {
    setActiveChannelAccountId(app, account.id);
    setOpenApp(null);
  };

  const refreshChannels = async () => {
    if (!scopeKey) return;
    await queryClient.invalidateQueries({ queryKey: customerCareQueryKey(scopeKey, "channels") });
  };

  const addAccount = async (app: CustomerCareApp) => {
    const provider = providerForNewAccount(app);
    if (!provider) return;
    setBusyAction(`add:${app}`);
    setActionError(null);
    try {
      const created = await customerCareApi.createChannel(provider, `${APP_META[app].label} CSKH`);
      setActiveChannelAccountId(app, created.id);
      await refreshChannels();
      setOpenApp(null);

      if (app === "zalo") {
        setConnectDialog({ app: "zalo", channelId: created.id, qrUrl: null, busy: true });
        await customerCareApi.refreshZaloQr(created.id);

        let qrAvailable = false;
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const status = await customerCareApi.getZaloStatus(created.id);
          if (status.phase === "connected") {
            await refreshChannels();
            setConnectDialog(null);
            return;
          }
          if (status.qr_available) {
            qrAvailable = true;
            break;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 500));
        }

        if (!qrAvailable) throw new Error("Chưa tạo được mã QR Zalo. Vui lòng thử lại.");
        const blob = await customerCareApi.getZaloQrBlob(created.id);
        const qrUrl = URL.createObjectURL(blob);
        setConnectDialog({ app: "zalo", channelId: created.id, qrUrl, busy: false });
      } else {
        setConnectDialog({ app: "facebook", channelId: created.id, cookie: "", busy: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setActionError(message);
      setConnectDialog((current) => {
        if (!current) return current;
        return { ...current, busy: false, error: message } as ConnectDialog;
      });
    } finally {
      setBusyAction(null);
    }
  };

  const disconnectAccount = async (app: CustomerCareApp, account: CustomerCareChannelAccount) => {
    if (app !== "zalo" && app !== "facebook") return;
    setBusyAction(`logout:${account.id}`);
    setActionError(null);
    try {
      if (app === "zalo") await customerCareApi.disconnectZaloSession(account.id);
      else await customerCareApi.disconnectFacebookSession(account.id);

      const alternatives = accountsFor(app).filter((item) => item.id !== account.id);
      setActiveChannelAccountId(app, alternatives[0]?.id ?? null);
      await refreshChannels();
      setOpenApp(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction(null);
    }
  };

  const submitFacebook = async () => {
    if (connectDialog?.app !== "facebook") return;
    const cookie = connectDialog.cookie.trim();
    if (!cookie) return;
    setConnectDialog({ ...connectDialog, busy: true, error: undefined });
    try {
      await customerCareApi.loginFacebook(connectDialog.channelId, cookie);
      await refreshChannels();
      setConnectDialog(null);
    } catch (error) {
      setConnectDialog((current) => current?.app === "facebook"
        ? { ...current, busy: false, error: error instanceof Error ? error.message : String(error) }
        : current);
    }
  };

  return (
    <>
      <div className="mt-auto flex flex-col items-center gap-1.5 px-1.5 pb-1">
        {apps.map((app) => {
          const account = activeAccountFor(app);
          const profile = accountProfile(account);
          const meta = APP_META[app];
          const connected = isConnected(account);
          return (
            <button
              key={app}
              ref={(node) => { anchorRefs.current[app] = node; }}
              type="button"
              onClick={() => openMenu(app)}
              title={account ? `${meta.label}: ${profile.name}` : `${meta.label}: chưa có tài khoản`}
              aria-label={`Tài khoản ${meta.label}`}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/70 dark:hover:bg-white/10"
            >
              <span
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-[11px] font-black text-white shadow-sm ring-1 ring-black/5 dark:ring-white/15"
                style={{ backgroundColor: meta.color }}
              >
                {profile.avatarUrl && account ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  meta.short
                )}
              </span>
              <span
                className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#f4f4fa] dark:border-[#13141f] ${connected ? "bg-emerald-500" : account ? "bg-amber-400" : "bg-slate-300"}`}
              />
              <span className="pointer-events-none absolute left-[50px] top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:translate-x-1 group-hover:opacity-100">
                {account ? profile.name : meta.label}
              </span>
            </button>
          );
        })}
      </div>

      {openApp && typeof document !== "undefined" ? createPortal(
        <div
          ref={popupRef}
          className="fixed z-[180] w-[292px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.22)] dark:border-white/10 dark:bg-[#171b25]"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <AccountPopup
            app={openApp}
            accounts={accountsFor(openApp)}
            activeAccount={activeAccountFor(openApp)}
            busyAction={busyAction}
            error={actionError}
            onSelect={(account) => selectAccount(openApp, account)}
            onAdd={() => void addAccount(openApp)}
            onInfo={(account) => {
              setProfileAccount(account);
              setOpenApp(null);
            }}
            onLogout={(account) => void disconnectAccount(openApp, account)}
          />
        </div>,
        document.body,
      ) : null}

      {profileAccount && typeof document !== "undefined" ? createPortal(
        <AccountInfoDialog account={profileAccount} onClose={() => setProfileAccount(null)} />,
        document.body,
      ) : null}

      {connectDialog && typeof document !== "undefined" ? createPortal(
        <ConnectDialogView
          dialog={connectDialog}
          onChangeFacebookCookie={(cookie) => setConnectDialog((current) => current?.app === "facebook" ? { ...current, cookie } : current)}
          onSubmitFacebook={() => void submitFacebook()}
          onClose={() => {
            if (connectDialog.app === "zalo" && connectDialog.qrUrl) URL.revokeObjectURL(connectDialog.qrUrl);
            setConnectDialog(null);
          }}
        />,
        document.body,
      ) : null}
    </>
  );
}

function AccountPopup({
  app,
  accounts,
  activeAccount,
  busyAction,
  error,
  onSelect,
  onAdd,
  onInfo,
  onLogout,
}: {
  app: CustomerCareApp;
  accounts: CustomerCareChannelAccount[];
  activeAccount: CustomerCareChannelAccount | null;
  busyAction: string | null;
  error: string | null;
  onSelect: (account: CustomerCareChannelAccount) => void;
  onAdd: () => void;
  onInfo: (account: CustomerCareChannelAccount) => void;
  onLogout: (account: CustomerCareChannelAccount) => void;
}) {
  const meta = APP_META[app];
  const canCreate = Boolean(providerForNewAccount(app));
  const canLogout = app === "zalo" || app === "facebook";

  return (
    <div>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: meta.color }}>{meta.short}</span>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{meta.label}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Chọn tài khoản sử dụng</div>
          </div>
        </div>
      </div>

      <div className="max-h-[260px] overflow-y-auto p-1.5">
        {accounts.length ? accounts.map((account) => {
          const profile = accountProfile(account);
          const active = account.id === activeAccount?.id;
          const connected = isConnected(account);
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelect(account)}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-lime-50 dark:bg-lime-500/10" : "hover:bg-slate-50 dark:hover:bg-white/[0.06]"}`}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white" style={{ backgroundColor: meta.color }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" /> : profile.name.slice(0, 1).toUpperCase()}
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#171b25] ${connected ? "bg-emerald-500" : "bg-amber-400"}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{profile.name}</span>
                <span className="block truncate text-[10px] text-slate-400">{connected ? "Đang kết nối" : "Chưa kết nối"}</span>
              </span>
              {active ? <Check className="h-4 w-4 shrink-0 text-lime-600" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
            </button>
          );
        }) : (
          <div className="px-3 py-5 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
            Chưa có tài khoản {meta.label} trong không gian làm việc này.
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-1.5 dark:border-white/10">
        <button
          type="button"
          onClick={onAdd}
          disabled={!canCreate || busyAction === `add:${app}`}
          title={!canCreate ? `Connector ${meta.label} chưa được cấu hình ở backend` : undefined}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-white/[0.06]"
        >
          {busyAction === `add:${app}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CirclePlus className="h-4 w-4" />}
          Thêm tài khoản {meta.label}
        </button>
        {activeAccount ? (
          <>
            <button type="button" onClick={() => onInfo(activeAccount)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]">
              <Info className="h-4 w-4" /> Thông tin tài khoản
            </button>
            <button
              type="button"
              onClick={() => onLogout(activeAccount)}
              disabled={!canLogout || busyAction === `logout:${activeAccount.id}`}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {busyAction === `logout:${activeAccount.id}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Đăng xuất tài khoản
            </button>
          </>
        ) : null}
        {error ? <div className="mx-2 my-1 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] leading-4 text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}
      </div>
    </div>
  );
}

function AccountInfoDialog({ account, onClose }: { account: CustomerCareChannelAccount; onClose: () => void }) {
  const app = customerCareProviderToApp(account.provider) ?? "website";
  const meta = APP_META[app];
  const profile = accountProfile(account);
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151821]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="relative h-28" style={{ background: `linear-gradient(135deg, ${meta.color}, #0f172a)` }}>
          {profile.coverUrl ? <img src={profile.coverUrl} alt="Ảnh bìa" className="h-full w-full object-cover" /> : null}
          <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/45"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pb-6">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-black text-white shadow-lg dark:border-[#151821]" style={{ backgroundColor: meta.color }}>
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-full object-cover" /> : profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">{profile.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{meta.label} · {isConnected(account) ? "Đang kết nối" : "Chưa kết nối"}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{account.externalAccountId}</span>
          </div>
          <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/[0.04]">
            <InfoRow label="Tên kết nối" value={account.name || profile.name} />
            {profile.phone ? <InfoRow label="Số điện thoại" value={profile.phone} /> : null}
            {profile.bio ? <InfoRow label="Giới thiệu" value={profile.bio} /> : null}
            {account.status?.last_connected_at ? <InfoRow label="Kết nối gần nhất" value={new Date(String(account.status.last_connected_at)).toLocaleString("vi-VN")} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[110px_1fr] gap-3"><span className="text-slate-500 dark:text-slate-400">{label}</span><span className="min-w-0 break-words font-medium text-slate-900 dark:text-slate-100">{value}</span></div>;
}

function ConnectDialogView({
  dialog,
  onChangeFacebookCookie,
  onSubmitFacebook,
  onClose,
}: {
  dialog: ConnectDialog;
  onChangeFacebookCookie: (cookie: string) => void;
  onSubmitFacebook: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#171b25]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-slate-950 dark:text-white">Kết nối {dialog.app === "zalo" ? "Zalo" : "Facebook"}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Hoàn tất xác thực để tài khoản xuất hiện trong hộp thư đa kênh.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        {dialog.app === "zalo" ? (
          <div className="mt-5 text-center">
            <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
              {dialog.qrUrl ? <img src={dialog.qrUrl} alt="Mã QR đăng nhập Zalo" className="h-full w-full object-contain" /> : <LoaderCircle className="h-8 w-8 animate-spin text-[#0866ff]" />}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Quét QR bằng ứng dụng Zalo. Hộp thoại sẽ tự đóng sau khi kết nối thành công.</p>
            {dialog.error ? <p className="mt-3 text-xs text-red-600">{dialog.error}</p> : null}
          </div>
        ) : (
          <div className="mt-5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Thông tin phiên Facebook</label>
            <textarea
              value={dialog.cookie}
              onChange={(event) => onChangeFacebookCookie(event.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="c_user=...; xs=...; datr=..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-[#1877f2] dark:border-white/10 dark:bg-white/5"
            />
            <button type="button" disabled={dialog.busy || !dialog.cookie.trim()} onClick={onSubmitFacebook} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] text-sm font-semibold text-white disabled:opacity-50">
              {dialog.busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Kết nối Facebook
            </button>
            {dialog.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{dialog.error}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
