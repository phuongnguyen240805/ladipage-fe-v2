"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Play,
  RefreshCw,
  Settings2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";
import { getAdsTool } from "../tool-catalog";

const bars = [42, 66, 54, 78, 62, 88, 74, 92, 71, 82, 96, 86];

export default function ToolPreviewPage({ slug }: { slug: string }) {
  const tool = getAdsTool(slug);
  const [running, setRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastRun, setLastRun] = useState("10:42 hôm nay");

  const sampleMetrics = useMemo(
    () => [
      { label: "Đang theo dõi", value: tool?.category === "Tracking" ? "14 sự kiện" : "24 chiến dịch", change: "+3 kỳ này" },
      { label: "Cần chú ý", value: "6", change: "2 mức ưu tiên cao" },
      { label: "Cơ hội ước tính", value: "12,8%", change: "Dựa trên dữ liệu mock" },
      { label: "Lần chạy cuối", value: lastRun, change: "Phạm vi 30 ngày" },
    ],
    [lastRun, tool?.category],
  );

  if (!tool) {
    return (
      <div className="p-8 text-foreground">
        <h1 className="text-lg font-semibold">Không tìm thấy công cụ</h1>
        <Link href="/facebook-ads/tools" className="mt-3 inline-block text-sm text-primary hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const Icon = tool.icon;
  const handleRun = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setLastRun("Vừa xong");
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/facebook-ads/tools"
              aria-label="Quay lại bộ công cụ"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={17} />
            </Link>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{tool.category}</p>
              <h1 className="truncate text-xl font-semibold tracking-tight">{tool.name}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdsButton startIcon={<CalendarDays size={15} />}>
              30 ngày qua <ChevronDown size={13} />
            </AdsButton>
            <AdsButton startIcon={<Settings2 size={15} />} onClick={() => setSettingsOpen(true)}>
              Cấu hình
            </AdsButton>
            <AdsButton
              variant="primary"
              startIcon={
                running ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />
              }
              disabled={running}
              onClick={handleRun}
            >
              {running ? "Đang phân tích" : "Chạy phân tích"}
            </AdsButton>
          </div>
        </header>

        <div className="mt-5">
          <MockNotice />
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sampleMetrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-border bg-card p-4 shadow-theme-xs">
              <p className="text-[11px] text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{metric.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{metric.change}</p>
            </article>
          ))}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Xu hướng hiệu suất</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Mô phỏng 12 chu kỳ gần nhất</p>
              </div>
              <AdsButton size="sm" startIcon={<Download size={14} />}>Xuất</AdsButton>
            </div>
            <div className="mt-7 flex h-60 items-end gap-2 border-b border-border px-2">
              {bars.map((bar, index) => (
                <div key={`${bar}-${index}`} className="group flex h-full flex-1 items-end">
                  <div
                    style={{ height: `${bar}%` }}
                    className="w-full rounded-t-md bg-primary/20 transition group-hover:bg-primary/70"
                    title={`Chu kỳ ${index + 1}: ${bar}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Chu kỳ 1</span><span>Chu kỳ 6</span><span>Chu kỳ 12</span>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-warning-500" />
              <h2 className="text-sm font-semibold">Đề xuất ưu tiên</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { icon: TriangleAlert, title: "Kiểm tra 2 chiến dịch", text: "CPA tăng hơn 18% so với trung bình 7 ngày.", tone: "text-warning-600 bg-warning-50 dark:bg-warning-500/10" },
                { icon: CheckCircle2, title: "Cơ hội mở rộng", text: "3 nhóm có ROAS ổn định và còn dư ngân sách.", tone: "text-success-600 bg-success-50 dark:bg-success-500/10" },
                { icon: Sparkles, title: "Làm mới creative", text: "Tần suất của 4 quảng cáo đã vượt ngưỡng mô phỏng.", tone: "text-purple-600 bg-purple-50 dark:bg-purple-500/10" },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <article key={item.title} className="rounded-xl border border-border p-3">
                    <div className="flex gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                        <ItemIcon size={15} />
                      </span>
                      <div>
                        <h3 className="text-xs font-semibold">{item.title}</h3>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <AdsModal
        open={settingsOpen}
        title={`Cấu hình ${tool.name}`}
        description="Các tùy chọn chỉ thay đổi bản xem trước trong phiên hiện tại."
        onClose={() => setSettingsOpen(false)}
        footer={
          <>
            <AdsButton variant="ghost" onClick={() => setSettingsOpen(false)}>Hủy</AdsButton>
            <AdsButton variant="primary" onClick={() => setSettingsOpen(false)}>Lưu cấu hình mock</AdsButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-medium">Tài khoản</span>
            <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
              <option>LadiPage — Tăng trưởng Việt Nam</option>
              <option>Ecom Store — Retargeting</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium">Ngưỡng cảnh báo</span>
            <input type="number" defaultValue="15" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium">Phạm vi chiến dịch</span>
            <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
              <option>Tất cả chiến dịch đang hoạt động</option>
              <option>Chỉ chiến dịch đã chọn</option>
            </select>
          </label>
        </div>
      </AdsModal>
    </div>
  );
}
