"use client";

import type { CustomerCareSettings as CustomerCareSettingsType } from "@liora/api-types";
import {
  AlertCircle,
  AtSign,
  Bell,
  Bot,
  BriefcaseBusiness,
  CakeSlice,
  Check,
  CheckCheck,
  CircleDollarSign,
  Cloud,
  Code2,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Flag,
  FolderSync,
  Globe2,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Link2,
  ListFilter,
  MessageCircleMore,
  MessageSquareReply,
  Monitor,
  PackageOpen,
  Palette,
  PanelTop,
  PhoneCall,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  UserCheck,
  UserRoundCog,
  UsersRound,
  WandSparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCustomerCareSettings, useUpdateCustomerCareSettings } from "@/features/customer-care/hooks/useCustomerCare";
import { ecomApi, type ShippingIntegration, type ShippingProvider } from "@/lib/endpoints/ecom.api";
import { customerCareApi, type CustomerCareAiConfig } from "@/lib/endpoints/customer-care.api";
import { conversationTags, settingHistoryItems, workingDayLabels } from "./data";
import {
  DetailConfigItem,
  SettingsButton,
  SettingsCard,
  SettingsEmptyState,
  SettingsModal,
  SettingsSelect,
  SettingsToggle,
} from "./SettingsPrimitives";

const selectOptions = {
  sound: [
    { label: "Mặc định", value: "default" },
    { label: "Tin nhắn mới", value: "message" },
    { label: "Không âm thanh", value: "silent" },
  ],
  unread: [
    { label: "Tắt", value: "off" },
    { label: "Bật", value: "on" },
  ],
  task: [
    { label: "Tắt", value: "off" },
    { label: "Hoàn thành / Mở lại", value: "complete" },
  ],
  images: [
    { label: "Gửi nhóm ảnh", value: "group" },
    { label: "Gửi từng ảnh", value: "separate" },
  ],
};

