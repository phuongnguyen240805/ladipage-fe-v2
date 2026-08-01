"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Home,
  Menu,
  Megaphone,
  Minimize2,
  Monitor,
  Search,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useFacebookAdsRuntime } from "../runtime/FacebookAdsRuntimeProvider";
import FacebookAdsMockBadge from "../shared/components/FacebookAdsMockBadge";

export type AdsMetaHeaderProps = {
  onOpenMenu: () => void;
};

export default function AdsMetaHeader({ onOpenMenu }: AdsMetaHeaderProps) {
  const [showTelegram, setShowTelegram] = useState(true);
  const [showConnection, setShowConnection] = useState(false);
  const [query, setQuery] = useState("");
  const runtime = useFacebookAdsRuntime();
  const connectionLabel = runtime.connectionStatus === "connected"
    ? "Đã kết nối Facebook"
    : runtime.connectionStatus === "permission-required"
      ? "Cần bổ sung quyền"
      : runtime.connectionStatus === "expired"
        ? "Phiên kết nối hết hạn"
        : "Chưa kết nối Meta";

  return (
    <>
      {showTelegram && (
        <div className="adsmeta-telegram-banner">
          <Bell size={15} className="shrink-0 text-blue-500" />
          <span className="min-w-0 flex-1 leading-snug">
            Bật cảnh báo Telegram để nhận thông báo quan trọng (số dư, gói, hỗ trợ phản hồi...) — không bỏ lỡ dù không mở AdsMeta.
          </span>
          <button type="button" className="adsmeta-telegram-connect">
            <Send size={13} /> Kết nối Telegram
          </button>
          <button type="button" aria-label="Ẩn thông báo Telegram" className="adsmeta-icon-ghost-dark" onClick={() => setShowTelegram(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      <header className="adsmeta-top-header">
        <button type="button" aria-label="Mở menu AdsMeta" className="adsmeta-header-icon" onClick={onOpenMenu}>
          <Menu size={19} />
        </button>

        <div className="relative">
          <button
            type="button"
            className={`adsmeta-facebook-user ${runtime.connectionStatus !== "connected" ? "is-warning" : ""}`}
            aria-expanded={showConnection}
            onClick={() => setShowConnection((value) => !value)}
          >
            <span className="adsmeta-avatar">NP</span>
            <span className="hidden min-w-0 flex-col text-left leading-tight sm:flex">
              <span className="max-w-36 truncate text-xs font-semibold">Nguyễn Phương</span>
              <span className="text-[10px] opacity-80">{connectionLabel}</span>
            </span>
            <ChevronDown size={13} className="opacity-80" />
          </button>
          {showConnection && (
            <div className="adsmeta-connection-popover" role="dialog" aria-label="Trạng thái kết nối Meta">
              <div className="adsmeta-connection-head">
                {runtime.connectionStatus === "connected"
                  ? <CheckCircle2 aria-hidden="true" size={15} />
                  : <AlertTriangle aria-hidden="true" size={15} />}
                <div><b>{connectionLabel}</b><span>Workspace LadiPage Demo</span></div>
                <FacebookAdsMockBadge />
              </div>
              <dl>
                <div><dt>Meta user</dt><dd>Nguyễn Phương · 100054…0494</dd></div>
                <div><dt>Quyền mô phỏng</dt><dd>ads_read · ads_management</dd></div>
                <div><dt>Lần quan sát</dt><dd>Hôm nay, 21:59</dd></div>
              </dl>
              <Link href="/facebook-ads/connections" onClick={() => setShowConnection(false)}>
                Quản lý kết nối và quyền
              </Link>
            </div>
          )}
        </div>

        <button type="button" className="adsmeta-marketing-button">
          <Megaphone size={15} />
          <span className="hidden flex-col items-start leading-none sm:flex">
            <span className="flex items-center gap-1 text-xs font-bold">Marketing Nhóm <b className="adsmeta-new-pill">NEW</b></span>
            <span className="mt-1 text-[9px] font-normal text-white/85">Đăng bài hàng loạt</span>
          </span>
        </button>

        <Link href="/facebook-ads/manager" className="adsmeta-logo-link" aria-label="AdsMeta Dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/facebook-ads/adsmeta-logo.svg" alt="AdsMeta.io" />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <label className="adsmeta-global-search">
            <Search size={13} />
            <input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="Tìm kiếm nhanh..." />
          </label>
          <button type="button" className="adsmeta-language"><span>🇻🇳</span><b>VI</b></button>
          <button type="button" className="adsmeta-header-icon hidden lg:flex" aria-label="Chế độ hiển thị"><Monitor size={16} /></button>
          <Link href="/facebook-ads/guide" className="adsmeta-header-icon hidden lg:flex" aria-label="Hướng dẫn"><CircleHelp size={16} /></Link>
          <Link href="/" className="adsmeta-header-icon" aria-label="Trang chủ"><Home size={16} /></Link>
          <button type="button" className="adsmeta-header-icon relative" aria-label="Thông báo">
            <Bell size={16} /><span className="adsmeta-notification-count">9+</span>
          </button>
          <button type="button" className="adsmeta-header-icon hidden lg:flex" aria-label="Thu gọn"><Minimize2 size={16} /></button>
        </div>
      </header>
    </>
  );
}
