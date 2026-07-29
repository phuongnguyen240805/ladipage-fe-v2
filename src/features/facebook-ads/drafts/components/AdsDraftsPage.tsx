"use client";

import Link from "next/link";
import { Clock3, Copy, FileClock, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";

const initialDrafts = [
  { id: "d1", name: "LDP | Lead Form | Broad | Tháng 08", level: "Chiến dịch hoàn chỉnh", owner: "Bạn", updated: "12 phút trước" },
  { id: "d2", name: "Ecom | Retarget | Dynamic catalog", level: "Thiếu nội dung quảng cáo", owner: "Trang", updated: "Hôm qua" },
  { id: "d3", name: "Academy | Webinar | Lookalike", level: "Thiếu lịch chạy", owner: "Minh", updated: "3 ngày trước" },
];

export default function AdsDraftsPage() {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-xl font-semibold tracking-tight">Bản nháp chiến dịch</h1><p className="mt-1 text-xs text-muted-foreground">Tiếp tục cấu hình, nhân bản hoặc dọn các bản nháp mock.</p></div>
          <Link href="/facebook-ads/create" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><Plus size={16} />Tạo chiến dịch</Link>
        </header>
        <div className="mt-5"><MockNotice /></div>
        <section className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-theme-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="h-10 bg-muted/60 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-4">Bản nháp</th><th className="px-4">Mức hoàn thiện</th><th className="px-4">Người sửa</th><th className="px-4">Cập nhật</th><th className="px-4 text-right">Thao tác</th></tr></thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="h-16 border-t border-border/70 hover:bg-muted/30">
                    <td className="px-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary"><FileClock size={16} /></span><span className="font-semibold">{draft.name}</span></div></td>
                    <td className="px-4 text-muted-foreground">{draft.level}</td><td className="px-4">{draft.owner}</td>
                    <td className="px-4 text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{draft.updated}</span></td>
                    <td className="px-4"><div className="flex justify-end gap-1"><AdsButton size="sm" startIcon={<Copy size={13} />}>Nhân bản</AdsButton><Link href="/facebook-ads/create" className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted">Tiếp tục</Link><button type="button" aria-label={`Xóa ${draft.name}`} onClick={() => setDeleteId(draft.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"><Trash2 size={15} /></button><button type="button" aria-label="Thêm thao tác" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><MoreHorizontal size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {drafts.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Chưa có bản nháp.</div>}
        </section>
      </div>

      <AdsModal open={Boolean(deleteId)} title="Xóa bản nháp?" description="Thao tác chỉ xóa dữ liệu mock trong phiên hiện tại." size="sm" onClose={() => setDeleteId(null)} footer={<><AdsButton variant="ghost" onClick={() => setDeleteId(null)}>Hủy</AdsButton><AdsButton variant="danger" onClick={() => { setDrafts((current) => current.filter((item) => item.id !== deleteId)); setDeleteId(null); }}>Xóa bản nháp</AdsButton></>}>
        <MockNotice />
      </AdsModal>
    </div>
  );
}