function SubSettingRow({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="flex min-h-10 items-center justify-between gap-4 py-2 text-sm text-slate-600 dark:text-slate-300"><span>{children}</span>{action}</div>;
}

export function GeneralSetting() {
  const settingQuery = useCustomerCareSettings();
  const updateSetting = useUpdateCustomerCareSettings();
  const [generalSettingDraft, setGeneralSettingDraft] = useState<CustomerCareSettingsType | null>(null);
  const [soundPreset, setSoundPreset] = useState("default");
  const [jumpMode, setJumpMode] = useState("off");
  const [taskMode, setTaskMode] = useState("off");
  const [imageMode, setImageMode] = useState("group");
  const [ignoreFriendTag, setIgnoreFriendTag] = useState(false);
  const [saveBirthday, setSaveBirthday] = useState(false);
  const [mainPlatform, setMainPlatform] = useState("ladisales");
  const [country, setCountry] = useState("vn");
  const [botNotification, setBotNotification] = useState(true);
  const [syncCustomerTag, setSyncCustomerTag] = useState(false);

  useEffect(() => {
    if (settingQuery.data) setGeneralSettingDraft(structuredClone(settingQuery.data));
  }, [settingQuery.data]);

  const isDirty = useMemo(() => {
    if (!generalSettingDraft || !settingQuery.data) return false;
    return JSON.stringify(generalSettingDraft) !== JSON.stringify(settingQuery.data);
  }, [generalSettingDraft, settingQuery.data]);

  if (!generalSettingDraft) {
    return <div className="h-80 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.04]" />;
  }

  const patchGeneralSetting = (value: Partial<CustomerCareSettingsType>) => {
    setGeneralSettingDraft((current) => current ? { ...current, ...value } : current);
  };

  const saveGeneralSetting = async () => {
    await updateSetting.mutateAsync(generalSettingDraft);
    toast.success("Đã lưu cài đặt chung");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Cài đặt chung</h1>
        {isDirty && <SettingsButton onClick={() => void saveGeneralSetting()} disabled={updateSetting.isPending}><Save className="h-4 w-4" />{updateSetting.isPending ? "Đang lưu" : "Lưu thay đổi"}</SettingsButton>}
      </div>

      <SettingsCard title="Thông báo và hội thoại">
        <DetailConfigItem
          icon={<Bell />}
          title="Âm thanh và thông báo"
          description="Thiết lập thông báo khi có tin nhắn mới hoặc bình luận mới."
          subRows={<SubSettingRow action={<SettingsSelect value={soundPreset} options={selectOptions.sound} onChange={setSoundPreset} />}>Phát âm thanh khi có hội thoại mới</SubSettingRow>}
        >
          <SettingsToggle checked={generalSettingDraft.browserNotifications} onChange={(value) => patchGeneralSetting({ browserNotifications: value })} />
        </DetailConfigItem>
        <DetailConfigItem
          icon={<UserCheck />}
          title="Hội thoại"
          description="Đẩy những hội thoại chưa đọc lên đầu danh sách hội thoại."
          subRows={<SubSettingRow action={<SettingsSelect value={jumpMode} options={selectOptions.unread} onChange={(value) => { setJumpMode(value); patchGeneralSetting({ jumpToUnread: value === "on" }); }} />}>Chuyển nhanh sang tin nhắn chưa đọc kế tiếp trong danh sách</SubSettingRow>}
        >
          <SettingsToggle checked={generalSettingDraft.prioritizeUnread} onChange={(value) => patchGeneralSetting({ prioritizeUnread: value })} />
        </DetailConfigItem>
        <DetailConfigItem
          icon={<Inbox />}
          title="Tác vụ trong hội thoại"
          description="Sử dụng tính năng Hoàn thành tác vụ / Mở lại tác vụ trong các hội thoại."
        >
          <SettingsSelect value={taskMode} options={selectOptions.task} onChange={(value) => { setTaskMode(value); patchGeneralSetting({ conversationTasks: value !== "off" }); }} />
        </DetailConfigItem>
        <DetailConfigItem
          icon={<ImageIcon />}
          title="Cách gửi tin nhắn chứa nhiều ảnh"
          description="Gộp các ảnh thành một nhóm rồi gửi tới người nhận."
          last
        >
          <SettingsSelect value={imageMode} options={selectOptions.images} onChange={(value) => { setImageMode(value); patchGeneralSetting({ groupImages: value === "group" }); }} />
        </DetailConfigItem>
      </SettingsCard>

      <SettingsCard title="Tính năng tự động">
        <DetailConfigItem icon={<AtSign />} title="Tự động bỏ qua bình luận tag bạn bè" description="Bỏ qua tin nhắn nếu tin nhắn mới là bình luận khách hàng tag bạn bè.">
          <SettingsToggle checked={ignoreFriendTag} onChange={setIgnoreFriendTag} />
        </DetailConfigItem>
        <DetailConfigItem icon={<CheckCheck />} title="Tự động bỏ qua tin nhắn mới là sticker" description="Giữ nguyên trạng thái xem của hội thoại và không dùng hội thoại đó để xoay vòng.">
          <SettingsToggle checked={generalSettingDraft.ignoreSticker} onChange={(value) => patchGeneralSetting({ ignoreSticker: value })} />
        </DetailConfigItem>
        <DetailConfigItem icon={<CakeSlice />} title="Tự động lưu ngày sinh" description="Phát hiện và lưu ngày sinh của khách hàng gửi tin nhắn đến." last>
          <SettingsToggle checked={saveBirthday} onChange={setSaveBirthday} />
        </DetailConfigItem>
      </SettingsCard>

      <SettingsCard title="Đồng bộ hệ sinh thái">
        <DetailConfigItem
          icon={<Workflow />}
          title="Nền tảng vận hành chính"
          description={<>Sử dụng LadiSales nếu bạn thiên về quản lý sản phẩm, đơn hàng, kho bãi. Sử dụng CRM nếu bạn kinh doanh dịch vụ hoặc cần quản lý pipeline khách hàng.</>}
          subRows={<SubSettingRow action={<div className="flex items-center gap-2"><button type="button" className="font-semibold text-lime-600 dark:text-lime-400">Thay đổi</button><SettingsSelect value={country} options={[{ label: "🇻🇳 Việt Nam", value: "vn" }, { label: "🇸🇬 Singapore", value: "sg" }]} onChange={setCountry} /></div>}>Quốc gia kinh doanh</SubSettingRow>}
        >
          <SettingsSelect value={mainPlatform} options={[{ label: "LadiSales", value: "ladisales" }, { label: "Ladi CRM", value: "crm" }]} onChange={setMainPlatform} />
        </DetailConfigItem>
        <DetailConfigItem icon={<PackageOpen />} title="Tạo đơn trên LadiSales tự động" description="Đơn hàng mới sẽ được tự động tạo khi tin nhắn khách hàng có chứa số điện thoại.">
          <SettingsToggle checked={generalSettingDraft.autoCreateLead} onChange={(value) => patchGeneralSetting({ autoCreateLead: value })} />
        </DetailConfigItem>
        <DetailConfigItem
          icon={<Bot />}
          title="Thông báo trợ lý tự động"
          description="Hiển thị thông báo khi trợ lý tự động trả lời."
          subRows={<SubSettingRow action={<SettingsToggle checked={syncCustomerTag} onChange={setSyncCustomerTag} />}>Khi gắn hoặc gỡ thẻ khách hàng, tự động đồng bộ thẻ với Ladi CRM</SubSettingRow>}
          last
        >
          <SettingsToggle checked={botNotification} onChange={setBotNotification} />
        </DetailConfigItem>
      </SettingsCard>

      <WorkingHoursSetting draft={generalSettingDraft} onChange={setGeneralSettingDraft} onSave={() => void saveGeneralSetting()} saving={updateSetting.isPending} />
    </div>
  );
}

function WorkingHoursSetting({
  draft,
  onChange,
  onSave,
  saving,
}: {
  draft: CustomerCareSettingsType;
  onChange: (draft: CustomerCareSettingsType) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const orderedDays = [1, 2, 3, 4, 5, 6, 0].map((day) => draft.workingDays.find((item) => item.day === day)).filter(Boolean);
  return (
    <SettingsCard
      title="Thời gian làm việc trong ngày"
      subtitle="Cài đặt thời gian làm việc giúp thống kê và phân chia hội thoại cho nhân viên chính xác hơn"
      actions={<SettingsButton onClick={onSave} disabled={saving}><Save className="h-4 w-4" />Lưu</SettingsButton>}
    >
      <div className="mb-5 max-w-lg">
        <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">Múi giờ của trang</div>
        <SettingsSelect
          className="w-full"
          value={draft.timezone}
          options={[
            { label: "(GMT +7:00) Hanoi, Bangkok, Jakarta", value: "Asia/Ho_Chi_Minh" },
            { label: "(GMT +8:00) Singapore", value: "Asia/Singapore" },
          ]}
          onChange={(timezone) => onChange({ ...draft, timezone })}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-white/15">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[68px_repeat(7,minmax(118px,1fr))] border-b border-slate-300 dark:border-white/15">
            <div />
            {workingDayLabels.map((label) => <div key={label} className="px-2 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>)}
          </div>
          <div className="grid min-h-[420px] grid-cols-[68px_repeat(7,minmax(118px,1fr))]">
            <div className="grid grid-rows-6 border-r border-slate-300 dark:border-white/15">
              {["8:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => <div key={time} className="border-b border-slate-200 px-2 pt-2 text-xs text-slate-500 last:border-0 dark:border-white/[0.08]">{time}</div>)}
            </div>
            {orderedDays.map((workingDay, index) => {
              if (!workingDay) return null;
              const shift = workingDay.shifts[0] ?? { id: `shift-${workingDay.day}-1`, from: "08:00", to: "17:00" };
              return (
                <button
                  type="button"
                  key={workingDay.day}
                  onClick={() => onChange({ ...draft, workingDays: draft.workingDays.map((day) => day.day === workingDay.day ? { ...day, enabled: !day.enabled } : day) })}
                  className={`relative border-r border-slate-300 p-2 text-left last:border-0 dark:border-white/15 ${workingDay.enabled ? "bg-lime-500/[0.03]" : "bg-slate-100/50 dark:bg-white/[0.015]"}`}
                >
                  {workingDay.enabled && (
                    <div className="h-[336px] rounded-md border-l-4 border-lime-500 bg-lime-500/[0.08] p-3 text-xs text-lime-700 dark:text-lime-300">
                      <div className="font-semibold">Lịch làm</div>
                      <div className="mt-1">{shift.from} - {shift.to}</div>
                      {index === 2 && <span className="absolute right-3 top-3 text-lime-500">×</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

export function TagSetting() {
  const [multipleTags, setMultipleTags] = useState(true);
  const [fullTagName, setFullTagName] = useState(true);
  const [filterMode, setFilterMode] = useState("and");
  const [syncTagsByCustomer, setSyncTagsByCustomer] = useState(false);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState(conversationTags);
  const filteredTags = tags.filter((tag) => tag.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Thẻ hội thoại</h1>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
        <SettingsCard title="Chức năng & công cụ">
          <DetailConfigItem icon={<Tags />} title="Gắn nhiều thẻ cho mỗi hội thoại" description="Hội thoại sẽ có thể gắn được nhiều thẻ khi bật tùy chọn này. Các thẻ đã được gắn trước khi thay đổi cài đặt sẽ không bị ảnh hưởng.">
            <SettingsToggle checked={multipleTags} onChange={setMultipleTags} />
          </DetailConfigItem>
          <DetailConfigItem icon={<PanelTop />} title="Hiển thị đầy đủ tên thẻ" description="Hiển thị đầy đủ tên thẻ ở danh sách hội thoại.">
            <SettingsToggle checked={fullTagName} onChange={setFullTagName} />
          </DetailConfigItem>
          <DetailConfigItem icon={<ListFilter />} title="Chế độ lọc đồng thời nhiều thẻ" description="Lọc đồng thời nhiều thẻ theo điều kiện OR (A hoặc B) và AND (A và B).">
            <SettingsSelect value={filterMode} options={[{ label: "AND", value: "and" }, { label: "OR", value: "or" }]} onChange={setFilterMode} />
          </DetailConfigItem>
          <DetailConfigItem icon={<UserCheck />} title="Đồng bộ thẻ theo khách hàng" description="Khi gắn thẻ hội thoại, đồng thời gắn thẻ cho hồ sơ khách hàng." last>
            <SettingsToggle checked={syncTagsByCustomer} onChange={setSyncTagsByCustomer} />
          </DetailConfigItem>
        </SettingsCard>

        <SettingsCard title="Thẻ hội thoại" subtitle={`${tags.length} thẻ`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/[0.08]">
            <div className="flex gap-5 text-sm font-medium"><button type="button" className="border-b-2 border-lime-500 pb-3 text-lime-600 dark:text-lime-400">Danh sách thẻ</button><button type="button" className="pb-3 text-slate-500">Thẻ ngừng sử dụng</button></div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm thẻ" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent pl-10 pr-3 text-sm outline-none focus:border-lime-500 dark:border-white/15" /></label>
            <SettingsButton variant="secondary"><CheckCheck className="h-4 w-4" /></SettingsButton>
            <SettingsButton variant="secondary"><Copy className="h-4 w-4" /></SettingsButton>
            <SettingsButton onClick={() => setTags((current) => [...current, { id: `tag-${Date.now()}`, name: `Thẻ mới ${current.length + 1}`, color: "#84CC16", enabled: true }])}><Plus className="h-4 w-4" />Thêm thẻ</SettingsButton>
          </div>
          <div className="max-h-[500px] overflow-auto rounded-xl border border-slate-300 dark:border-white/15">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white dark:bg-[#151918]"><tr className="border-b border-slate-300 dark:border-white/15"><th className="w-16 px-4 py-3">STT</th><th className="px-4 py-3">Tên thẻ</th><th className="w-36 px-4 py-3">Màu sắc</th></tr></thead>
              <tbody>{filteredTags.map((tag, index) => <tr key={tag.id} className="border-b border-slate-200 last:border-0 dark:border-white/[0.08]"><td className="px-4 py-3 text-slate-500">{index + 1}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-2"><Tags className="h-4 w-4" style={{ color: tag.color }} />{tag.name}</span></td><td className="px-4 py-3"><span className="block h-5 w-20 rounded-full" style={{ backgroundColor: tag.color }} /></td></tr>)}</tbody>
            </table>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

export function AiSetting() {
  const [enabled, setEnabled] = useState(true);
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<"copilot" | "autopilot">("copilot");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [aiConfigLoading, setAiConfigLoading] = useState(true);
  const [aiConfigSaving, setAiConfigSaving] = useState(false);
  const [aiConfigError, setAiConfigError] = useState<string | null>(null);
  const [suggestionMode, setSuggestionMode] = useState("open");
  const [suggestionEnabled, setSuggestionEnabled] = useState(true);
  const [quickReplyAi, setQuickReplyAi] = useState(false);
  const [typicalTraining, setTypicalTraining] = useState(true);
  const [sentiment, setSentiment] = useState(true);
  const [sentimentDepth, setSentimentDepth] = useState("5");

  const applyAiConfig = useCallback((config: CustomerCareAiConfig) => {
    setEnabled(config.enabled);
    setModel(config.model ?? "");
    setMode(config.mode);
    setAutoReplyEnabled(config.autoReplyEnabled);
  }, []);

  useEffect(() => {
    let active = true;
    customerCareApi.getAiConfig()
      .then((config) => { if (active) applyAiConfig(config); })
      .catch((error) => { if (active) setAiConfigError(error instanceof Error ? error.message : "Không thể tải cấu hình AI"); })
      .finally(() => { if (active) setAiConfigLoading(false); });
    return () => { active = false; };
  }, [applyAiConfig]);

  const saveAiConfig = async (patch: Parameters<typeof customerCareApi.updateAiConfig>[0]) => {
    setAiConfigSaving(true);
    setAiConfigError(null);
    try {
      applyAiConfig(await customerCareApi.updateAiConfig(patch));
    } catch (error) {
      setAiConfigError(error instanceof Error ? error.message : "Không thể lưu cấu hình AI");
    } finally {
      setAiConfigSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Trợ lý AI</h1>
      <SettingsCard>
        <div className="mb-5 rounded-lg border border-amber-400/60 bg-amber-400/15 px-4 py-3 text-sm leading-6 text-amber-800 dark:text-amber-200"><AlertCircle className="mr-2 inline h-4 w-4" />Để hoạt động chính xác hơn, AI cần được phép học từ các hội thoại chất lượng. <button type="button" className="font-semibold text-lime-600 dark:text-lime-400">Đào tạo ngay</button></div>
        <DetailConfigItem icon={<Sparkles />} title="Mô hình AI" description="LadiPage cung cấp các tùy chọn AI khác nhau. Model thông minh hơn có chi phí cao hơn nhưng chất lượng phản hồi tốt hơn.">
          <div className="flex flex-wrap items-center gap-3">
            <input value={model} disabled={aiConfigLoading || aiConfigSaving} onChange={(event) => setModel(event.target.value)} onBlur={() => void saveAiConfig({ model: model.trim() || null })} placeholder="openrouter/openai/gpt-4o" className="h-10 min-w-[260px] rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-lime-500 disabled:opacity-60 dark:border-white/15" />
            <SettingsToggle checked={enabled} onChange={(value) => { setEnabled(value); void saveAiConfig({ enabled: value }); }} />
          </div>
        </DetailConfigItem>
        {aiConfigError && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{aiConfigError}</div>}
        <DetailConfigItem icon={<Bot />} title="Chế độ vận hành" description="Copilot chỉ tạo bản nháp cho nhân viên. Autopilot mới được phép tự gửi và chỉ với dữ liệu đã qua kiểm tra an toàn.">
          <div className="flex items-center gap-3">
            <SettingsSelect value={mode} options={[{ label: "Copilot - nhân viên duyệt", value: "copilot" }, { label: "Autopilot - tự động trả lời", value: "autopilot" }]} onChange={(value) => { const next = value as "copilot" | "autopilot"; setMode(next); void saveAiConfig({ mode: next }); }} />
            <SettingsToggle checked={autoReplyEnabled} onChange={(value) => { setAutoReplyEnabled(value); void saveAiConfig({ autoReplyEnabled: value }); }} />
          </div>
        </DetailConfigItem>
        <DetailConfigItem icon={<Database />} title="Dataset" description="Chọn tập hợp dữ liệu dùng để huấn luyện hoặc hỗ trợ trợ lý AI hiểu rõ hơn về sản phẩm, dịch vụ và cách giao tiếp của doanh nghiệp.">
          <SettingsSelect className="min-w-[250px]" value="default" options={[{ label: "Dataset - Phương Nguyễn", value: "default" }]} onChange={() => undefined} />
        </DetailConfigItem>
        <div className="mb-5 ml-0 overflow-hidden rounded-xl border border-slate-300 md:ml-12 dark:border-white/15"><div className="grid grid-cols-3 border-b border-slate-300 text-sm font-semibold dark:border-white/15"><div className="px-5 py-3">Hội thoại</div><div className="px-5 py-3">Files</div><button type="button" className="px-5 py-3 text-right text-lime-600 dark:text-lime-400">Tùy chỉnh</button></div><div className="grid grid-cols-3 px-5 py-4 text-sm"><div>0</div><div>0</div><div /></div></div>
        <DetailConfigItem icon={<CircleDollarSign />} title="Thanh toán" description="Phí sử dụng tính năng AI được trừ trực tiếp từ ví LadiPage đã chọn.">
          <div className="flex items-center gap-3"><SettingsButton variant="ghost">Nạp tiền</SettingsButton><SettingsSelect value="wallet" options={[{ label: "USD Wallet  $0.00", value: "wallet" }]} onChange={() => undefined} /></div>
        </DetailConfigItem>
        <DetailConfigItem icon={<MessageCircleMore />} title="Gợi ý trả lời tin nhắn từ AI" description="Tự động tạo và hiển thị ba câu gợi ý trả lời dựa trên nội dung cuộc trò chuyện gần nhất." subRows={<><SubSettingRow action={<button type="button" className="font-semibold text-lime-600 dark:text-lime-400">Tùy chỉnh</button>}>Thêm yêu cầu nâng cao cho những gợi ý trả lời từ AI</SubSettingRow><SubSettingRow action={<SettingsToggle checked={typicalTraining} onChange={setTypicalTraining} />}>Cho phép chọn hội thoại điển hình để đào tạo AI</SubSettingRow></>}>
          <div className="flex items-center gap-3"><SettingsSelect value={suggestionMode} options={[{ label: "Khi mở hội thoại", value: "open" }, { label: "Khi khách nhắn", value: "incoming" }]} onChange={setSuggestionMode} /><SettingsToggle checked={suggestionEnabled} onChange={setSuggestionEnabled} /></div>
        </DetailConfigItem>
        <DetailConfigItem icon={<WandSparkles />} title="AI gợi ý câu trả lời nhanh" description="Dựa trên nội dung trò chuyện, AI sẽ gợi ý câu trả lời nhanh phù hợp khi nhập ký tự /.">
          <SettingsToggle checked={quickReplyAi} onChange={setQuickReplyAi} />
        </DetailConfigItem>
        <DetailConfigItem icon={<Sparkles />} title="Phát hiện cảm xúc của khách hàng" description="Tự động phân tích sắc thái cảm xúc khách hàng trong cuộc trò chuyện." last>
          <div className="flex items-center gap-3"><SettingsSelect value={sentimentDepth} options={[{ label: "5 tin gần nhất", value: "5" }, { label: "10 tin gần nhất", value: "10" }]} onChange={setSentimentDepth} /><SettingsToggle checked={sentiment} onChange={setSentiment} /></div>
        </DetailConfigItem>
      </SettingsCard>
    </div>
  );
}

export function ReplyHelperSetting() {
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hỗ trợ trả lời</h1>
      <SettingsCard>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-4 dark:border-white/15">
          <button type="button" className="border-b-2 border-lime-500 px-2 pb-4 text-base font-semibold text-lime-600 dark:text-lime-400">Trả lời nhanh</button>
          <div className="flex gap-2"><SettingsButton variant="secondary"><CheckCheck className="h-4 w-4" /></SettingsButton><SettingsButton variant="secondary"><Upload className="h-4 w-4" /></SettingsButton><SettingsButton variant="secondary"><Download className="h-4 w-4" /></SettingsButton><SettingsButton variant="secondary"><Copy className="h-4 w-4" /></SettingsButton><SettingsButton><Plus className="h-4 w-4" />Thêm mẫu</SettingsButton></div>
        </div>
        <div className="min-h-[600px] overflow-hidden rounded-xl border border-slate-300 dark:border-white/15">
          <div className="grid grid-cols-[70px_200px_1fr_56px] border-b border-slate-300 px-3 py-3 text-sm font-semibold dark:border-white/15"><div>STT</div><div>Ký tự tắt</div><div>Tin nhắn</div><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-10 rounded-lg border border-slate-300 bg-transparent pl-8 outline-none dark:border-white/15" /></label></div>
          <SettingsEmptyState title="Không có dữ liệu" description="Tạo mẫu trả lời nhanh để nhân viên phản hồi khách hàng nhất quán hơn." />
        </div>
      </SettingsCard>
    </div>
  );
}

export function DisplaySetting() {
  const [showPrimaryAssignee, setShowPrimaryAssignee] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [pageColor, setPageColor] = useState("#84CC16");
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Giao diện</h1>
      <SettingsCard title="Cài đặt giao diện">
        <DetailConfigItem icon={<UserRoundCog />} title="Hiển thị tài khoản được phân công chính" description="Hiển thị tài khoản được phân công chính ở danh sách hội thoại."><SettingsToggle checked={showPrimaryAssignee} onChange={setShowPrimaryAssignee} /></DetailConfigItem>
        <DetailConfigItem icon={<Eye />} title="Hiển thị tài khoản đang xem tin nhắn" description="Hiển thị tài khoản đang xem tin nhắn ở danh sách hội thoại."><SettingsToggle checked={showViewers} onChange={setShowViewers} /></DetailConfigItem>
        <DetailConfigItem icon={<Monitor />} title="Hiển thị trang" description="Tùy chỉnh màu nhận diện của trang trong không gian làm việc." last>
          <SettingsToggle checked={pageVisible} onChange={setPageVisible} />
        </DetailConfigItem>
        <div className="ml-0 mt-5 flex items-center gap-4 rounded-xl border-l-4 border-lime-500 bg-slate-50 p-4 md:ml-12 dark:bg-white/[0.04]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-lg font-semibold dark:bg-white/10">PN</div>
          <div className="min-w-0 flex-1"><div className="font-semibold text-slate-800 dark:text-slate-100">Phương Nguyễn</div><div className="mt-1 text-xs text-slate-500">Zalo • pzl_84398838675</div></div>
          <label className="relative h-7 w-24 overflow-hidden rounded-full"><input type="color" value={pageColor} onChange={(event) => setPageColor(event.target.value)} className="absolute -inset-2 h-12 w-32 cursor-pointer" /><span className="pointer-events-none absolute inset-0 rounded-full" style={{ backgroundColor: pageColor }} /></label>
        </div>
      </SettingsCard>
    </div>
  );
}

export function RoundRobinSetting() {
  const [assignmentMode, setAssignmentMode] = useState("self");
  const [viewPermission, setViewPermission] = useState(true);
  const [assignFirstReply, setAssignFirstReply] = useState(true);
  const modes = [
    { id: "off", label: "Tắt chế độ phân công", icon: RotateCcw },
    { id: "self", label: "Nhân viên tự phân công", icon: UserCheck },
    { id: "group", label: "Phân công theo nhóm", icon: UsersRound },
    { id: "custom", label: "Tùy chọn tài khoản", icon: UserRoundCog },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4"><h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Chế độ xoay vòng</h1><SettingsButton onClick={() => toast.success("Đã lưu chế độ xoay vòng")}><Save className="h-4 w-4" />Lưu cài đặt</SettingsButton></div>
      <SettingsCard title="Cài đặt chế độ" subtitle="Chọn các chế độ chia hội thoại cho nhân viên">
        <div className="grid gap-3 md:grid-cols-2">{modes.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setAssignmentMode(id)} className={`flex h-16 items-center gap-4 rounded-xl border px-5 text-left text-sm font-semibold transition ${assignmentMode === id ? "border-lime-500 bg-lime-500/10 text-lime-700 dark:text-lime-300" : "border-transparent bg-slate-100 text-slate-700 hover:border-slate-300 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/15"}`}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-black/20"><Icon className="h-5 w-5" /></span>{label}{assignmentMode === id && <Check className="ml-auto h-5 w-5 text-lime-500" />}</button>)}</div>
      </SettingsCard>
      <SettingsCard title="Cấu hình chi tiết" subtitle="Cấu hình chi tiết cho chế độ chia hội thoại được chọn">
        <DetailConfigItem icon={<Eye />} title="Quyền xem" description="Nhân viên chỉ xem được hội thoại được chia cho mình và chưa được chia cho ai." subRows={<SubSettingRow action={<SettingsToggle checked={assignFirstReply} onChange={setAssignFirstReply} />}>Tự động phân công cho nhân viên trả lời tin nhắn đầu tiên</SubSettingRow>} last><SettingsToggle checked={viewPermission} onChange={setViewPermission} /></DetailConfigItem>
      </SettingsCard>
    </div>
  );
}

export function SyncSetting() {
  const [activeTab, setActiveTab] = useState("images");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const tabs = [{ id: "images", label: "Ảnh" }, { id: "quick-replies", label: "Trả lời nhanh" }, { id: "tags", label: "Thẻ hội thoại" }, { id: "history", label: "Lịch sử đồng bộ" }];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Đồng bộ</h1>
      <SettingsCard className="!p-0">
        <div className="flex gap-7 overflow-x-auto border-b border-slate-200 px-6 dark:border-white/[0.08]">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold ${activeTab === tab.id ? "border-lime-500 text-lime-600 dark:text-lime-400" : "border-transparent text-slate-500"}`}>{tab.label}</button>)}</div>
      </SettingsCard>
      <SettingsCard>
        <div className="mb-5 flex flex-wrap justify-between gap-3"><label className="relative min-w-[240px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Tìm kiếm tên nhóm" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent pl-10 pr-3 text-sm outline-none focus:border-lime-500 dark:border-white/15" /></label><SettingsButton onClick={() => setCreateModalOpen(true)}><Plus className="h-4 w-4" />Tạo nhóm đồng bộ</SettingsButton></div>
        <div className="min-h-[470px] overflow-hidden rounded-xl border border-slate-300 dark:border-white/15"><div className="grid grid-cols-[80px_1fr_220px_180px] border-b border-slate-300 px-5 py-3 text-sm font-semibold dark:border-white/15"><div>STT</div><div>Tên nhóm đồng bộ</div><div>Thời gian cập nhật</div><div>Trang đồng bộ</div></div><SettingsEmptyState /></div>
      </SettingsCard>
      <SettingsModal open={createModalOpen} title="Tạo nhóm đồng bộ" onClose={() => setCreateModalOpen(false)} footer={<><SettingsButton variant="secondary" onClick={() => setCreateModalOpen(false)}>Hủy</SettingsButton><SettingsButton onClick={() => { toast.success("Đã tạo nhóm đồng bộ"); setCreateModalOpen(false); }}>Tạo nhóm</SettingsButton></>}>
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/15 p-3 text-sm leading-6 text-amber-800 dark:text-amber-200"><AlertCircle className="mr-2 inline h-4 w-4" />Dữ liệu tải lên sẽ nằm trong một thư viện chung của nhóm đồng bộ.</div>
        <label className="mb-5 block"><span className="mb-2 block text-sm font-medium">Tên nhóm <span className="text-red-500">*</span></span><input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Nhập tên nhóm" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-lime-500 dark:border-white/15" /></label>
        <div className="mb-2 text-sm font-medium">Chọn trang cần đồng bộ:</div><label className="relative mb-3 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Tìm kiếm trang" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent pl-10 pr-3 text-sm outline-none dark:border-white/15" /></label>
        <div className="min-h-[280px] rounded-xl border border-slate-300 dark:border-white/15"><div className="border-b border-slate-300 px-4 py-3 text-sm font-semibold dark:border-white/15">Tên trang</div><label className="flex items-center gap-3 px-4 py-4"><input type="checkbox" className="h-4 w-4 accent-lime-500" /><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 dark:bg-white/10">PN</span><span><span className="block text-sm font-semibold">Phương Nguyễn</span><span className="text-xs text-slate-500">Zalo • pzl_39236084121558695</span></span></label></div>
      </SettingsModal>
    </div>
  );
}

type ShippingDraft = {
  enabled: boolean;
  token: string;
  shopId: string;
  environment: "production" | "sandbox";
  fromDistrictId: string;
  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupProvince: string;
  pickupDistrict: string;
  pickupWard: string;
  pickupProvinceId: string;
  pickupDistrictId: string;
  pickupWardId: string;
  groupAddressId: string;
  cusId: string;
  serviceCode: string;
  apiAccount: string;
  customerCode: string;
  privateKey: string;
  username: string;
  password: string;
  baseUrl: string;
  testEndpoint: string;
  quoteEndpoint: string;
  createEndpoint: string;
  trackingEndpoint: string;
  cancelEndpoint: string;
};

const emptyShippingDraft = (): ShippingDraft => ({
  enabled: true,
  token: "",
  shopId: "",
  environment: "production",
  fromDistrictId: "",
  pickupName: "",
  pickupPhone: "",
  pickupAddress: "",
  pickupProvince: "",
  pickupDistrict: "",
  pickupWard: "",
  pickupProvinceId: "",
  pickupDistrictId: "",
  pickupWardId: "",
  groupAddressId: "",
  cusId: "",
  serviceCode: "",
  apiAccount: "",
  customerCode: "",
  privateKey: "",
  username: "",
  password: "",
  baseUrl: "",
  testEndpoint: "",
  quoteEndpoint: "",
  createEndpoint: "",
  trackingEndpoint: "",
  cancelEndpoint: "",
});

const shippingProviders: ShippingProvider[] = ["ghn", "ghtk", "viettel_post", "jt_express", "vnpost", "best_express", "ahamove"];
const shippingProviderNames: Record<ShippingProvider, string> = {
  ghn: "Giao Hàng Nhanh",
  ghtk: "Giao Hàng Tiết Kiệm",
  viettel_post: "Viettel Post",
  jt_express: "J&T Express",
  vnpost: "VNPost",
  best_express: "BEST Express",
  ahamove: "Ahamove",
};

export function ShippingSetting() {
  const [integrations, setIntegrations] = useState<ShippingIntegration[]>([]);
  const [drafts, setDrafts] = useState<Record<ShippingProvider, ShippingDraft>>({
    ghn: emptyShippingDraft(),
    ghtk: emptyShippingDraft(),
    viettel_post: emptyShippingDraft(),
    jt_express: emptyShippingDraft(),
    vnpost: emptyShippingDraft(),
    best_express: emptyShippingDraft(),
    ahamove: emptyShippingDraft(),
  });
  const [busyProvider, setBusyProvider] = useState<ShippingProvider | null>(null);

  const loadIntegrations = async () => {
    const items = await ecomApi.listShippingIntegrations();
    setIntegrations(items);
    setDrafts((current) => {
      const next = { ...current };
      for (const item of items) {
        const pickup = (item.settings.pickup ?? {}) as Record<string, unknown>;
        next[item.provider] = {
          ...current[item.provider],
          enabled: item.enabled,
          environment: item.settings.environment === "sandbox" ? "sandbox" : "production",
          fromDistrictId: String(item.settings.fromDistrictId ?? ""),
          pickupName: String(pickup.name ?? ""),
          pickupPhone: String(pickup.phone ?? ""),
          pickupAddress: String(pickup.address ?? ""),
          pickupProvince: String(pickup.province ?? ""),
          pickupDistrict: String(pickup.district ?? ""),
          pickupWard: String(pickup.ward ?? ""),
          pickupProvinceId: String(pickup.provinceId ?? ""),
          pickupDistrictId: String(pickup.districtId ?? ""),
          pickupWardId: String(pickup.wardId ?? ""),
          groupAddressId: String(item.settings.groupAddressId ?? ""),
          cusId: String(item.settings.cusId ?? ""),
          serviceCode: String(item.settings.serviceCode ?? ""),
          baseUrl: String(item.settings.baseUrl ?? ""),
          testEndpoint: String(((item.settings.endpoints ?? {}) as Record<string, unknown>).test ?? ""),
          quoteEndpoint: String(((item.settings.endpoints ?? {}) as Record<string, unknown>).calculateFee ?? ""),
          createEndpoint: String(((item.settings.endpoints ?? {}) as Record<string, unknown>).createOrder ?? ""),
          trackingEndpoint: String(((item.settings.endpoints ?? {}) as Record<string, unknown>).getTracking ?? ""),
          cancelEndpoint: String(((item.settings.endpoints ?? {}) as Record<string, unknown>).cancelOrder ?? ""),
        };
      }
      return next;
    });
  };

  useEffect(() => {
    // Loading is asynchronous; state is updated only after the API resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIntegrations().catch((error) =>
      toast.error(error instanceof Error ? error.message : "Không tải được cấu hình vận chuyển")
    );
  }, []);

  const patchDraft = (provider: ShippingProvider, patch: Partial<ShippingDraft>) => {
    setDrafts((current) => ({
      ...current,
      [provider]: { ...current[provider], ...patch },
    }));
  };

  const saveIntegration = async (provider: ShippingProvider) => {
    const draft = drafts[provider];
    setBusyProvider(provider);
    try {
      await ecomApi.saveShippingIntegration(provider, {
        enabled: draft.enabled,
        token: draft.token || undefined,
        shopId: provider === "ghn" ? draft.shopId || undefined : undefined,
        apiAccount: draft.apiAccount || undefined,
        customerCode: draft.customerCode || undefined,
        privateKey: draft.privateKey || undefined,
        username: draft.username || undefined,
        password: draft.password || undefined,
        settings: provider === "ghn"
          ? {
              environment: draft.environment,
              fromDistrictId: Number(draft.fromDistrictId) || undefined,
            }
          : provider === "ghtk" ? {
              pickup: {
                name: draft.pickupName,
                phone: draft.pickupPhone,
                address: draft.pickupAddress,
                province: draft.pickupProvince,
                district: draft.pickupDistrict,
                ward: draft.pickupWard,
              },
            } : {
              environment: draft.environment,
              serviceCode: draft.serviceCode || undefined,
              groupAddressId: Number(draft.groupAddressId) || undefined,
              cusId: Number(draft.cusId) || undefined,
              baseUrl: draft.baseUrl || undefined,
              pickup: {
                name: draft.pickupName,
                phone: draft.pickupPhone,
                address: draft.pickupAddress,
                province: draft.pickupProvince,
                district: draft.pickupDistrict,
                ward: draft.pickupWard,
                provinceId: Number(draft.pickupProvinceId) || undefined,
                districtId: Number(draft.pickupDistrictId) || undefined,
                wardId: Number(draft.pickupWardId) || undefined,
              },
              endpoints: {
                test: draft.testEndpoint || undefined,
                calculateFee: draft.quoteEndpoint || undefined,
                createOrder: draft.createEndpoint || undefined,
                getTracking: draft.trackingEndpoint || undefined,
                cancelOrder: draft.cancelEndpoint || undefined,
              },
            },
      });
      patchDraft(provider, { token: "", shopId: "", apiAccount: "", customerCode: "", privateKey: "", username: "", password: "" });
      await loadIntegrations();
      toast.success(`Đã lưu cấu hình ${provider.toUpperCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được cấu hình vận chuyển");
    } finally {
      setBusyProvider(null);
    }
  };

  const testIntegration = async (provider: ShippingProvider) => {
    setBusyProvider(provider);
    try {
      const result = await ecomApi.testShippingIntegration(provider);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await loadIntegrations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kiểm tra kết nối thất bại");
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Vận chuyển</h1>
        <p className="mt-1 text-sm text-slate-500">Kết nối đơn vị vận chuyển dùng chung cho CSKH và Bán hàng. Thông tin xác thực được mã hóa riêng cho từng tài khoản doanh nghiệp.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {shippingProviders.map((provider) => {
          const draft = drafts[provider];
          const integration = integrations.find((item) => item.provider === provider);
          const inputClass = "h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-lime-500 dark:border-white/15";
          return (
            <SettingsCard key={provider}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                    <PackageOpen className="h-5 w-5 text-lime-500" />
                    {shippingProviderNames[provider]}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {integration?.configured ? (integration.connectedAt ? "Đã kết nối" : "Đã lưu thông tin, chưa xác minh") : "Chưa cấu hình"}
                  </div>
                </div>
                <SettingsToggle checked={draft.enabled} onChange={(enabled) => patchDraft(provider, { enabled })} />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Token API
                  <input type="password" value={draft.token} onChange={(event) => patchDraft(provider, { token: event.target.value })} placeholder={integration?.configured ? "•••• (để trống nếu giữ token cũ)" : "Nhập token"} className={`mt-1 ${inputClass}`} />
                </label>
                {provider === "ghn" ? (
                  <>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Shop ID<input value={draft.shopId} onChange={(event) => patchDraft(provider, { shopId: event.target.value })} placeholder={integration?.configured ? "•••• (giữ Shop ID cũ)" : "Nhập Shop ID"} className={`mt-1 ${inputClass}`} /></label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Môi trường<select value={draft.environment} onChange={(event) => patchDraft(provider, { environment: event.target.value as ShippingDraft["environment"] })} className={`mt-1 ${inputClass}`}><option value="production">Production</option><option value="sandbox">Sandbox</option></select></label>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">ID khu vực lấy hàng (không bắt buộc)<input type="number" value={draft.fromDistrictId} onChange={(event) => patchDraft(provider, { fromDistrictId: event.target.value })} placeholder="Tự đồng bộ theo Shop ID" className={`mt-1 ${inputClass}`} /></label>
                    </div>
                  </>
                ) : provider === "ghtk" ? (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Địa chỉ lấy hàng GHTK</div>
                    <div className="grid gap-3 sm:grid-cols-2"><input value={draft.pickupName} onChange={(event) => patchDraft(provider, { pickupName: event.target.value })} placeholder="Tên cửa hàng" className={inputClass} /><input value={draft.pickupPhone} onChange={(event) => patchDraft(provider, { pickupPhone: event.target.value })} placeholder="Số điện thoại" className={inputClass} /></div>
                    <input value={draft.pickupAddress} onChange={(event) => patchDraft(provider, { pickupAddress: event.target.value })} placeholder="Địa chỉ lấy hàng" className={inputClass} />
                    <div className="grid gap-3 sm:grid-cols-3"><input value={draft.pickupProvince} onChange={(event) => patchDraft(provider, { pickupProvince: event.target.value })} placeholder="Tỉnh/thành" className={inputClass} /><input value={draft.pickupDistrict} onChange={(event) => patchDraft(provider, { pickupDistrict: event.target.value })} placeholder="Quận/huyện" className={inputClass} /><input value={draft.pickupWard} onChange={(event) => patchDraft(provider, { pickupWard: event.target.value })} placeholder="Phường/xã" className={inputClass} /></div>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hợp đồng API đối tác</div>
                    {provider === "jt_express" ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={draft.apiAccount} onChange={(event) => patchDraft(provider, { apiAccount: event.target.value })} placeholder="API Account" className={inputClass} />
                        <input value={draft.customerCode} onChange={(event) => patchDraft(provider, { customerCode: event.target.value })} placeholder="Customer Code" className={inputClass} />
                        <input type="password" value={draft.privateKey} onChange={(event) => patchDraft(provider, { privateKey: event.target.value })} placeholder="Private Key" className={inputClass} />
                        <input type="password" value={draft.password} onChange={(event) => patchDraft(provider, { password: event.target.value })} placeholder="Mật khẩu Open Platform" className={inputClass} />
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input value={draft.customerCode} onChange={(event) => patchDraft(provider, { customerCode: event.target.value })} placeholder="Mã khách hàng/hợp đồng" className={inputClass} />
                        <input value={draft.username} onChange={(event) => patchDraft(provider, { username: event.target.value })} placeholder="Username (nếu hãng cấp)" className={inputClass} />
                        <input type="password" value={draft.password} onChange={(event) => patchDraft(provider, { password: event.target.value })} placeholder="Password (nếu hãng cấp)" className={inputClass} />
                      </div>
                    )}
                    {(["viettel_post", "jt_express", "ahamove"] as ShippingProvider[]).includes(provider) ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Môi trường<select value={draft.environment} onChange={(event) => patchDraft(provider, { environment: event.target.value as ShippingDraft["environment"] })} className={`mt-1 ${inputClass}`}><option value="production">Production</option><option value="sandbox">Sandbox</option></select></label>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Mã dịch vụ mặc định<input value={draft.serviceCode} onChange={(event) => patchDraft(provider, { serviceCode: event.target.value })} placeholder={provider === "ahamove" ? "BIKE" : provider === "jt_express" ? "EXPRESS" : "Mã do hãng cấp"} className={`mt-1 ${inputClass}`} /></label>
                      </div>
                    ) : <>
                    <input value={draft.baseUrl} onChange={(event) => patchDraft(provider, { baseUrl: event.target.value })} placeholder="Base URL API theo hợp đồng" className={inputClass} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={draft.testEndpoint} onChange={(event) => patchDraft(provider, { testEndpoint: event.target.value })} placeholder="Endpoint kiểm tra kết nối" className={inputClass} />
                      <input value={draft.quoteEndpoint} onChange={(event) => patchDraft(provider, { quoteEndpoint: event.target.value })} placeholder="Endpoint báo giá" className={inputClass} />
                      <input value={draft.createEndpoint} onChange={(event) => patchDraft(provider, { createEndpoint: event.target.value })} placeholder="Endpoint tạo vận đơn" className={inputClass} />
                      <input value={draft.trackingEndpoint} onChange={(event) => patchDraft(provider, { trackingEndpoint: event.target.value })} placeholder="Endpoint tracking; dùng {trackingCode}" className={inputClass} />
                      <input value={draft.cancelEndpoint} onChange={(event) => patchDraft(provider, { cancelEndpoint: event.target.value })} placeholder="Endpoint hủy; dùng {trackingCode}" className={inputClass} />
                    </div>
                    </>}
                    {provider === "viettel_post" ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={draft.groupAddressId} onChange={(event) => patchDraft(provider, { groupAddressId: event.target.value })} placeholder="GROUPADDRESS_ID (kho lấy hàng)" className={inputClass} />
                        <input value={draft.cusId} onChange={(event) => patchDraft(provider, { cusId: event.target.value })} placeholder="CUS_ID Viettel Post" className={inputClass} />
                        <input value={draft.pickupProvinceId} onChange={(event) => patchDraft(provider, { pickupProvinceId: event.target.value })} placeholder="ID tỉnh lấy hàng" className={inputClass} />
                        <input value={draft.pickupDistrictId} onChange={(event) => patchDraft(provider, { pickupDistrictId: event.target.value })} placeholder="ID quận/huyện lấy hàng" className={inputClass} />
                        <input value={draft.pickupWardId} onChange={(event) => patchDraft(provider, { pickupWardId: event.target.value })} placeholder="ID phường/xã lấy hàng" className={inputClass} />
                      </div>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2"><input value={draft.pickupName} onChange={(event) => patchDraft(provider, { pickupName: event.target.value })} placeholder="Tên điểm lấy hàng" className={inputClass} /><input value={draft.pickupPhone} onChange={(event) => patchDraft(provider, { pickupPhone: event.target.value })} placeholder="Số điện thoại lấy hàng" className={inputClass} /></div>
                    <input value={draft.pickupAddress} onChange={(event) => patchDraft(provider, { pickupAddress: event.target.value })} placeholder="Địa chỉ lấy hàng" className={inputClass} />
                    <div className="grid gap-3 sm:grid-cols-3"><input value={draft.pickupProvince} onChange={(event) => patchDraft(provider, { pickupProvince: event.target.value })} placeholder="Tỉnh/thành" className={inputClass} /><input value={draft.pickupDistrict} onChange={(event) => patchDraft(provider, { pickupDistrict: event.target.value })} placeholder="Quận/huyện" className={inputClass} /><input value={draft.pickupWard} onChange={(event) => patchDraft(provider, { pickupWard: event.target.value })} placeholder="Phường/xã" className={inputClass} /></div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <SettingsButton variant="secondary" disabled={!integration?.configured || busyProvider === provider} onClick={() => void testIntegration(provider)}>{busyProvider === provider ? "Đang xử lý" : "Kiểm tra kết nối"}</SettingsButton>
                  <SettingsButton disabled={busyProvider === provider} onClick={() => void saveIntegration(provider)}><Save className="h-4 w-4" />Lưu</SettingsButton>
                </div>
              </div>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}

export function ToolSetting() {
  const toolItems = [
    { title: "Khóa truy cập API", description: "Tạo khóa bảo mật để tích hợp hệ thống bên ngoài với CSKH LadiPage.", action: "Tạo khóa", icon: KeyRound },
    { title: "Mời khách hàng thích trang", description: "Chọn bài viết và gửi lời mời thích trang đến khách hàng đã tương tác.", action: "Thực hiện", icon: UserCheck },
    { title: "Kiểm tra điều kiện Live Shopping", description: "Kiểm tra trang và tài khoản quảng cáo có đủ điều kiện chạy Live Shopping.", action: "Kiểm tra", icon: Monitor },
    { title: "Đánh dấu tất cả đã đọc", description: "Đánh dấu hội thoại hoặc bình luận là đã đọc theo phạm vi bạn chọn.", action: "Đánh dấu", icon: CheckCheck },
    { title: "Ẩn / hiện bình luận", description: "Thiết lập nhanh trạng thái hiển thị bình luận trên các bài viết.", action: "Mở công cụ", icon: Eye },
    { title: "Cài đặt chữ ký", description: "Tạo chữ ký dùng chung cho nhân viên khi trả lời hội thoại.", action: "Cấu hình", icon: FileText },
    { title: "Đồng bộ dữ liệu Zalo", description: "Đồng bộ dữ liệu hội thoại cũ về không gian CSKH hiện tại.", action: "Đồng bộ", icon: FolderSync },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Công cụ</h1>
      <div className="grid gap-4 lg:grid-cols-2">{toolItems.map(({ title, description, action, icon: Icon }) => <SettingsCard key={title}><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</div><div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</div></div><SettingsButton variant="secondary" onClick={() => toast.success(`${action}: ${title}`)}>{action}</SettingsButton></div></SettingsCard>)}</div>
    </div>
  );
}

export function SettingPermissions() {
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("Mai Anh");
  const users = ["Mai Anh", "Minh Khang", "Thu Hà", "Gia Bảo"];
  const permissions = ["Xem hội thoại", "Trả lời", "Phân công", "Xóa tin", "Cài đặt", "Xuất dữ liệu"];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Phân quyền</h1><SettingsButton onClick={() => setPermissionModalOpen(true)}><UserRoundCog className="h-4 w-4" />Thiết lập quyền</SettingsButton></div>
      <SettingsCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="relative min-w-[240px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Tìm kiếm nhân viên" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent pl-10 pr-3 text-sm outline-none dark:border-white/15" /></label><SettingsSelect value="all" options={[{ label: "Tất cả vai trò", value: "all" }, { label: "Quản trị viên", value: "admin" }, { label: "Nhân viên", value: "staff" }]} onChange={() => undefined} /></div>
        <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-white/15"><table className="min-w-[900px] w-full text-sm"><thead><tr className="border-b border-slate-300 dark:border-white/15"><th className="px-4 py-3 text-left">Tài khoản</th>{permissions.map((permission) => <th key={permission} className="px-3 py-3 text-center text-xs">{permission}</th>)}</tr></thead><tbody>{users.map((user, userIndex) => <tr key={user} className="border-b border-slate-200 last:border-0 dark:border-white/[0.08]"><td className="px-4 py-4"><div className="font-semibold">{user}</div><div className="mt-1 text-xs text-slate-500">{userIndex === 0 ? "Quản trị viên" : "Nhân viên CSKH"}</div></td>{permissions.map((permission, permissionIndex) => <td key={permission} className="px-3 py-4 text-center"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${userIndex === 0 || permissionIndex < 3 ? "bg-lime-500/15 text-lime-600" : "bg-slate-100 text-slate-300 dark:bg-white/[0.04]"}`}><Check className="h-3.5 w-3.5" /></span></td>)}</tr>)}</tbody></table></div>
      </SettingsCard>
      <SettingsModal open={permissionModalOpen} title="Thiết lập phân quyền" onClose={() => setPermissionModalOpen(false)} footer={<><SettingsButton variant="secondary" onClick={() => setPermissionModalOpen(false)}>Hủy</SettingsButton><SettingsButton onClick={() => { toast.success("Đã cập nhật phân quyền"); setPermissionModalOpen(false); }}>Lưu quyền</SettingsButton></>}>
        <SettingsSelect className="mb-5 w-full" value={selectedUser} options={users.map((user) => ({ label: user, value: user }))} onChange={setSelectedUser} />
        <div className="space-y-2">{permissions.map((permission, index) => <label key={permission} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-white/10"><span className="text-sm font-medium">{permission}</span><input type="checkbox" defaultChecked={index < 4} className="h-4 w-4 accent-lime-500" /></label>)}</div>
      </SettingsModal>
    </div>
  );
}

export function UpdateHistories() {
  const [tab, setTab] = useState("settings");
  const [selectedHistoryId, setSelectedHistoryId] = useState(settingHistoryItems[0].id);
  const tabs = [{ id: "settings", label: "Lịch sử cài đặt" }, { id: "blocked", label: "Chặn khách hàng" }, { id: "removed", label: "Bình luận đã xóa" }, { id: "facebook", label: "Vi phạm Facebook" }, { id: "round-robin", label: "Xoay vòng" }];
  const selectedHistory = settingHistoryItems.find((item) => item.id === selectedHistoryId) ?? settingHistoryItems[0];
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lịch sử</h1>
      <SettingsCard className="!p-0"><div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-6 dark:border-white/[0.08]">{tabs.map((item) => <button type="button" key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold ${tab === item.id ? "border-lime-500 text-lime-600 dark:text-lime-400" : "border-transparent text-slate-500"}`}>{item.label}</button>)}</div></SettingsCard>
      <SettingsCard>
        <div className="mb-4 flex flex-wrap gap-3"><label className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Tìm kiếm lịch sử" className="h-10 w-full rounded-lg border border-slate-300 bg-transparent pl-10 pr-3 text-sm outline-none dark:border-white/15" /></label><SettingsSelect value="all" options={[{ label: "Tất cả hành động", value: "all" }, { label: "Cập nhật", value: "update" }]} onChange={() => undefined} /></div>
        <div className="grid min-h-[480px] overflow-hidden rounded-xl border border-slate-300 lg:grid-cols-[minmax(0,1fr)_360px] dark:border-white/15">
          <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-300 dark:border-white/15"><th className="px-4 py-3 text-left">Người thao tác</th><th className="px-4 py-3 text-left">Hành động</th><th className="px-4 py-3 text-left">Đối tượng</th><th className="px-4 py-3 text-left">Thời gian</th></tr></thead><tbody>{settingHistoryItems.map((item) => <tr key={item.id} onClick={() => setSelectedHistoryId(item.id)} className={`cursor-pointer border-b border-slate-200 last:border-0 dark:border-white/[0.08] ${selectedHistoryId === item.id ? "bg-lime-500/[0.08]" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"}`}><td className="px-4 py-4 font-medium">{item.actor}</td><td className="px-4 py-4">{item.action}</td><td className="px-4 py-4">{item.target}</td><td className="px-4 py-4 text-xs text-slate-500">{item.createdAt}</td></tr>)}</tbody></table></div>
          <aside className="border-t border-slate-300 p-5 lg:border-l lg:border-t-0 dark:border-white/15"><div className="text-sm font-semibold">Chi tiết thay đổi</div><div className="mt-5 space-y-4 text-sm"><div><div className="text-xs text-slate-500">Người thao tác</div><div className="mt-1 font-medium">{selectedHistory.actor}</div></div><div><div className="text-xs text-slate-500">Hành động</div><div className="mt-1 font-medium">{selectedHistory.action}</div></div><div><div className="text-xs text-slate-500">Cài đặt</div><div className="mt-1 font-medium">{selectedHistory.target}</div></div><div className="rounded-lg border border-lime-500/20 bg-lime-500/[0.08] p-3 text-xs leading-5 text-lime-800 dark:text-lime-300">Lịch sử chỉ dùng để đối chiếu. Một số thay đổi không thể hoàn tác trực tiếp.</div></div></aside>
        </div>
      </SettingsCard>
    </div>
  );
}
