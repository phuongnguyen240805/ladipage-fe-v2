"use client";

import { useState } from "react";
import { AlarmClock, Pencil, Plus, ShieldCheck, Workflow } from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";

type MockRule = { id: string; name: string; condition: string; action: string; schedule: string; active: boolean };

const initialRules: MockRule[] = [
  { id: "r1", name: "Tạm dừng khi CPA cao", condition: "CPA > 75.000 ₫ và spend > 500.000 ₫", action: "Tạm dừng ad set", schedule: "Mỗi 30 phút", active: true },
  { id: "r2", name: "Tăng ngân sách nhóm thắng", condition: "ROAS > 4,0 trong 3 ngày", action: "Tăng ngân sách 15%", schedule: "Hàng ngày, 08:00", active: true },
  { id: "r3", name: "Cảnh báo creative fatigue", condition: "Tần suất > 3,5 và CTR giảm 20%", action: "Gửi thông báo", schedule: "Mỗi 6 giờ", active: false },
];

export default function AdsRulesPage() {
  const [rules, setRules] = useState(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("Quy tắc hiệu suất mới");

  const openCreate = () => {
    setEditingId(null);
    setName("Quy tắc hiệu suất mới");
    setModalOpen(true);
  };

  const openEdit = (rule: MockRule) => {
    setEditingId(rule.id);
    setName(rule.name);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setRules((current) => current.map((rule) => rule.id === editingId ? { ...rule, name } : rule));
    } else {
      setRules((current) => [{ id: `rule-${Date.now()}`, name, condition: "ROAS < 1,5 sau 3 ngày", action: "Gửi thông báo", schedule: "Mỗi giờ", active: false }, ...current]);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-xl font-semibold tracking-tight">Quy tắc tự động</h1><p className="mt-1 text-xs text-muted-foreground">Mô phỏng điều kiện, hành động, lịch chạy và xác nhận an toàn.</p></div>
          <AdsButton variant="primary" startIcon={<Plus size={15} />} onClick={openCreate}>Tạo quy tắc</AdsButton>
        </header>
        <div className="mt-5"><MockNotice /></div>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {[["Quy tắc hoạt động", String(rules.filter((rule) => rule.active).length), Workflow], ["Đã chạy hôm nay", "128", AlarmClock], ["Thay đổi được bảo vệ", "100%", ShieldCheck]].map(([label, value, icon]) => {
            const Icon = icon as typeof Workflow;
            return <article key={label as string} className="rounded-xl border border-border bg-card p-4 shadow-theme-xs"><div className="flex items-center justify-between"><p className="text-[11px] text-muted-foreground">{label as string}</p><Icon size={16} className="text-primary" /></div><p className="mt-3 text-xl font-semibold">{value as string}</p></article>;
          })}
        </section>

        <section className="mt-4 space-y-3">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-xl border border-border bg-card p-4 shadow-theme-xs">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <button type="button" role="switch" aria-checked={rule.active} onClick={() => setRules((current) => current.map((item) => item.id === rule.id ? { ...item, active: !item.active } : item))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${rule.active ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${rule.active ? "left-6" : "left-1"}`} /></button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h2 className="truncate text-sm font-semibold">{rule.name}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] ${rule.active ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300" : "bg-muted text-muted-foreground"}`}>{rule.active ? "Đang bật" : "Tạm tắt"}</span></div>
                  <div className="mt-2 grid gap-2 text-[11px] text-muted-foreground md:grid-cols-3"><p><span className="font-medium text-foreground">Nếu:</span> {rule.condition}</p><p><span className="font-medium text-foreground">Thì:</span> {rule.action}</p><p><span className="font-medium text-foreground">Lịch:</span> {rule.schedule}</p></div>
                </div>
                <AdsButton size="sm" startIcon={<Pencil size={14} />} onClick={() => openEdit(rule)}>Chỉnh sửa</AdsButton>
              </div>
            </article>
          ))}
        </section>
      </div>

      <AdsModal open={modalOpen} title={editingId ? "Chỉnh sửa quy tắc" : "Tạo quy tắc"} description="Mọi thay đổi hiện chỉ áp dụng vào dữ liệu mock trong phiên." onClose={() => setModalOpen(false)} footer={<><AdsButton variant="ghost" onClick={() => setModalOpen(false)}>Hủy</AdsButton><AdsButton variant="primary" onClick={handleSave}>Lưu quy tắc mock</AdsButton></>}>
        <div className="grid gap-4">
          <label><span className="mb-1.5 block text-xs font-medium">Tên quy tắc</span><input value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-xs font-medium">Chỉ số</span><select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option>ROAS</option><option>CPA</option><option>Chi tiêu</option><option>Tần suất</option></select></label>
            <label><span className="mb-1.5 block text-xs font-medium">Điều kiện</span><div className="flex gap-2"><select className="h-10 w-24 rounded-lg border border-border bg-background px-3 text-sm"><option>&lt;</option><option>&gt;</option></select><input type="number" defaultValue="1.5" className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm" /></div></label>
            <label><span className="mb-1.5 block text-xs font-medium">Hành động</span><select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option>Gửi thông báo</option><option>Tạm dừng</option><option>Tăng ngân sách 15%</option></select></label>
            <label><span className="mb-1.5 block text-xs font-medium">Tần suất</span><select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"><option>Mỗi giờ</option><option>Mỗi 6 giờ</option><option>Hàng ngày</option></select></label>
          </div>
        </div>
      </AdsModal>
    </div>
  );
}
