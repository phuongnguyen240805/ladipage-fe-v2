"use client";

import type { CustomerCareConversation } from "@liora/api-types";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  BadgeCheck,
  Building2,
  CalendarClock,
  ExternalLink,
  Flag,
  Mail,
  MapPin,
  NotebookPen,
  PackageOpen,
  Phone,
  Plus,
  RefreshCw,
  Tag,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";

export function CustomerDetailPanel({ conversation, open, onClose }: {
  conversation: CustomerCareConversation | null;
  open: boolean;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [routingBusy, setRoutingBusy] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const contactId = conversation?.customer.id;
  const nativeContact = Boolean(contactId && /^\d+$/.test(contactId));

  useEffect(() => setNote(conversation?.customer.note ?? ""), [conversation?.id, conversation?.customer.note]);

  const previousQuery = useQuery({
    queryKey: ["customer-care", "contact", contactId, "conversations"],
    enabled: Boolean(nativeContact),
    queryFn: () => customerCareApi.contactConversations(contactId!),
  });
  const ordersQuery = useQuery({
    queryKey: ["customer-care", "contact", contactId, "orders"],
    enabled: Boolean(nativeContact),
    queryFn: () => customerCareApi.contactOrders(contactId!),
  });
  const agentsQuery = useQuery({
    queryKey: ["customer-care", "agents"],
    enabled: open,
    queryFn: () => customerCareApi.agents(),
    staleTime: 5 * 60_000,
  });
  const teamsQuery = useQuery({
    queryKey: ["customer-care", "teams"],
    enabled: open,
    queryFn: () => customerCareApi.teams(),
    staleTime: 5 * 60_000,
  });
  const tagsQuery = useQuery({
    queryKey: ["customer-care", "tags"],
    enabled: open,
    queryFn: () => customerCareApi.tags(),
    staleTime: 5 * 60_000,
  });

  if (!open || !conversation) return null;
  const customer = conversation.customer;

  const saveNote = async () => {
    if (!nativeContact) return;
    setSaving(true);
    try {
      await customerCareApi.updateContact(contactId!, { note });
      await queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
    } finally {
      setSaving(false);
    }
  };

  const runRoutingAction = async (action: () => Promise<unknown>) => {
    setRoutingBusy(true);
    setRoutingError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ["customer-care", "conversations"] });
    } catch (error) {
      setRoutingError(error instanceof Error ? error.message : "Không thể cập nhật hội thoại.");
    } finally {
      setRoutingBusy(false);
    }
  };

  const toggleConversationTag = async (tagId: string) => {
    const selected = conversation.tags.some((tag) => tag.id === tagId);
    const providerTag = tagsQuery.data?.find((tag) => tag.id === tagId);
    await runRoutingAction(() =>
      customerCareApi.setTags(
        conversation.id,
        [providerTag?.name ?? tagId],
        selected ? "remove" : "add"
      )
    );
  };

  return (
    <aside className="custom-scrollbar hidden h-full w-[350px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c] xl:block 2xl:w-[390px]">
      <div className="sticky top-0 z-10 flex h-[58px] items-center border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#11151c]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thông tin khách hàng</h3>
        <button type="button" onClick={onClose} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white" title="Đóng"><X className="h-4 w-4" /></button>
      </div>

      <section className="border-b border-slate-100 p-5 text-center dark:border-white/[0.07]">
        <Avatar name={customer.name} src={customer.avatar} />
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{customer.name}</h4>
          <BadgeCheck className="h-4 w-4 text-[#0866ff]" />
        </div>
        <div className="mt-1 text-xs text-slate-500">{conversation.channelName ?? "Zalo cá nhân"}</div>
        <div className="mt-3 flex justify-center gap-2">
          <StatusPill label={conversation.status === "unread" ? "Chưa đọc" : conversation.status === "resolved" ? "Đã xử lý" : conversation.status === "pending" ? "Chờ xử lý" : "Đang mở"} />
          <StatusPill label={conversation.assignee?.name ?? "Chưa phân công"} muted={!conversation.assignee} />
        </div>
      </section>

      <section className="border-b border-slate-100 p-4 dark:border-white/[0.07]">
        <SectionTitle icon={<UsersRound className="h-4 w-4" />} title="Phân công & xử lý" />
        <div className="mt-3 space-y-3">
          <ControlField label="Nhân viên">
            <select
              value={conversation.assignee?.id ?? ""}
              disabled={routingBusy || agentsQuery.isLoading}
              onChange={(event) => void runRoutingAction(() => customerCareApi.assign(conversation.id, event.target.value ? Number(event.target.value) : null))}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 outline-none focus:border-lime-400 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="">Chưa phân công</option>
              {(agentsQuery.data ?? []).map((agent) => (
                <option key={agent.id} value={agent.id}>{`${agent.first_name ?? ""} ${agent.last_name ?? ""}`.trim() || `Nhân viên #${agent.id}`}</option>
              ))}
            </select>
          </ControlField>
          <ControlField label="Team" icon={<Building2 className="h-3.5 w-3.5" />}>
            <select
              value={conversation.teamId ?? ""}
              disabled={routingBusy || teamsQuery.isLoading}
              onChange={(event) => void runRoutingAction(() => customerCareApi.setTeam(conversation.id, event.target.value ? Number(event.target.value) : null))}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 outline-none focus:border-lime-400 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="">Chưa gán team</option>
              {(teamsQuery.data ?? []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </ControlField>
          <ControlField label="Trạng thái">
            <select
              value={conversation.status === "unread" ? "open" : conversation.status}
              disabled={routingBusy}
              onChange={(event) => void runRoutingAction(() => customerCareApi.updateConversation(conversation.id, { status: event.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 outline-none focus:border-lime-400 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="open">Đang mở</option>
              <option value="pending">Chờ xử lý</option>
              <option value="resolved">Đã xử lý</option>
            </select>
          </ControlField>
          <ControlField label="Ưu tiên" icon={<Flag className="h-3.5 w-3.5" />}>
            <select
              value={conversation.priority ?? "normal"}
              disabled={routingBusy}
              onChange={(event) => void runRoutingAction(() => customerCareApi.updateConversation(conversation.id, { priority: event.target.value }))}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 outline-none focus:border-lime-400 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </ControlField>
          {routingError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{routingError}</div> : null}
        </div>
      </section>

      <section className="border-b border-slate-100 p-4 dark:border-white/[0.07]">
        <SectionTitle icon={<UserRound className="h-4 w-4" />} title="Hồ sơ liên hệ" />
        <div className="mt-3 space-y-2">
          <InfoRow icon={<AtSign className="h-4 w-4" />} label="Zalo ID" value={customer.externalId ?? "Chưa có"} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Điện thoại" value={customer.phone ?? "Chưa cập nhật"} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={customer.email ?? "Chưa cập nhật"} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Địa chỉ" value={customer.location ?? "Chưa cập nhật"} />
        </div>
      </section>

      <section className="border-b border-slate-100 p-4 dark:border-white/[0.07]">
        <SectionTitle icon={<NotebookPen className="h-4 w-4" />} title="Ghi chú nội bộ" />
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Thông tin cần nhớ về khách hàng..." className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 outline-none focus:border-lime-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200" />
        <button type="button" disabled={!nativeContact || saving} onClick={() => void saveNote()} className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 dark:bg-lime-500 dark:text-slate-950 dark:hover:bg-lime-400">
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null} Lưu ghi chú
        </button>
      </section>

      <section className="border-b border-slate-100 p-4 dark:border-white/[0.07]">
        <SectionTitle icon={<Tag className="h-4 w-4" />} title="Nhãn hội thoại" />
        <div className="mt-3 flex flex-wrap gap-2">
          {(tagsQuery.data ?? []).length ? (tagsQuery.data ?? []).map((tag) => {
            const selected = conversation.tags.some((current) => current.id === tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                disabled={routingBusy}
                onClick={() => void toggleConversationTag(tag.id)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${selected ? "text-white" : "border-slate-200 bg-white text-slate-500 hover:border-lime-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}
                style={selected ? { backgroundColor: tag.color, borderColor: tag.color } : undefined}
              >
                {tag.name}
              </button>
            );
          }) : <span className="text-xs text-slate-400">Chưa cấu hình nhãn</span>}
        </div>
      </section>

      <section className="border-b border-slate-100 p-4 dark:border-white/[0.07]">
        <SectionTitle icon={<CalendarClock className="h-4 w-4" />} title="Hội thoại liên quan" action={<button type="button" onClick={() => void previousQuery.refetch()} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-lime-600 dark:hover:bg-white/5"><RefreshCw className="h-3.5 w-3.5" /></button>} />
        <div className="mt-3 space-y-2">
          {previousQuery.data?.length ? previousQuery.data.slice(0, 5).map((item) => (
            <a key={item.id} href={`/cskh/hoi-thoai?conversationId=${item.id}`} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 text-xs hover:border-lime-300 hover:bg-lime-50/50 dark:border-white/[0.07] dark:hover:bg-lime-500/5">
              <div className="min-w-0 flex-1"><div className="truncate font-semibold text-slate-700 dark:text-slate-200">{item.lastMessage}</div><div className="mt-0.5 text-[10px] text-slate-400">{new Date(item.lastMessageAt).toLocaleString("vi-VN")}</div></div><ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>
          )) : <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10">Chưa có hội thoại trước đó</div>}
        </div>
      </section>

      <section className="p-4">
        <SectionTitle icon={<PackageOpen className="h-4 w-4" />} title="Đơn hàng" />
        <div className="mt-3 rounded-2xl border border-dashed border-slate-200 p-5 text-center dark:border-white/10">
          <PackageOpen className="mx-auto h-8 w-8 text-slate-300" />
          <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {(ordersQuery.data as { items?: unknown[] } | undefined)?.items?.length ? "Đã liên kết đơn hàng" : "Chưa có lịch sử đơn hàng"}
          </div>
          <div className="mt-1 text-[10px] leading-4 text-slate-400">Liên kết Zalo với khách hàng CRM để xem đơn hàng và tổng chi tiêu.</div>
          <button type="button" disabled className="mt-3 inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-400 opacity-70 dark:border-white/10"><Plus className="h-3.5 w-3.5" /> Tạo đơn sau khi liên kết CRM</button>
        </div>
      </section>
    </aside>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) return <img src={src} alt={name} className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-white/5" />;
  const parts = name.trim().split(/\s+/);
  const label = `${parts[0]?.[0] || "K"}${parts.length > 1 ? parts.at(-1)?.[0] || "" : ""}`.toUpperCase();
  return <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-xl font-bold text-white ring-4 ring-slate-100 dark:ring-white/5">{label}</div>;
}

function ControlField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <label className="grid grid-cols-[86px_1fr] items-center gap-2"><span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">{icon}{label}</span>{children}</label>;
}
function StatusPill({ label, muted = false }: { label: string; muted?: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${muted ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>{label}</span>;
}
function SectionTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{icon}<span>{title}</span><div className="ml-auto">{action}</div></div>;
}
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-lg px-1 py-1.5"><span className="text-slate-400">{icon}</span><span className="w-20 shrink-0 text-[11px] text-slate-400">{label}</span><span className="min-w-0 flex-1 truncate text-right text-xs font-medium text-slate-700 dark:text-slate-200" title={value}>{value}</span></div>;
}
