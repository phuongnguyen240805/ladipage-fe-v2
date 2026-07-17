"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Globe,
  Building2,
  FileCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { useCreateProjectWizardStore } from "../../stores/useCreateProjectWizardStore";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";
import {
  checkSeoInstallation,
  createSeoProjectFromWizard,
  setupSeoProject,
} from "../../api/seo-projects.api";
import { isAiSeoNestApi } from "../../utils/ai-seo-api-mode";
import { Step1Schema, Step1Input, Step2Schema, Step2Input } from "../../validation/wizard.schema";

export function CreateProjectWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedOrgId = useAiSeoUiStore((state) => state.selectedOrgId);

  // Zustand Store values
  const {
    currentStep,
    isSubmitting,
    createdSeoProjectId,
    websiteUrl,
    projectName,
    countryCode,
    languageCode,
    crawlBudget,
    userAgent,
    crawlConcurrency,
    respectRobotsTxt,
    urlExclusionRules,
    businessName,
    businessDescription,
    industry,
    audience,
    location,
    language,
    phone,
    email,
    address,
    serviceAreas,
    socialProfiles,
    gscProperty,
    gbpLocation,
    installationType,
    installationStatus,
    setStep,
    setSubmitting,
    updateFields,
    resetWizard,
  } = useCreateProjectWizardStore();

  const [copied, setCopied] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Sync Step with URL search params ?step=X
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (stepNum >= 1 && stepNum <= 3) {
        setStep(stepNum);
      }
    }
  }, [searchParams, setStep]);

  // 1. Step 1 React Hook Form
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isDirty: isDirtyStep1 },
    setValue: setValueStep1,
    watch: watchStep1,
  } = useForm({
    resolver: zodResolver(Step1Schema),
    values: {
      websiteUrl: websiteUrl || "",
      projectName: projectName || "",
      countryCode: countryCode || "VN",
      languageCode: languageCode || "vi",
      crawlBudget: crawlBudget || 100,
      userAgent: userAgent || "AI-SEO-Bot",
      crawlConcurrency: crawlConcurrency || 2,
      respectRobotsTxt: respectRobotsTxt !== undefined ? respectRobotsTxt : true,
      urlExclusionRules: urlExclusionRules || [],
    },
  });

  // 2. Step 2 React Hook Form
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isDirty: isDirtyStep2 },
    setValue: setValueStep2,
    watch: watchStep2,
  } = useForm({
    resolver: zodResolver(Step2Schema),
    values: {
      businessName: businessName || projectName || "",
      businessDescription: businessDescription || "",
      industry: industry || "",
      audience: audience || "",
      location: location || "",
      language: language || "vi",
      phone: phone || "",
      email: email || "",
      address: address || "",
      serviceAreas: serviceAreas || [],
      socialProfiles: socialProfiles || [],
      gscProperty: gscProperty || "",
      gbpLocation: gbpLocation || "",
    },
  });

  const isFormDirty = isDirtyStep1 || isDirtyStep2;

  // 3. Confirmation dialog on leaving if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có thực sự muốn rời đi?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);

  // --- Step Submit Handlers ---

  const onStep1Submit = async (formData: any) => {
    const data = formData as Step1Input;
    setSubmitting(true);
    setErrorText(null);
    try {
      // Nest (NEXT_PUBLIC_AI_SEO_USE_NEST=true) or BFF — via feature API layer
      const createdProject = await createSeoProjectFromWizard(selectedOrgId, {
        websiteUrl: data.websiteUrl,
        projectName: data.projectName,
        countryCode: data.countryCode,
        languageCode: data.languageCode,
        crawlBudget: data.crawlBudget,
        userAgent: data.userAgent,
        crawlConcurrency: data.crawlConcurrency,
        respectRobotsTxt: data.respectRobotsTxt,
        urlExclusionRules: data.urlExclusionRules,
      });

      updateFields({
        websiteUrl: data.websiteUrl,
        projectName: data.projectName,
        countryCode: data.countryCode,
        languageCode: data.languageCode,
        crawlBudget: data.crawlBudget,
        userAgent: data.userAgent,
        crawlConcurrency: data.crawlConcurrency,
        respectRobotsTxt: data.respectRobotsTxt,
        urlExclusionRules: data.urlExclusionRules,
        createdSeoProjectId: createdProject.id || createdProject.projectId,
      });

      setStep(2);
      router.push("?step=2");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setSubmitting(false);
    }
  };

  const onStep2Submit = async (formData: any) => {
    const data = formData as Step2Input;
    setSubmitting(true);
    setErrorText(null);
    try {
      if (!createdSeoProjectId) {
        throw new Error("Thiếu SEO project id. Vui lòng quay lại bước 1.");
      }

      await setupSeoProject(selectedOrgId, createdSeoProjectId, {
        ...data,
      });

      updateFields({
        businessName: data.businessName,
        businessDescription: data.businessDescription,
        industry: data.industry,
        audience: data.audience,
        location: data.location,
        language: data.language,
        phone: data.phone,
        email: data.email,
        address: data.address,
        serviceAreas: data.serviceAreas,
        socialProfiles: data.socialProfiles,
        gscProperty: data.gscProperty,
        gbpLocation: data.gbpLocation,
      });

      setStep(3);
      router.push("?step=3");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Đã xảy ra lỗi lưu cấu hình.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step 3 Actions ---

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckInstallation = async () => {
    if (!createdSeoProjectId) {
      updateFields({ installationStatus: "failed" });
      return;
    }
    updateFields({ installationStatus: "checking" });
    try {
      const data = await checkSeoInstallation(selectedOrgId, createdSeoProjectId);
      updateFields({
        installationStatus: data.installed
          ? "installed"
          : data.pixelTagState === "not_installed"
            ? "not_installed"
            : (data.status as "installed" | "not_installed" | "failed" | "checking") || "not_installed",
      });
    } catch (err) {
      console.error("Installation check trigger error:", err);
      updateFields({ installationStatus: "failed" });
    }
  };

  const handleCompleteWizard = () => {
    resetWizard();
    router.push("/otto?projectCreated=true");
  };

  // UI state variables
  const steps = [
    { num: 1, label: "Tên miền & Crawl", icon: Globe },
    { num: 2, label: "Hồ sơ Doanh nghiệp", icon: Building2 },
    { num: 3, label: "Cài đặt & Mã nhúng", icon: FileCode },
  ];

  // Nest uses Liora pixel; BFF/mock may still show OTTO-style snippet
  const scriptSnippet = isAiSeoNestApi()
    ? `<script data-liora-ai-seo-project="${createdSeoProjectId || "project-id"}"></script>`
    : `<script async src="https://api.otto-seo.com/sdk/${createdSeoProjectId || "project-id"}.js"></script>`;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full text-blue-100">
            OTTO SEO Automation
          </span>
          <h2 className="text-xl font-black">Thiết lập Dự án SEO mới</h2>
        </div>
        <Sparkles className="w-8 h-8 text-blue-200 animate-pulse hidden sm:block" />
      </div>

      {/* Progress Stepper UI */}
      <div className="px-6 py-5 border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-3">
        {steps.map((st, index) => {
          const isActive = currentStep === st.num;
          const isDone = currentStep > st.num;
          const StepIcon = st.icon;

          return (
            <React.Fragment key={st.num}>
              {index > 0 && (
                <div
                  className={`flex-1 h-0.5 rounded transition-all duration-300 ${
                    isDone ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                  }`}
                />
              )}
              <div
                onClick={() => isDone && setStep(st.num)}
                className={`flex items-center gap-2 cursor-pointer transition ${
                  isActive ? "text-blue-600 dark:text-blue-400" : isDone ? "text-emerald-500" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                      : isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold hidden md:inline">{st.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Error Notifications */}
      {errorText && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}

      {/* STEP 1: Select Website & Crawl Parameters */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmitStep1(onStep1Submit)} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Website URL */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Địa chỉ Website / Domain (websiteUrl)
              </label>
              <input
                type="text"
                placeholder="e.g. https://mywebsite.com"
                {...registerStep1("websiteUrl")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              />
              {errorsStep1.websiteUrl && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep1.websiteUrl.message}</p>
              )}
            </div>

            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tên dự án (projectName)
              </label>
              <input
                type="text"
                placeholder="e.g. Website Bán Hàng"
                {...registerStep1("projectName")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              />
              {errorsStep1.projectName && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep1.projectName.message}</p>
              )}
            </div>

            {/* User Agent */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User Agent định danh (userAgent)
              </label>
              <input
                type="text"
                {...registerStep1("userAgent")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              />
            </div>

            {/* Country Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quốc gia nhắm mục tiêu (countryCode)
              </label>
              <select
                {...registerStep1("countryCode")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              >
                <option value="VN">Việt Nam (VN)</option>
                <option value="US">Hoa Kỳ (US)</option>
                <option value="SG">Singapore (SG)</option>
              </select>
            </div>

            {/* Language Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ngôn ngữ (languageCode)
              </label>
              <select
                {...registerStep1("languageCode")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              >
                <option value="vi">Tiếng Việt (vi)</option>
                <option value="en">Tiếng Anh (en)</option>
              </select>
            </div>

            {/* Crawl Budget */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Giới hạn quét / Crawl Budget
              </label>
              <input
                type="number"
                {...registerStep1("crawlBudget")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              />
              {errorsStep1.crawlBudget && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep1.crawlBudget.message}</p>
              )}
            </div>

            {/* Crawl Concurrency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Độ song song quét (crawlConcurrency)
              </label>
              <input
                type="number"
                {...registerStep1("crawlConcurrency")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
              />
            </div>

            {/* Respect Robots.txt */}
            <div className="flex items-center gap-3 col-span-1 md:col-span-2 pt-2">
              <input
                type="checkbox"
                id="respectRobotsTxt"
                {...registerStep1("respectRobotsTxt")}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:bg-gray-850 dark:border-gray-700"
              />
              <label htmlFor="respectRobotsTxt" className="text-xs font-semibold text-gray-600 dark:text-gray-400 select-none">
                Tôn trọng tệp robots.txt của website (respectRobotsTxt)
              </label>
            </div>

            {/* URL Exclusion Rules (newline parsed text area) */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quy tắc loại trừ URL (urlExclusionRules - một dòng một quy tắc)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. /cart/*&#10;/admin/*"
                onChange={(e) => {
                  const lines = e.target.value.split("\n").filter((l) => l.trim() !== "");
                  setValueStep1("urlExclusionRules", lines);
                }}
                defaultValue={watchStep1("urlExclusionRules")?.join("\n")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white font-mono transition"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-6 flex justify-end border-t border-gray-100 dark:border-gray-850">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang kiểm tra quota...
                </>
              ) : (
                <>
                  Tiếp tục bước 2
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Business Profile & Google Integrations */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitStep2(onStep2Submit)} className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              1. Hồ sơ doanh nghiệp & Thực thể (Knowledge Graph)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Business Name */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tên doanh nghiệp (businessName)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Công ty Cổ phần TechSoft"
                  {...registerStep2("businessName")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
                {errorsStep2.businessName && (
                  <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep2.businessName.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mô tả doanh nghiệp / Sản phẩm (businessDescription)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ngành nghề kinh doanh, sản phẩm dịch vụ chủ đạo để AI viết nội dung..."
                  {...registerStep2("businessDescription")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lĩnh vực hoạt động (industry)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thương mại điện tử, SaaS"
                  {...registerStep2("industry")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khu vực địa lý hoạt động (location)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toàn quốc, Hà Nội"
                  {...registerStep2("location")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khách hàng mục tiêu (audience)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doanh nghiệp vừa và nhỏ, B2B"
                  {...registerStep2("audience")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-855 dark:text-white transition"
                />
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ngôn ngữ kinh doanh (language)
                </label>
                <select
                  {...registerStep2("language")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Số điện thoại liên hệ (phone)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0901234567"
                  {...registerStep2("phone")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email (email)
                </label>
                <input
                  type="text"
                  placeholder="e.g. contact@company.com"
                  {...registerStep2("email")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
                {errorsStep2.email && (
                  <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep2.email.message}</p>
                )}
              </div>

              {/* Address (At least 1 required) */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Địa chỉ doanh nghiệp (address - bắt buộc ít nhất 1 địa chỉ)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Đường Nguyễn Huệ, Quận 1, TP. HCM"
                  {...registerStep2("address")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                />
                {errorsStep2.address && (
                  <p className="text-xs font-semibold text-rose-500 mt-1">{errorsStep2.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              2. Tích hợp Google Console & GBP (Google Business Profile)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* GSC Property Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chọn Google Search Console Property
                </label>
                <select
                  {...registerStep2("gscProperty")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white transition"
                >
                  <option value="">-- Không đồng bộ / Đồng bộ sau --</option>
                  <option value="sc-domain:mywebsite.com">sc-domain:mywebsite.com</option>
                  <option value="https://mywebsite.com/">https://mywebsite.com/ (URL prefix)</option>
                </select>
              </div>

              {/* GBP Location Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chọn vị trí Google Business Profile
                </label>
                <select
                  {...registerStep2("gbpLocation")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-855 dark:text-white transition"
                >
                  <option value="">-- Không liên kết / Liên kết sau --</option>
                  <option value="loc-hcmc-hq">Văn phòng chính (Hồ Chí Minh)</option>
                  <option value="loc-hanoi-branch">Chi nhánh (Hà Nội)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-6 flex justify-between border-t border-gray-100 dark:border-gray-850">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                router.push("?step=1");
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu hồ sơ...
                </>
              ) : (
                <>
                  Tiếp tục bước 3
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Snippet Installation Code */}
      {currentStep === 3 && (
        <div className="p-6 md:p-8 space-y-8 animate-in zoom-in duration-300">
          <div className="space-y-2 text-center max-w-lg mx-auto">
            <h3 className="text-lg font-black text-gray-800 dark:text-white">
              Cài đặt Mã nhúng AI SEO SDK
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Nhúng đoạn mã sau vào thẻ <code>&lt;head&gt;</code> của trang web hoặc cài đặt thông qua plugin nền tảng để cho phép AI bắt đầu viết bài, tối ưu on-page và theo dõi.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-4">
              {[
                { type: "wordpress", label: "WordPress Setup" },
                { type: "cloudflare", label: "Cloudflare / DNS Setup" },
                { type: "custom_script", label: "Mã nhúng Custom HTML" },
              ].map((tab) => {
                const isActive = installationType === tab.type;
                return (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => updateFields({ installationType: tab.type as any })}
                    className={`pb-3.5 text-xs font-bold border-b-2 transition-all ${
                      isActive
                        ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-extrabold"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Installation Details based on Tab */}
          <div className="p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 space-y-4">
            {installationType === "wordpress" && (
              <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Các bước cài đặt trên WordPress:</p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Tải và kích hoạt plugin <strong>OTTO AI SEO Integration</strong> trên store WordPress.</li>
                  <li>Đi tới cài đặt plugin OTTO SEO trong admin dashboard.</li>
                  <li>
                    Copy mã API key sau đây và dán vào trường cấu hình:
                    <div className="mt-1.5 flex gap-2">
                      <code className="bg-gray-150 dark:bg-gray-800 px-2.5 py-1 rounded text-gray-700 dark:text-gray-300 font-mono text-[10px] break-all select-all">
                        {createdSeoProjectId || "project-uuid-key"}
                      </code>
                    </div>
                  </li>
                  <li>Nhấn lưu cài đặt trên WordPress để bắt đầu tích hợp.</li>
                </ol>
              </div>
            )}

            {installationType === "cloudflare" && (
              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-850 dark:text-gray-200">Thiết lập Proxy thông qua Cloudflare DNS:</p>
                <p>Kích hoạt proxy OTTO Cloudflare Worker cho phép AI tự động chèn siêu dữ liệu Meta và nội dung mới mà không cần can thiệp mã nguồn.</p>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Thêm bản ghi CNAME hoặc TXT định danh theo hướng dẫn DNS của bạn.</li>
                  <li>Kích hoạt Cloudflare Worker script nhúng tự động.</li>
                </ol>
              </div>
            )}

            {installationType === "custom_script" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Dán đoạn mã script này trước thẻ đóng <code>&lt;/head&gt;</code> của website:
                </p>
                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-gray-900 dark:bg-black/40 border border-gray-950 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all pr-12">
                    {scriptSnippet}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopyScript(scriptSnippet)}
                    className="absolute right-3.5 top-3.5 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Installation Checking Area */}
          <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-850 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              {installationStatus === "not_installed" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {installationStatus === "checking" && (
                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 shrink-0 animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
              )}
              {installationStatus === "installed" && (
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                </div>
              )}
              {installationStatus === "failed" && (
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertCircle className="w-5 h-5 fill-rose-500/10" />
                </div>
              )}

              <div className="text-left">
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">
                  Trạng thái tích hợp SDK
                </span>
                <span className="text-xs font-extrabold text-gray-850 dark:text-gray-200">
                  {installationStatus === "not_installed" && "Chưa kết nối mã nguồn"}
                  {installationStatus === "checking" && "Đang quét mã nguồn của bạn..."}
                  {installationStatus === "installed" && "Kết nối thành công! Đã tìm thấy SDK tag"}
                  {installationStatus === "failed" && "Không tìm thấy thẻ nhúng. Vui lòng kiểm tra lại"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckInstallation}
              disabled={installationStatus === "checking"}
              className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition text-xs font-bold shrink-0 disabled:opacity-50"
            >
              Quét kiểm tra (Verify)
            </button>
          </div>

          {/* Finish Actions */}
          <div className="pt-6 flex justify-between border-t border-gray-100 dark:border-gray-850">
            <button
              type="button"
              onClick={() => {
                setStep(2);
                router.push("?step=2");
              }}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại bước 2
            </button>
            
            <button
              type="button"
              onClick={handleCompleteWizard}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              Hoàn thành & Thoát
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default CreateProjectWizard;
