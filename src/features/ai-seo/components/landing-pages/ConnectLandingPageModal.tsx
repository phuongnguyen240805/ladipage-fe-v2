import React, { useEffect, useState } from "react";
import { X, Globe, Library, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useWebsiteProjectsQuery,
  useWebsitePagesQuery,
  useLinkLandingPageMutation
} from "../../hooks/useLandingPageQueries";

interface ConnectLandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  orgId?: string;
}

const externalSchema = z.object({
  pageUrl: z.string()
    .min(1, { message: "Đường dẫn URL là bắt buộc" })
    .url({ message: "Cung cấp một URL hợp lệ như https://example.com" }),
});

export function ConnectLandingPageModal({
  isOpen,
  onClose,
  projectId,
  orgId = "org-1"
}: ConnectLandingPageModalProps) {
  const [sourceType, setSourceType] = useState<"internal" | "external">("internal");
  const [selectedWebsiteProjectId, setSelectedWebsiteProjectId] = useState<string>("");
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries
  const {
    data: websiteProjects,
    isLoading: loadingProjects,
    isError: projectsError,
    error: projectsQueryError,
  } = useWebsiteProjectsQuery(orgId);
  const {
    data: websitePages,
    isLoading: loadingPages,
    isError: pagesError,
    error: pagesQueryError,
  } = useWebsitePagesQuery(orgId, selectedWebsiteProjectId);

  useEffect(() => {
    if (!isOpen) {
      setSourceType("internal");
      setSelectedWebsiteProjectId("");
      setSelectedPageId("");
      setSubmitError(null);
      return;
    }

    if (!websiteProjects?.length || selectedWebsiteProjectId) return;

    const builderProject =
      websiteProjects.find((proj) => proj.name.includes("Landing Page Builder")) ??
      websiteProjects.find((proj) => proj.domain === "builder-pages.local") ??
      websiteProjects[0];

    if (builderProject) {
      setSelectedWebsiteProjectId(builderProject.id);
    }
  }, [isOpen, websiteProjects, selectedWebsiteProjectId]);

  // Mutation
  const linkMutation = useLinkLandingPageMutation(orgId, projectId);

  // Form for external URL
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(externalSchema),
    defaultValues: { pageUrl: "" }
  });

  if (!isOpen) return null;

  const handleLinkInternal = async () => {
    if (!selectedPageId) {
      setSubmitError("Vui lòng chọn một trang Landing Page");
      return;
    }
    const page = websitePages?.find(p => p.id === selectedPageId);
    if (!page) return;

    setSubmitError(null);
    try {
      await linkMutation.mutateAsync({
        pageUrl: page.published_url || page.page_url,
        websitePageId: page.id,
        source: "internal"
      });
      onClose();
      setSelectedWebsiteProjectId("");
      setSelectedPageId("");
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi kết nối trang.");
    }
  };

  const handleLinkExternal = async (data: { pageUrl: string }) => {
    setSubmitError(null);
    try {
      await linkMutation.mutateAsync({
        pageUrl: data.pageUrl,
        websitePageId: null,
        source: "external"
      });
      reset();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi kết nối trang.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-99999 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Kết nối Landing Page</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Liên kết trang Landing Page để AI SEO theo dõi và chấm điểm</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-850 mx-6 mt-6 rounded-xl">
          <button
            onClick={() => { setSourceType("internal"); setSubmitError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition duration-150 cursor-pointer select-none ${
              sourceType === "internal"
                ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200"
            }`}
          >
            <Library className="w-4 h-4" />
            Website Builder
          </button>
          <button
            onClick={() => { setSourceType("external"); setSubmitError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition duration-150 cursor-pointer select-none ${
              sourceType === "external"
                ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" />
            URL bên ngoài
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {submitError && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 font-bold animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {sourceType === "internal" ? (
            <div className="space-y-4">
              {/* Project select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Dự án Website Builder
                </label>
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-lime-500" />
                  </div>
                ) : projectsError ? (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs px-4 py-3 rounded-xl">
                    {(projectsQueryError as Error)?.message || "Không thể tải danh sách dự án Website Builder."}
                  </div>
                ) : !websiteProjects?.length ? (
                  <div className="bg-slate-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-slate-500 dark:text-slate-400 text-xs px-4 py-3 rounded-xl">
                    Chưa có trang nào trong Landing Page Builder. Hãy tạo landing page tại mục Landing Pages trước.
                  </div>
                ) : (
                  <select
                    value={selectedWebsiteProjectId}
                    onChange={(e) => {
                      setSelectedWebsiteProjectId(e.target.value);
                      setSelectedPageId("");
                    }}
                    className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition cursor-pointer"
                  >
                    <option value="">-- Chọn dự án website --</option>
                    {websiteProjects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.domain})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Page select */}
              {selectedWebsiteProjectId && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Trang Landing Page con
                  </label>
                  {loadingPages ? (
                    <div className="flex items-center justify-center py-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-lime-500" />
                    </div>
                  ) : pagesError ? (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs px-4 py-3 rounded-xl">
                      {(pagesQueryError as Error)?.message || "Không thể tải danh sách landing page."}
                    </div>
                  ) : !websitePages?.length ? (
                    <div className="bg-slate-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-slate-500 dark:text-slate-400 text-xs px-4 py-3 rounded-xl">
                      Dự án này chưa có landing page nào. Tạo trang mới tại mục Landing Pages.
                    </div>
                  ) : (
                    <select
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-lime-400 focus:ring-2 focus:ring-lime-50 dark:focus:ring-lime-950/20 transition cursor-pointer"
                    >
                      <option value="">-- Chọn trang con --</option>
                      {websitePages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.title} ({page.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Status Warning if draft */}
              {selectedPageId && websitePages?.find(p => p.id === selectedPageId)?.status === "draft" && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-805 dark:text-amber-350 text-xs px-4 py-3.5 rounded-xl flex gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Trang chưa được xuất bản!</span>
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 block mt-0.5">
                      Trang này đang ở trạng thái bản nháp. Bạn vẫn có thể liên kết nó, nhưng cần xuất bản trước khi chạy quét SEO.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleLinkInternal}
                  disabled={linkMutation.isPending || !selectedPageId}
                  className="w-full bg-lime-500 text-white font-semibold text-xs py-3 rounded-lg hover:bg-lime-600 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Kết nối Landing Page
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleLinkExternal)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Đường dẫn Landing Page URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://example.com/landing-page"
                    {...register("pageUrl")}
                    className={`w-full bg-white dark:bg-gray-950 border ${
                      errors.pageUrl ? "border-rose-450 focus:ring-rose-100" : "border-gray-250 dark:border-gray-800 focus:border-lime-400 focus:ring-lime-50 dark:focus:ring-lime-950/20"
                    } rounded-lg px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:border-transparent transition`}
                  />
                </div>
                {errors.pageUrl && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1.5 animate-fadeIn">
                    {errors.pageUrl.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={linkMutation.isPending}
                  className="w-full bg-lime-500 text-white font-semibold text-xs py-3 rounded-lg hover:bg-lime-600 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 select-none cursor-pointer"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4" />
                      Kết nối Landing Page
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ConnectLandingPageModal;
