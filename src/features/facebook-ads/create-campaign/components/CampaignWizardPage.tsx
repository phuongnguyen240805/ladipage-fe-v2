"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Check,
  ChevronDown,
  CircleDot,
  ExternalLink,
  FileText,
  Globe2,
  ImageIcon,
  Info,
  Megaphone,
  MousePointerClick,
  Save,
  Send,
  ShoppingBag,
  Target,
  UploadCloud,
  Users,
} from "lucide-react";
import AdsButton from "../../shared/components/AdsButton";
import AdsModal from "../../shared/components/AdsModal";
import MockNotice from "../../shared/components/MockNotice";
import { mockAdsAccounts } from "../../manager/mock-data";
import { adsPlatformRepository } from "../../../ads-platform/api/ads-platform.repository";
import type { AdsAccount, AdsConnection, AdsJob } from "../../../ads-platform/contracts";

type WizardStep = 1 | 2 | 3 | 4;

const steps = [
  { id: 1 as const, label: "Chiến dịch", description: "Mục tiêu và ngân sách" },
  { id: 2 as const, label: "Nhóm quảng cáo", description: "Đối tượng và phân phối" },
  { id: 3 as const, label: "Quảng cáo", description: "Nội dung và điểm đến" },
  { id: 4 as const, label: "Kiểm tra", description: "Xác nhận trước khi tạo" },
];

const objectives = [
  {
    id: "LEADS",
    label: "Khách hàng tiềm năng",
    description: "Thu thập thông tin qua form, website hoặc tin nhắn.",
    icon: Users,
  },
  {
    id: "SALES",
    label: "Doanh số",
    description: "Tìm người có khả năng mua sản phẩm hoặc dịch vụ.",
    icon: ShoppingBag,
  },
  {
    id: "TRAFFIC",
    label: "Lưu lượng truy cập",
    description: "Đưa người dùng đến website hoặc landing page.",
    icon: MousePointerClick,
  },
];

const mockAudiences = [
  {
    id: "broad",
    name: "Broad · Việt Nam · 25–44",
    description: "Ước tính 18–22 triệu người",
  },
  {
    id: "website-30",
    name: "Website visitors 30 ngày",
    description: "128.420 người · cập nhật hôm nay",
  },
  {
    id: "lookalike-lead",
    name: "Lookalike Lead 1%",
    description: "Tương tự 1% nguồn Lead chất lượng",
  },
  {
    id: "engagement-365",
    name: "Facebook engagement 365 ngày",
    description: "346.800 người đã tương tác",
  },
];

function FormLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
      {children}
      {optional && <span className="font-normal text-muted-foreground">(không bắt buộc)</span>}
    </span>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20";

const LIVE_MODE = process.env.NEXT_PUBLIC_ADS_PLATFORM_MODE === "live";

