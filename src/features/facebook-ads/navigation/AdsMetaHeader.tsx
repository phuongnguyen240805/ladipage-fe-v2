"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Home,
  Info,
  Menu,
  Megaphone,
  Minimize2,
  Monitor,
  Search,
  Send,
  Trash2,
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
  const [showNotifications, setShowNotifications] = useState(false);
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

        <Link href="/facebook-ads/manager" className="adsmeta-logo-link" aria-label="LadiPage Facebook Ads">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/facebook-ads/adsmeta-logo.svg" alt="LadiPage Facebook Ads" />
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
          <div className="relative">
            <button
              type="button"
              className="adsmeta-header-icon relative"
              aria-label="Thông báo"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((value) => !value)}
            >
              <Bell size={16} /><span className="adsmeta-notification-count">9+</span>
            </button>
            {showNotifications && (
              <NotificationPopover onClose={() => setShowNotifications(false)} />
            )}
          </div>
          <button type="button" className="adsmeta-header-icon hidden lg:flex" aria-label="Thu gọn"><Minimize2 size={16} /></button>
        </div>
      </header>
    </>
  );
}

function NotificationPopover({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Cài đặt Pixel ngay",
      subtitle: "Tin nhắn tự động: tutorial_pixel",
      time: "2 ngày trước",
      read: false,
    },
    {
      id: "2",
      title: "Tạo chiến dịch đầu tiên",
      subtitle: "Tin nhắn tự động: tip_campaign",
      time: "4 ngày trước",
      read: false,
    },
    {
      id: "3",
      title: "Chào mừng đến AdsMeta!",
      subtitle: "Tin nhắn tự động: welcome",
      time: "5 ngày trước",
      read: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = activeTab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="absolute right-0 top-full mt-2 z-[300] w-[320px] sm:w-[340px] rounded-2xl bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#374151] shadow-2xl overflow-hidden font-sans">
      <div className="bg-slate-100 dark:bg-[#0f172a] border-b border-slate-200 dark:border-[#1e293b] p-4 text-slate-800 dark:text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/20 flex items-center justify-center text-slate-600 dark:text-white shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Thông báo</h3>
              <p className="text-xs text-slate-500 dark:text-white/80 mt-0.5">{unreadCount > 0 ? `${unreadCount} chưa đọc` : "Đã đọc hết"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/20 dark:hover:bg-white/30 text-slate-600 dark:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Check size={13} /> Đọc tất cả
          </button>
        </div>

        <div className="bg-slate-200 dark:bg-black/20 p-1 rounded-xl flex gap-1 mt-3.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              activeTab === "all" ? "bg-white text-lime-600 shadow-sm dark:bg-lime-500 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-white/80 dark:hover:text-white"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              activeTab === "unread" ? "bg-white text-lime-600 shadow-sm dark:bg-lime-500 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-white/80 dark:hover:text-white"
            }`}
          >
            Chưa đọc · {unreadCount}
          </button>
        </div>
      </div>

      <div className="p-3 max-h-[380px] overflow-y-auto space-y-2.5 bg-white dark:bg-[#111827]">
        <div className="text-[10px] font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 px-1 py-0.5 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> THÔNG TIN
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">Không có thông báo nào</div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151] hover:border-slate-300 dark:hover:border-[#4b5563] rounded-xl p-3 transition-colors relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] text-lime-600 dark:text-lime-400 border border-slate-200 dark:border-[#374151] flex items-center justify-center shrink-0 mt-0.5">
                  <Info size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.title}</h4>
                    {!item.read && <span className="w-2.5 h-2.5 rounded-full bg-lime-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{item.time}</p>

                  <div className="border-t border-slate-200 dark:border-[#374151] mt-2.5 pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="text-lime-600 dark:text-lime-500 hover:text-lime-700 dark:hover:text-lime-400 font-semibold flex items-center gap-1 transition-colors"
                    >
                      Đã xem <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNotification(item.id)}
                      className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href="/facebook-ads/settings"
        onClick={onClose}
        className="w-full py-3 bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[#374151] text-lime-600 dark:text-lime-500 hover:text-lime-700 dark:hover:text-lime-400 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
      >
        Xem tất cả thông báo <ArrowRight size={13} />
      </Link>
    </div>
  );
}

