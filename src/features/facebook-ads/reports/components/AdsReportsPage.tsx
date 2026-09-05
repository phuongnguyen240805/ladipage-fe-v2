"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  CalendarDays,
  FileChartColumn,
  LineChart,
  Plus,
  Share2,
} from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";

const savedReports = [
  { id: "weekly", name: "Báo cáo tuần · Performance", schedule: "Thứ Hai, 08:00", owner: "Bạn", updated: "2 giờ trước" },
  { id: "creative", name: "Creative winners", schedule: "Thứ Sáu, 16:30", owner: "Marketing", updated: "Hôm qua" },
  { id: "budget", name: "Theo dõi ngân sách tháng", schedule: "Ngày 1 hàng tháng", owner: "Finance", updated: "3 ngày trước" },
];

export default function AdsReportsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportName, setReportName] = useState("Báo cáo hiệu suất mới");
  const [reports, setReports] = useState(savedReports);

  const handleCreate = () => {
    setReports((current) => [
      {
        id: `report-${Date.now()}`,
        name: reportName.trim() || "Báo cáo chưa đặt tên",
        schedule: "Chưa lập lịch",
        owner: "Bạn",
        updated: "Vừa xong",
      },
      ...current,
    ]);
    setCreateOpen(false);
  };

  const handleExport = () => {
    const csv = "\uFEFFTên báo cáo,Lịch gửi,Chủ sở hữu,Cập nhật\n" +
      reports.map((item) => `"${item.name}","${item.schedule}","${item.owner}","${item.updated}"`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "facebook-ads-reports.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Báo cáo quảng cáo</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Tạo dashboard, lưu góc nhìn và mô phỏng lịch gửi báo cáo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdsButton startIcon={<CalendarDays size={15} />}>01/07 – 29/07/2026</AdsButton>
            <AdsButton startIcon={<ArrowDownToLine size={15} />} onClick={handleExport}>Xuất CSV</AdsButton>
            <AdsButton variant="primary" startIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
              Tạo báo cáo
            </AdsButton>
          </div>
        </header>

        <div className="mt-5"><MockNotice /></div>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Tổng chi tiêu", "18.640.000 ₫", "+8,4%", BarChart3],
            ["Kết quả", "486", "+12,1%", FileChartColumn],
            ["CPA trung bình", "38.354 ₫", "−3,7%", LineChart],
            ["ROAS", "3,83x", "+0,42x", BarChart3],
          ].map(([label, value, change, icon]) => {
            const Icon = icon as typeof BarChart3;
            return (
              <article key={label as string} className="rounded-xl border border-border bg-card p-4 shadow-theme-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">{label as string}</p>
                  <Icon size={15} className="text-primary" />
                </div>
                <p className="mt-3 text-xl font-semibold">{value as string}</p>
                <p className="mt-1 text-[10px] text-success-600 dark:text-success-400">{change as string} so với kỳ trước</p>
              </article>
            );
          })}
        </section>

        <section className="mt-4 rounded-xl border border-border bg-card shadow-theme-xs">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Báo cáo đã lưu</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">{reports.length} cấu hình báo cáo trong workspace</p>
            </div>
            <AdsButton size="sm" startIcon={<Share2 size={14} />} onClick={() => setShareOpen(true)}>Chia sẻ</AdsButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="h-10 bg-muted/60 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4">Tên báo cáo</th><th className="px-4">Lịch gửi</th><th className="px-4">Chủ sở hữu</th><th className="px-4">Cập nhật</th><th className="px-4 text-right">Trạng thái</th></tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="h-14 border-t border-border/70 hover:bg-muted/30">
                    <td className="px-4 font-semibold">{report.name}</td>
                    <td className="px-4 text-muted-foreground">{report.schedule}</td>
                    <td className="px-4">{report.owner}</td>
                    <td className="px-4 text-muted-foreground">{report.updated}</td>
                    <td className="px-4 text-right"><span className="ladi-status-badge inline-flex items-center rounded-full bg-success-50 px-2 py-1 text-success-700 dark:bg-success-500/10 dark:text-success-300">Sẵn sàng</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AdsModal open={createOpen} title="Tạo báo cáo" description="Lưu cấu hình mock để kiểm tra danh sách và luồng thao tác." onClose={() => setCreateOpen(false)} footer={<><AdsButton variant="ghost" onClick={() => setCreateOpen(false)}>Hủy</AdsButton><AdsButton variant="primary" onClick={handleCreate}>Tạo báo cáo mock</AdsButton></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium">Tên báo cáo</span><input value={reportName} onChange={(event) => setReportName(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
          <label><span className="mb-1.5 block text-xs font-medium">Mẫu</span><select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option>Hiệu suất tổng quan</option><option>Creative</option><option>Ngân sách</option></select></label>
          <label><span className="mb-1.5 block text-xs font-medium">Lịch gửi</span><select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option>Không lập lịch</option><option>Hàng tuần</option><option>Hàng tháng</option></select></label>
        </div>
      </AdsModal>

      <AdsModal open={shareOpen} title="Chia sẻ báo cáo" description="Mô phỏng quyền truy cập nội bộ, chưa gửi email thật." size="sm" onClose={() => setShareOpen(false)} footer={<AdsButton variant="primary" onClick={() => setShareOpen(false)}>Lưu quyền mock</AdsButton>}>
        <MockNotice />
        <label className="mt-4 block"><span className="mb-1.5 block text-xs font-medium">Email thành viên</span><input placeholder="marketing@company.vn" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
      </AdsModal>
    </div>
  );
}
