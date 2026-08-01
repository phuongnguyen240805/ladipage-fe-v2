"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  FileClock,
  FilePlus2,
  LayoutDashboard,
  Mail,
  Megaphone,
  PanelsTopLeft,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

const groups = [
  {
    label: "Quản lý quảng cáo",
    items: [
      ["Dashboard", "/facebook-ads/manager", LayoutDashboard],
      ["Tạo chiến dịch", "/facebook-ads/create", FilePlus2],
      ["Bản nháp", "/facebook-ads/drafts", FileClock],
      ["Báo cáo", "/facebook-ads/reports", BarChart3],
    ] as const,
  },
  {
    label: "Tài sản Meta",
    items: [
      ["Tài khoản quảng cáo", "/facebook-ads/tai-khoan-qc", Megaphone],
      ["Business Manager", "/facebook-ads/tai-khoan-bm", Building2],
      ["Fanpage", "/facebook-ads/fanpage", PanelsTopLeft],
    ] as const,
  },
  {
    label: "Tự động hóa",
    items: [
      ["Quy tắc & lịch", "/facebook-ads/rules", Workflow],
      ["Phân quyền", "/facebook-ads/permissions", Users],
      ["Kiểm tra chính sách", "/facebook-ads/policy", ShieldCheck],
      ["Trợ lý & hỗ trợ", "/facebook-ads/support", Bot],
    ] as const,
  },
  {
    label: "Tiện ích",
    items: [
      ["Bộ công cụ", "/facebook-ads/tools", Wrench],
      ["Email tạm thời", "/facebook-ads/email-tam-thoi", Mail],
      ["Hướng dẫn", "/facebook-ads/guide", BookOpen],
      ["Cài đặt", "/facebook-ads/cai-dat", Settings],
    ] as const,
  },
];

export default function AdsMetaNavigationDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname?: string;
}) {
  const routePathname = usePathname();
  const activePathname = pathname ?? routePathname;
  return (
    <div className={`adsmeta-drawer-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button type="button" aria-label="Đóng menu" className="adsmeta-drawer-backdrop" onClick={onClose} />
      <aside className="adsmeta-drawer">
        <div className="adsmeta-drawer-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/facebook-ads/adsmeta-logo.svg" alt="AdsMeta.io" />
          <button type="button" onClick={onClose} className="adsmeta-drawer-close"><X size={17} /></button>
        </div>
        <nav className="adsmeta-drawer-nav">
          {groups.map((group) => (
            <section key={group.label}>
              <p>{group.label}</p>
              <div>
                {group.items.map(([label, href, Icon]) => {
                  const active = activePathname === href || (href !== "/facebook-ads/manager" && activePathname.startsWith(`${href}/`));
                  return (
                    <Link key={href} href={href} onClick={onClose} className={active ? "is-active" : ""}>
                      <Icon size={16} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
    </div>
  );
}