export default function CampaignWizardPage() {
  const [step, setStep] = useState<WizardStep>(1);
  const [accountId, setAccountId] = useState(LIVE_MODE ? "" : mockAdsAccounts[0].id);
  const [liveAccounts, setLiveAccounts] = useState<AdsAccount[]>([]);
  const [liveConnections, setLiveConnections] = useState<AdsConnection[]>([]);
  const [publishJob, setPublishJob] = useState<AdsJob | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const publishKeyRef = useRef(`meta-publish:${Date.now()}:${Math.random().toString(36).slice(2)}`);
  const [objective, setObjective] = useState("LEADS");
  const [campaignName, setCampaignName] = useState(
    "LDP | Lead Form | Broad | Tháng 07",
  );
  const [budget, setBudget] = useState("500000");
  const [adsetName, setAdsetName] = useState("HN + HCM | 25–44 | Broad");
  const [pageName, setPageName] = useState("LadiPage Vietnam");
  const [pageId, setPageId] = useState("");
  const [primaryText, setPrimaryText] = useState(
    "Tạo landing page chuyên nghiệp, tối ưu chuyển đổi và xuất bản chỉ trong vài phút.",
  );
  const [headline, setHeadline] = useState(
    "Bắt đầu xây landing page hiệu quả",
  );
  const [destinationUrl, setDestinationUrl] = useState(
    "https://ladipage.vn/dang-ky",
  );
  const [savedAt, setSavedAt] = useState("Vừa xong");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [selectedAudienceId, setSelectedAudienceId] = useState("broad");
  const [media, setMedia] = useState<{
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!LIVE_MODE) return;
    void Promise.all([adsPlatformRepository.listAccounts(), adsPlatformRepository.listConnections()])
      .then(([accounts, connections]) => {
        const metaAccounts = accounts.filter((item) => item.provider === "META");
        setLiveAccounts(metaAccounts);
        setLiveConnections(connections.filter((item) => item.provider === "META" && item.status === "CONNECTED"));
        setAccountId((current) => current || metaAccounts[0]?.externalId || "");
      })
      .catch((cause) => setPublishError(cause instanceof Error ? cause.message : "Không tải được tài khoản Meta"));
  }, []);

  const accountOptions = LIVE_MODE
    ? liveAccounts.map((account) => ({
        id: account.externalId,
        name: account.name,
        currency: (account.currency || "VND") as "VND" | "USD",
        timezone: account.timezone || "UTC",
        status: account.status === "DISABLED" ? "DISABLED" as const : "ACTIVE" as const,
      }))
    : mockAdsAccounts;
  const selectedAccount = accountOptions.find((account) => account.id === accountId) || accountOptions[0] || {
    id: "",
    name: "Chưa có tài khoản quảng cáo",
    currency: "VND" as const,
    timezone: "UTC",
    status: "DISABLED" as const,
  };
  const selectedObjective = objectives.find((item) => item.id === objective);
  const selectedAudience =
    mockAudiences.find((item) => item.id === selectedAudienceId) ||
    mockAudiences[0];
  const filteredAudiences = mockAudiences.filter((item) =>
    `${item.name} ${item.description}`
      .toLocaleLowerCase("vi")
      .includes(audienceSearch.trim().toLocaleLowerCase("vi")),
  );

  const canContinue = useMemo(() => {
    if (step === 1) return (!LIVE_MODE || accountId.length > 0) && campaignName.trim().length > 0 && Number(budget) > 0;
    if (step === 2) return adsetName.trim().length > 0;
    if (step === 3)
      return (
        pageName.trim().length > 0 &&
        (!LIVE_MODE || pageId.trim().length > 0) &&
        primaryText.trim().length > 0 &&
        headline.trim().length > 0 &&
        destinationUrl.startsWith("http")
      );
    return true;
  }, [
    adsetName,
    accountId,
    budget,
    campaignName,
    destinationUrl,
    headline,
    pageName,
    pageId,
    primaryText,
    step,
  ]);

  const handleSave = () => {
    setSavedAt(
      new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    );
  };

  const handleMediaChange = (file?: File) => {
    if (!file) return;
    const nextMedia = {
      name: file.name,
      type: file.type,
      size: file.size,
    };
    if (!file.type.startsWith("image/")) {
      setMedia(nextMedia);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setMedia({
        ...nextMedia,
        previewUrl: typeof reader.result === "string" ? reader.result : undefined,
      });
    });
    reader.readAsDataURL(file);
  };

  const handleConfirmPreview = async () => {
    if (!LIVE_MODE) {
      handleSave();
      setPublishOpen(false);
      return;
    }
    const account = liveAccounts.find((item) => item.externalId === accountId);
    const connection = liveConnections.find((item) => item.id === account?.connectionId);
    if (!account || !connection) {
      setPublishError("Tài khoản chưa có Meta connection hợp lệ");
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const objectiveMap: Record<string, string> = {
        LEADS: "OUTCOME_LEADS",
        SALES: "OUTCOME_SALES",
        TRAFFIC: "OUTCOME_TRAFFIC",
      };
      const optimizationMap: Record<string, string> = {
        LEADS: "LEAD_GENERATION",
        SALES: "OFFSITE_CONVERSIONS",
        TRAFFIC: "LINK_CLICKS",
      };
      const job = await adsPlatformRepository.createPublishJob({
        provider: "META",
        connectionId: connection.id,
        externalAccountId: account.externalId,
        idempotencyKey: publishKeyRef.current,
        revision: 1,
        draft: {
          campaign: { name: campaignName.trim(), objective: objectiveMap[objective], specialAdCategories: [] },
          adSet: {
            name: adsetName.trim(),
            dailyBudget: Number(budget),
            billingEvent: "IMPRESSIONS",
            optimizationGoal: optimizationMap[objective],
            targeting: { geo_locations: { countries: ["VN"] }, age_min: 25, age_max: 44 },
          },
          creative: {
            name: `${campaignName.trim()} | Creative`,
            objectStorySpec: {
              page_id: pageId.trim(),
              link_data: { link: destinationUrl, message: primaryText, name: headline },
            },
          },
          ad: { name: `${campaignName.trim()} | Ad` },
        },
      });
      setPublishJob(job);
      handleSave();
    } catch (cause) {
      setPublishError(cause instanceof Error ? cause.message : "Không tạo được publish job");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/facebook-ads/manager"
              aria-label="Quay lại Ads Manager"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-theme-xs transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={17} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight">
                  Tạo chiến dịch
                </h1>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Bản nháp
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Đã lưu {savedAt} · Khi hoàn tất, quảng cáo được tạo ở trạng thái tạm dừng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdsButton
              size="sm"
              startIcon={<Save aria-hidden="true" size={15} />}
              onClick={handleSave}
            >
              Lưu bản nháp
            </AdsButton>
            <AdsButton
              size="sm"
              variant="ghost"
              startIcon={<ExternalLink aria-hidden="true" size={15} />}
            >
              Trợ giúp
            </AdsButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <section className="rounded-xl border border-border bg-card p-3 shadow-theme-xs md:p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Tiến trình tạo chiến dịch
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Bước {step} trên {steps.length} · {steps[step - 1].description}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-lime-50 px-2.5 py-1 text-[10px] font-semibold text-lime-700 dark:bg-lime-500/15 dark:text-lime-300">
              {Math.round((step / steps.length) * 100)}%
            </span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-lime-500 transition-[width] duration-300"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((item) => {
              const completed = item.id < step;
              const active = item.id === step;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setStep(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-3 ${
                      active
                        ? "border-lime-300 bg-lime-50 dark:border-lime-500/40 dark:bg-lime-500/10"
                        : completed
                          ? "border-lime-200 bg-lime-50/50 hover:bg-lime-50 dark:border-lime-500/20 dark:bg-lime-500/5"
                          : "border-transparent bg-muted/45 hover:border-border hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        completed
                          ? "bg-lime-500 text-white"
                          : active
                            ? "bg-lime-500 text-white shadow-sm"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {completed ? <Check size={14} /> : item.id}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-0.5 hidden truncate text-[10px] text-muted-foreground lg:block">
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
          {step === 1 && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Megaphone size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Thiết lập chiến dịch</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Chọn tài khoản, đặt tên dễ tìm và xác định kết quả bạn muốn đạt được.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <FormLabel>Tài khoản quảng cáo</FormLabel>
                    <span className="relative block">
                      <select
                        value={accountId}
                        onChange={(event) => setAccountId(event.target.value)}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        {accountOptions.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} · {account.id}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                    </span>
                  </label>

                  <label className="sm:col-span-2">
                    <FormLabel>Tên chiến dịch</FormLabel>
                    <input
                      value={campaignName}
                      onChange={(event) => setCampaignName(event.target.value)}
                      className={inputClass}
                      placeholder="Ví dụ: Sản phẩm | Mục tiêu | Đối tượng | Tháng"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div>
                  <h2 className="text-sm font-semibold">Mục tiêu chiến dịch</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Các trường ở bước tiếp theo sẽ thay đổi theo mục tiêu này.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {objectives.map((item) => {
                    const Icon = item.icon;
                    const selected = objective === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setObjective(item.id)}
                        className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selected
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon size={16} />
                          </span>
                          <CircleDot
                            size={16}
                            className={selected ? "text-primary" : "text-gray-300"}
                          />
                        </div>
                        <p className="mt-3 text-xs font-semibold">{item.label}</p>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-center gap-2">
                  <BadgeDollarSign size={17} className="text-primary" />
                  <h2 className="text-sm font-semibold">Ngân sách</h2>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <FormLabel>Loại ngân sách</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>Ngân sách hàng ngày</option>
                      <option>Ngân sách trọn đời</option>
                    </select>
                  </label>
                  <label>
                    <FormLabel>Số tiền mỗi ngày</FormLabel>
                    <div className="relative">
                      <input
                        type="number"
                        min="1000"
                        value={budget}
                        onChange={(event) => setBudget(event.target.value)}
                        className={`${inputClass} pr-14 text-right`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {selectedAccount.currency}
                      </span>
                    </div>
                  </label>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Target size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Nhóm quảng cáo</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Xác định nơi chuyển đổi, đối tượng và cách Meta phân phối quảng cáo.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <FormLabel>Tên nhóm quảng cáo</FormLabel>
                    <input
                      value={adsetName}
                      onChange={(event) => setAdsetName(event.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <FormLabel>Nơi chuyển đổi</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>Website</option>
                      <option>Biểu mẫu tức thì</option>
                      <option>Messenger</option>
                    </select>
                  </label>
                  <label>
                    <FormLabel>Pixel/Dataset</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>LadiPage Main Pixel · 89432107</option>
                      <option>Ecom Store Pixel · 60158342</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-center gap-2">
                  <Users size={17} className="text-primary" />
                  <h2 className="text-sm font-semibold">Đối tượng</h2>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <FormLabel>Vị trí</FormLabel>
                    <div className="relative">
                      <Globe2
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        value="Hà Nội, Hồ Chí Minh"
                        readOnly
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </label>
                  <label>
                    <FormLabel>Độ tuổi</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>25–44</option>
                      <option>18–44</option>
                      <option>18–65+</option>
                    </select>
                  </label>
                  <div>
                    <FormLabel>Đối tượng</FormLabel>
                    <button
                      type="button"
                      onClick={() => setAudienceOpen(true)}
                      className={`${inputClass} flex items-center justify-between text-left`}
                    >
                      <span className="min-w-0 truncate">{selectedAudience.name}</span>
                      <ChevronDown size={15} className="shrink-0 text-muted-foreground" />
                    </button>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {selectedAudience.description}
                    </p>
                  </div>
                  <label>
                    <FormLabel>Vị trí quảng cáo</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>Advantage+ placements</option>
                      <option>Chọn vị trí thủ công</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex gap-2 rounded-lg bg-blue-light-50 p-3 text-blue-light-800 dark:bg-blue-light-500/10 dark:text-blue-light-200">
                  <Info size={15} className="mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-4">
                    Quy mô đối tượng ước tính đang ở mức rộng. Đây là dữ liệu mô phỏng để kiểm tra cách trình bày.
                  </p>
                </div>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <ImageIcon size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Nội dung quảng cáo</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Chọn danh tính, nội dung và trang đích người xem sẽ nhìn thấy.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <label>
                    <FormLabel>Fanpage</FormLabel>
                    <select
                      value={pageName}
                      onChange={(event) => setPageName(event.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option>LadiPage Vietnam</option>
                      <option>LadiPage Academy</option>
                    </select>
                  </label>

                  {LIVE_MODE && (
                    <label>
                      <FormLabel>Meta Page ID</FormLabel>
                      <input
                        value={pageId}
                        onChange={(event) => setPageId(event.target.value)}
                        className={inputClass}
                        placeholder="Ví dụ: 123456789012345"
                      />
                    </label>
                  )}

                  <div>
                    <FormLabel>Hình ảnh hoặc video</FormLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(event) => handleMediaChange(event.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center transition hover:border-primary/50 hover:bg-muted/60"
                    >
                      {media?.previewUrl ? (
                        <Image
                          src={media.previewUrl}
                          alt="Nội dung quảng cáo đã chọn"
                          width={640}
                          height={440}
                          unoptimized
                          className="max-h-52 w-auto rounded-lg object-contain"
                        />
                      ) : (
                        <>
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-theme-xs">
                            <UploadCloud size={17} />
                          </span>
                          <span className="mt-2 text-xs font-medium">
                            {media ? media.name : "Chọn ảnh hoặc video từ máy"}
                          </span>
                          <span className="mt-1 text-[11px] text-muted-foreground">
                            {media
                              ? `${(media.size / 1024 / 1024).toFixed(2)} MB · chỉ xem trước cục bộ`
                              : "PNG, JPG, WebP hoặc video · không upload lên máy chủ"}
                          </span>
                        </>
                      )}
                    </button>
                    {media?.previewUrl && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-[11px] text-muted-foreground">
                          {media.name} · {(media.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setMedia(null)}
                          className="shrink-0 text-[11px] font-medium text-error-600 hover:underline dark:text-error-400"
                        >
                          Gỡ nội dung
                        </button>
                      </div>
                    )}
                  </div>

                  <label>
                    <FormLabel>Văn bản chính</FormLabel>
                    <textarea
                      rows={4}
                      value={primaryText}
                      onChange={(event) => setPrimaryText(event.target.value)}
                      className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                    />
                  </label>

                  <label>
                    <FormLabel>Tiêu đề</FormLabel>
                    <input
                      value={headline}
                      onChange={(event) => setHeadline(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label>
                    <FormLabel>URL đích</FormLabel>
                    <input
                      value={destinationUrl}
                      onChange={(event) => setDestinationUrl(event.target.value)}
                      className={inputClass}
                      inputMode="url"
                    />
                  </label>

                  <label>
                    <FormLabel>Nút kêu gọi hành động</FormLabel>
                    <select className={`${inputClass} appearance-none`}>
                      <option>Tìm hiểu thêm</option>
                      <option>Đăng ký</option>
                      <option>Mua ngay</option>
                    </select>
                  </label>
                </div>
              </section>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-5 shadow-theme-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300">
                    <Check size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Sẵn sàng để kiểm tra</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Các thông tin bắt buộc trong bản xem trước đã đầy đủ.
                    </p>
                  </div>
                </div>

                <dl className="mt-5 divide-y divide-border rounded-xl border border-border">
                  {[
                    ["Tài khoản", selectedAccount.name],
                    ["Chiến dịch", campaignName],
                    ["Mục tiêu", selectedObjective?.label || "—"],
                    [
                      "Ngân sách",
                      `${new Intl.NumberFormat("vi-VN").format(Number(budget))} ${selectedAccount.currency}/ngày`,
                    ],
                    ["Nhóm quảng cáo", adsetName],
                    ["Đối tượng", "Hà Nội, Hồ Chí Minh · 25–44 · Broad"],
                    ["Fanpage", pageName],
                    ["Điểm đến", destinationUrl],
                    ["Trạng thái khi tạo", "Tạm dừng"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr]"
                    >
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="break-words text-xs font-medium text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="flex gap-2 rounded-xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-200">
                <Info size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Đây là bản xem trước UI/UX</p>
                  <p className="mt-1 text-[11px] leading-4">
                    Nút tạo chiến dịch chưa gửi dữ liệu đến Meta. Khi Backend hoàn tất, luồng thật sẽ validate và tạo toàn bộ tài nguyên ở trạng thái tạm dừng.
                  </p>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-5 flex flex-col-reverse gap-2 rounded-xl border border-border bg-card p-3 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between">
            <AdsButton
              variant="ghost"
              startIcon={<ArrowLeft aria-hidden="true" size={16} />}
              disabled={step === 1}
              onClick={() => setStep((current) => Math.max(1, current - 1) as WizardStep)}
            >
              Quay lại
            </AdsButton>
            {step < 4 ? (
              <AdsButton
                variant="primary"
                endIcon={<ArrowRight aria-hidden="true" size={16} />}
                disabled={!canContinue}
                onClick={() => setStep((current) => Math.min(4, current + 1) as WizardStep)}
              >
                Tiếp tục
              </AdsButton>
            ) : (
              <AdsButton
                variant="primary"
                startIcon={<Send aria-hidden="true" size={16} />}
                onClick={() => setPublishOpen(true)}
              >
                Kiểm tra và hoàn tất
              </AdsButton>
            )}
          </footer>
          </main>

          <aside className="w-full max-w-[320px] justify-self-center xl:sticky xl:top-[86px] xl:justify-self-auto xl:self-start">
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-theme-xs">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-xs font-semibold">Xem trước quảng cáo</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Bảng tin trên thiết bị di động</p>
              </div>
              <FileText size={16} className="text-muted-foreground" />
            </div>

            <div className="p-3">
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="flex items-center gap-2 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    L
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{pageName || "Tên Fanpage"}</p>
                    <p className="text-[10px] text-muted-foreground">Được tài trợ · 🌐</p>
                  </div>
                </div>
                <p className="px-3 pb-3 text-xs leading-5 text-foreground">
                  {primaryText || "Văn bản chính của quảng cáo sẽ hiển thị tại đây."}
                </p>
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
                  {media?.previewUrl ? (
                    <Image
                      src={media.previewUrl}
                      alt="Bản xem trước quảng cáo"
                      width={640}
                      height={440}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon size={28} className="mx-auto" />
                      <p className="mt-2 text-[10px]">
                        {media?.name || "Nội dung quảng cáo"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">
                      ladipage.vn
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-4">
                      {headline || "Tiêu đề quảng cáo"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-border bg-card px-3 py-1.5 text-[10px] font-semibold">
                    Tìm hiểu thêm
                  </span>
                </div>
              </div>
            </div>
          </section>
          </aside>
        </div>
      </div>

      <AdsModal
        open={audienceOpen}
        title="Chọn đối tượng"
        description="Thư viện audience mẫu để kiểm tra thao tác tìm kiếm và lựa chọn."
        onClose={() => setAudienceOpen(false)}
        footer={
          <AdsButton variant="primary" onClick={() => setAudienceOpen(false)}>
            Dùng đối tượng này
          </AdsButton>
        }
      >
        <label className="block">
          <span className="sr-only">Tìm đối tượng</span>
          <input
            value={audienceSearch}
            onChange={(event) => setAudienceSearch(event.target.value)}
            placeholder="Tìm theo tên hoặc nguồn audience…"
            className={inputClass}
          />
        </label>
        <div className="mt-3 space-y-2">
          {filteredAudiences.map((audience) => {
            const selected = audience.id === selectedAudienceId;
            return (
              <button
                key={audience.id}
                type="button"
                onClick={() => setSelectedAudienceId(audience.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                  selected
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Users size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {audience.name}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    {audience.description}
                  </span>
                </span>
                {selected && <Check size={17} className="ml-auto shrink-0 text-primary" />}
              </button>
            );
          })}
          {filteredAudiences.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Không tìm thấy audience phù hợp.
            </p>
          )}
        </div>
      </AdsModal>

      <AdsModal
        open={publishOpen}
        title={LIVE_MODE ? "Tạo chiến dịch Meta ở trạng thái tạm dừng?" : "Hoàn tất bản xem trước?"}
        description={LIVE_MODE ? "Backend sẽ enqueue publish job và tạo Campaign, Ad Set, Creative, Ad ở trạng thái PAUSED." : "Hệ thống chỉ lưu trạng thái mock trong phiên hiện tại, không gửi dữ liệu đến Meta."}
        size="sm"
        onClose={() => setPublishOpen(false)}
        footer={
          <>
            <AdsButton variant="ghost" onClick={() => setPublishOpen(false)}>
              Quay lại kiểm tra
            </AdsButton>
            <AdsButton
              variant="primary"
              startIcon={<Send size={15} />}
              onClick={handleConfirmPreview}
              disabled={publishing || Boolean(publishJob)}
            >
              {publishing ? "Đang enqueue…" : publishJob ? `Job ${publishJob.state}` : LIVE_MODE ? "Tạo chiến dịch tạm dừng" : "Xác nhận bản mock"}
            </AdsButton>
          </>
        }
      >
        <div className="space-y-3">
          {!LIVE_MODE && <MockNotice />}
          {publishError && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700">{publishError}</div>}
          {publishJob && <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-700">Publish job {publishJob.id} đã được tạo. Trạng thái hiện tại: {publishJob.state}.</div>}
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-foreground">{campaignName}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {selectedAudience.name} · {selectedObjective?.label} · trạng thái tạm dừng
            </p>
          </div>
        </div>
      </AdsModal>
    </div>
  );
}
