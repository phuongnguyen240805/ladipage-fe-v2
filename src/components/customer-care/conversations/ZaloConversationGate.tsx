"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MessageCircleMore,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { ConversationWorkspace } from "@/components/customer-care/conversations/ConversationWorkspace";
import {
  useCreateCustomerCareChannel,
  useCustomerCareChannels,
  useRefreshZaloQr,
  useFacebookConnectionStatus,
  useLoginFacebook,
  useZaloConnectionStatus,
  useZaloQrUrl,
} from "@/features/customer-care/hooks/useCustomerCare";
import { useConversationUiStore } from "@/features/customer-care/stores/conversation-ui.store";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";

type ConnectProvider = "zalo" | "facebook" | null;

export function ZaloConversationGate() {
  const statusQuery = useZaloConnectionStatus();
  const facebookStatus = useFacebookConnectionStatus();
  const facebookLogin = useLoginFacebook();
  const refreshQr = useRefreshZaloQr();
  const createChannel = useCreateCustomerCareChannel();
  const channels = useCustomerCareChannels();
  const selectedChannelId = useConversationUiStore((state) => state.selectedChannelAccountId);
  const setSelectedChannelId = useConversationUiStore((state) => state.setSelectedChannelAccountId);
  const status = statusQuery.data;
  const connected = status?.phase === "connected" || facebookStatus.data?.phase === "connected";
  const [provider, setProvider] = useState<ConnectProvider>(null);
  const [facebookChannelId, setFacebookChannelId] = useState<string | null>(null);

  const qr = useZaloQrUrl(Boolean(provider === "zalo" && status?.qr_available));

  useEffect(() => {
    if (provider === "zalo" && status?.phase === "qr_ready") {
      qr.refresh();
    }
  }, [status?.phase, provider]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBusy =
    statusQuery.isLoading ||
    refreshQr.isPending ||
    status?.phase === "starting" ||
    status?.phase === "connecting";

  const error =
    refreshQr.error instanceof Error
      ? refreshQr.error.message
      : createChannel.error instanceof Error
        ? createChannel.error.message
      : statusQuery.error instanceof Error
        ? statusQuery.error.message
        : qr.error?.message ?? status?.last_error;

  let statusText = "Đang khởi tạo kết nối Zalo";
  switch (status?.phase) {
    case "qr_ready":
      statusText = "Mã QR đã sẵn sàng";
      break;
    case "connecting":
      statusText = "Đang chờ Zalo xác nhận đăng nhập";
      break;
    case "disconnected":
      statusText = "Chưa kết nối tài khoản Zalo";
      break;
    case "error":
      statusText = "Không thể kết nối Zalo";
      break;
  }

  const selectOrCreateChannel = async (channelProvider: "zalo_personal" | "facebook_personal") => {
    const selected = channels.data?.find((item) => item.id === selectedChannelId && item.provider === channelProvider);
    if (selected) return selected;
    const existing = (channels.data ?? []).filter((item) => item.provider === channelProvider);
    if (existing.length) {
      setSelectedChannelId(existing[0].id);
      return existing[0];
    }
    return createChannel.mutateAsync(channelProvider);
  };

  const startZaloLogin = async () => {
    const channel = await selectOrCreateChannel("zalo_personal");
    setProvider("zalo");
    await customerCareApi.refreshZaloQr(channel.id);
    qr.refresh();
  };

  const startFacebookLogin = async () => {
    const channel = await selectOrCreateChannel("facebook_personal");
    setFacebookChannelId(channel.id);
    setProvider("facebook");
  };

  const refresh = () => {
    refreshQr.mutate(undefined, {
      onSuccess: () => qr.refresh(),
    });
  };

  if (connected) {
    return <ConversationWorkspace />;
  }

  if (provider === "facebook") {
    return (
      <FacebookLoginPanel
        busy={facebookLogin.isPending}
        error={facebookLogin.error instanceof Error ? facebookLogin.error.message : facebookStatus.data?.last_error}
        onBack={() => setProvider(null)}
        onLogin={(cookie) => {
          if (!facebookChannelId) return;
          facebookLogin.mutate({ channelId: facebookChannelId, cookie });
        }}
      />
    );
  }

  if (provider !== "zalo") {
    return <ProviderChooser onChooseZalo={() => void startZaloLogin().catch(() => undefined)} onChooseFacebook={() => void startFacebookLogin().catch(() => undefined)} busy={refreshQr.isPending || createChannel.isPending} error={error} />;
  }

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,#eaf3ff_0,#f8fafc_48%,#eef2f7_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,#172036_0,#10121a_55%,#090b11_100%)]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:bg-[#151821] dark:shadow-black/30 md:grid-cols-[1.05fr_.95fr]">
        <section className="flex flex-col justify-between gap-8 p-7 sm:p-10">
          <div>
            <button
              type="button"
              onClick={() => setProvider(null)}
              className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Chọn phương thức khác
            </button>

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0866ff] text-white shadow-lg shadow-blue-500/25">
              <MessageCircleMore className="h-7 w-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0866ff]">
              Kênh Zalo cá nhân
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Quét QR để đăng nhập tài khoản Zalo
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Sau khi quét thành công, tài khoản sẽ xuất hiện bằng avatar ở cuối thanh công cụ hội thoại.
              Bấm avatar để xem hồ sơ hoặc đăng xuất.
            </p>
          </div>

          <div className="space-y-4">
            <GuideRow
              icon={<Smartphone className="h-5 w-5" />}
              title="Mở ứng dụng Zalo trên điện thoại"
              description="Mở trình quét QR trong Zalo và hướng camera vào mã bên cạnh."
            />
            <GuideRow
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Xác nhận đăng nhập"
              description="Chấp nhận yêu cầu đăng nhập trên điện thoại khi Zalo hiển thị xác nhận."
            />
            <GuideRow
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Tự động mở hội thoại"
              description="Sau khi kết nối thành công, giao diện hội thoại sẽ tự động mở."
            />
          </div>
        </section>

        <section className="flex min-h-[570px] flex-col items-center justify-center border-t border-slate-200/80 bg-slate-50/70 p-7 dark:border-white/10 dark:bg-white/[0.025] md:border-l md:border-t-0 sm:p-10">
          <div className="w-full max-w-sm text-center">
            <div className="mb-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  status?.phase === "qr_ready"
                    ? "bg-emerald-500"
                    : error
                      ? "bg-red-500"
                      : "animate-pulse bg-amber-500"
                }`}
              />
              {statusText}
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[310px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white dark:shadow-black/30">
              {status?.qr_available && qr.url ? (
                <img src={qr.url} alt="Mã QR đăng nhập Zalo" className="h-full w-full object-contain" />
              ) : isBusy ? (
                <div className="flex flex-col items-center gap-4 text-slate-500">
                  <LoaderCircle className="h-10 w-10 animate-spin text-[#0866ff]" />
                  <span className="text-sm">Đang tạo mã QR…</span>
                </div>
              ) : (
                <div className="flex max-w-[230px] flex-col items-center gap-4 text-slate-500">
                  <WifiOff className="h-10 w-10 text-red-500" />
                  <span className="text-sm leading-6">Chưa lấy được mã QR. Vui lòng kiểm tra kết nối rồi thử lại.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={refreshQr.isPending}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0866ff] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0759dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshQr.isPending ? "animate-spin" : ""}`} />
              {refreshQr.isPending ? "Đang làm mới mã…" : "Làm mới mã QR"}
            </button>

            <button
              type="button"
              onClick={() => void statusQuery.refetch()}
              className="mt-3 text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-white"
            >
              Kiểm tra lại trạng thái kết nối
            </button>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <p className="mt-5 text-[11px] leading-5 text-slate-400">
              {status?.account_id ? <>Tài khoản: <span className="font-medium">{status.account_id}</span></> : "Thông tin tài khoản sẽ hiển thị sau khi kết nối"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProviderChooser({
  onChooseZalo,
  onChooseFacebook,
  busy,
  error,
}: {
  onChooseZalo: () => void;
  onChooseFacebook: () => void;
  busy: boolean;
  error?: string;
}) {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto bg-slate-50 px-4 py-8 dark:bg-[#0f1218]">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-[#151821] sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <MessageCircleMore className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Kết nối kênh nhắn tin</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Chọn nền tảng bạn muốn đăng nhập để bắt đầu chăm sóc khách hàng.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onChooseZalo}
            disabled={busy}
            className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#0866ff]/50 hover:shadow-lg disabled:opacity-60 dark:border-white/10 dark:hover:border-blue-400/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0866ff] text-xl font-black text-white">Z</div>
            <div className="mt-5 text-base font-bold text-slate-950 dark:text-white">Đăng nhập bằng Zalo</div>
            <div className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Quét QR bằng ứng dụng Zalo trên điện thoại.</div>
            <div className="mt-4 text-xs font-bold text-[#0866ff]">{busy ? "Đang chuẩn bị QR…" : "Tiếp tục →"}</div>
          </button>

          <button type="button" onClick={onChooseFacebook} className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#1877f2]/50 hover:shadow-lg dark:border-white/10 dark:hover:border-blue-400/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1877f2] text-xl font-black text-white">f</div>
            <div className="mt-5 text-base font-bold text-slate-950 dark:text-white">Đăng nhập bằng Facebook</div>
            <div className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Kết nối Facebook Messenger để tiếp nhận và phản hồi hội thoại.</div>
            <div className="mt-4 text-xs font-bold text-[#1877f2]">Tiếp tục →</div>
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FacebookLoginPanel({ onBack, onLogin, busy, error }: {
  onBack: () => void;
  onLogin: (cookie: string) => void;
  busy: boolean;
  error?: string;
}) {
  const [cookie, setCookie] = useState("");
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto bg-slate-50 px-4 py-8 dark:bg-[#0f1218]">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-[#151821] sm:p-9">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Chọn phương thức khác</button>
        <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877f2] text-2xl font-black text-white">f</div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">Đăng nhập Facebook Messenger</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Nhập thông tin phiên Facebook có <code>c_user</code> và <code>xs</code>. Dữ liệu được mã hóa trước khi lưu trữ.</p>
        <textarea value={cookie} onChange={(event) => setCookie(event.target.value)} rows={7} spellCheck={false} placeholder="c_user=...; xs=...; datr=..." className="mt-5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-[#1877f2] dark:border-white/10 dark:bg-white/5" />
        <button type="button" disabled={busy || !cookie.trim()} onClick={() => onLogin(cookie.trim())} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] text-sm font-semibold text-white hover:bg-[#1468d8] disabled:opacity-50">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} Kết nối Facebook
        </button>
        {error ? <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div> : null}
      </div>
    </div>
  );
}

function GuideRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0866ff] dark:bg-blue-500/10">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</div>
      </div>
    </div>
  );
}
