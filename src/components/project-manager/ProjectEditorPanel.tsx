import type { Dispatch, SetStateAction } from "react";
import { isApiRequestError, pickProjectPathNative, type ProjectDetailResponse } from "@/lib/claw-api";
import type { Agent, AssignmentMode, Department, Project } from "../../types";
import type {
  FormFeedback,
  ManualAssignmentWarning,
  MissingPathPrompt,
  ProjectI18nTranslate,
  ProjectManualSelectionStats,
} from "./types";
import ManualAssignmentSelector from "./ManualAssignmentSelector";

interface ProjectEditorPanelProps {
  t: ProjectI18nTranslate;
  language: string;
  isCreating: boolean;
  editingProjectId: string | null;
  selectedProject: Project | null;
  detail: ProjectDetailResponse | null;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  projectPath: string;
  setProjectPath: Dispatch<SetStateAction<string>>;
  coreGoal: string;
  setCoreGoal: Dispatch<SetStateAction<string>>;
  saving: boolean;
  canSave: boolean;
  pathToolsVisible: boolean;
  pathSuggestionsOpen: boolean;
  setPathSuggestionsOpen: Dispatch<SetStateAction<boolean>>;
  pathSuggestionsLoading: boolean;
  pathSuggestions: string[];
  missingPathPrompt: MissingPathPrompt | null;
  setMissingPathPrompt: Dispatch<SetStateAction<MissingPathPrompt | null>>;
  pathApiUnsupported: boolean;
  setPathApiUnsupported: Dispatch<SetStateAction<boolean>>;
  nativePathPicking: boolean;
  setNativePathPicking: Dispatch<SetStateAction<boolean>>;
  nativePickerUnsupported: boolean;
  setNativePickerUnsupported: Dispatch<SetStateAction<boolean>>;
  setManualPathPickerOpen: Dispatch<SetStateAction<boolean>>;
  loadManualPathEntries: (targetPath?: string) => Promise<void>;
  unsupportedPathApiMessage: string;
  resolvePathHelperErrorMessage: (err: unknown, fallback: { ko: string; en: string; ja: string; zh: string }) => string;
  formFeedback: FormFeedback | null;
  setFormFeedback: Dispatch<SetStateAction<FormFeedback | null>>;
  assignmentMode: AssignmentMode;
  setAssignmentMode: Dispatch<SetStateAction<AssignmentMode>>;
  setManualAssignmentWarning: Dispatch<SetStateAction<ManualAssignmentWarning | null>>;
  manualSelectionStats: ProjectManualSelectionStats;
  selectedAgentIds: Set<string>;
  setSelectedAgentIds: Dispatch<SetStateAction<Set<string>>>;
  agentFilterDept: string;
  setAgentFilterDept: Dispatch<SetStateAction<string>>;
  agents: Agent[];
  departments: Department[];
  spriteMap: Map<string, number>;
  onSave: () => void;
  onCancelEdit: () => void;
  onStartEditSelected: () => void;
  onDelete: () => void;
}

export default function ProjectEditorPanel({
  t,
  language,
  isCreating,
  editingProjectId,
  selectedProject,
  detail,
  name,
  setName,
  projectPath,
  setProjectPath,
  coreGoal,
  setCoreGoal,
  saving,
  canSave,
  pathToolsVisible,
  pathSuggestionsOpen,
  setPathSuggestionsOpen,
  pathSuggestionsLoading,
  pathSuggestions,
  missingPathPrompt,
  setMissingPathPrompt,
  pathApiUnsupported,
  setPathApiUnsupported,
  nativePathPicking,
  setNativePathPicking,
  nativePickerUnsupported,
  setNativePickerUnsupported,
  setManualPathPickerOpen,
  loadManualPathEntries,
  unsupportedPathApiMessage,
  resolvePathHelperErrorMessage,
  formFeedback,
  setFormFeedback,
  assignmentMode,
  setAssignmentMode,
  setManualAssignmentWarning,
  manualSelectionStats,
  selectedAgentIds,
  setSelectedAgentIds,
  agentFilterDept,
  setAgentFilterDept,
  agents,
  departments,
  spriteMap,
  onSave,
  onCancelEdit,
  onStartEditSelected,
  onDelete,
}: ProjectEditorPanelProps) {
  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <label className="block text-xs text-slate-400">
        {t({ ko: "프로젝트 이름", en: "Project Name", ja: "プロジェクト名", zh: "项目名称" })}
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setFormFeedback(null);
          }}
          disabled={!isCreating && !editingProjectId}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        />
      </label>
      <label className="block text-xs text-slate-400">
        {t({ ko: "프로젝트 경로", en: "Project Path", ja: "プロジェクトパス", zh: "项目路径" })}
        <input
          type="text"
          value={projectPath}
          onChange={(e) => {
            setProjectPath(e.target.value);
            setMissingPathPrompt(null);
            setFormFeedback(null);
          }}
          disabled={!isCreating && !editingProjectId}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        />
      </label>
      {pathToolsVisible && (
        <div className="space-y-2">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={pathApiUnsupported}
              onClick={() => {
                setFormFeedback(null);
                setManualPathPickerOpen(true);
                void loadManualPathEntries(projectPath.trim() || undefined);
              }}
              className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t({
                ko: "앱 내 폴더 탐색",
                en: "In-App Folder Browser",
                ja: "アプリ内フォルダ閲覧",
                zh: "应用内文件夹浏览",
              })}
            </button>
            <button
              type="button"
              disabled={pathApiUnsupported}
              onClick={() => {
                setFormFeedback(null);
                setPathSuggestionsOpen((prev) => !prev);
              }}
              className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pathSuggestionsOpen
                ? t({ ko: "자동 경로찾기 닫기", en: "Close Auto Finder", ja: "自動候補を閉じる", zh: "关闭自动查找" })
                : t({ ko: "자동 경로찾기", en: "Auto Path Finder", ja: "自動パス検索", zh: "自动路径查找" })}
            </button>
            <button
              type="button"
              disabled={nativePathPicking}
              onClick={async () => {
                setNativePickerUnsupported(false);
                setNativePathPicking(true);
                try {
                  const picked = await pickProjectPathNative();
                  if (picked.cancelled || !picked.path) return;
                  setProjectPath(picked.path);
                  setMissingPathPrompt(null);
                  setPathSuggestionsOpen(false);
                  setFormFeedback(null);
                } catch (err) {
                  console.error("Failed to open native path picker:", err);
                  if (isApiRequestError(err) && err.status === 404) {
                    setPathApiUnsupported(true);
                    setFormFeedback({ tone: "info", message: unsupportedPathApiMessage });
                  } else {
                    const message = resolvePathHelperErrorMessage(err, {
                      ko: "운영체제 폴더 선택기를 열지 못했습니다.",
                      en: "Failed to open OS folder picker.",
                      ja: "OSフォルダ選択を開けませんでした。",
                      zh: "无法打开系统文件夹选择器。",
                    });
                    if (
                      isApiRequestError(err) &&
                      (err.code === "native_picker_unavailable" || err.code === "native_picker_failed")
                    ) {
                      setNativePickerUnsupported(true);
                      setManualPathPickerOpen(true);
                      await loadManualPathEntries(projectPath.trim() || undefined);
                      setFormFeedback({ tone: "info", message });
                    } else {
                      setFormFeedback({ tone: "error", message });
                    }
                  }
                } finally {
                  setNativePathPicking(false);
                }
              }}
              className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {nativePathPicking
                ? t({
                    ko: "수동 경로찾기 여는 중...",
                    en: "Opening Manual Picker...",
                    ja: "手動パス選択を開いています...",
                    zh: "正在打开手动路径选择...",
                  })
                : nativePickerUnsupported
                  ? t({
                      ko: "수동 경로찾기(사용불가)",
                      en: "Manual Path Finder (Unavailable)",
                      ja: "手動パス選択（利用不可）",
                      zh: "手动路径选择（不可用）",
                    })
                  : t({ ko: "수동 경로찾기", en: "Manual Path Finder", ja: "手動パス選択", zh: "手动路径选择" })}
            </button>
          </div>
          {pathSuggestionsOpen && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/70">
              {pathSuggestionsLoading ? (
                <p className="px-3 py-2 text-xs text-slate-400">
                  {t({
                    ko: "경로 후보를 불러오는 중...",
                    en: "Loading path suggestions...",
                    ja: "パス候補を読み込み中...",
                    zh: "正在加载路径候选...",
                  })}
                </p>
              ) : pathSuggestions.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">
                  {t({
                    ko: "추천 경로가 없습니다. 직접 입력해주세요.",
                    en: "No suggested path. Enter one manually.",
                    ja: "候補パスがありません。手入力してください。",
                    zh: "没有推荐路径，请手动输入。",
                  })}
                </p>
              ) : (
                pathSuggestions.map((candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => {
                      setProjectPath(candidate);
                      setMissingPathPrompt(null);
                      setPathSuggestionsOpen(false);
                      setFormFeedback(null);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-slate-700/70"
                  >
                    {candidate}
                  </button>
                ))
              )}
            </div>
          )}
          {missingPathPrompt && (
            <p className="text-xs text-amber-300">
              {t({
                ko: "해당 경로가 아직 존재하지 않습니다. 저장 시 생성 여부를 확인합니다.",
                en: "This path does not exist yet. Save will ask whether to create it.",
                ja: "このパスはまだ存在しません。保存時に作成確認を行います。",
                zh: "该路径尚不存在，保存时会先确认是否创建。",
              })}
            </p>
          )}
        </div>
      )}
      {formFeedback && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            formFeedback.tone === "error"
              ? "border-rose-500/60 bg-rose-500/10 text-rose-800 dark:text-rose-200"
              : "border-cyan-500/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-100"
          }`}
        >
          {formFeedback.message}
        </div>
      )}
      <label className="block text-xs text-slate-400">
        {t({ ko: "핵심 목표", en: "Core Goal", ja: "コア目標", zh: "核心目标" })}
        <textarea
          rows={5}
          value={coreGoal}
          onChange={(e) => {
            setCoreGoal(e.target.value);
            setFormFeedback(null);
          }}
          disabled={!isCreating && !editingProjectId}
          className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        />
      </label>

      <ManualAssignmentSelector
        t={t}
        language={language}
        isCreating={isCreating}
        editingProjectId={editingProjectId}
        assignmentMode={assignmentMode}
        setAssignmentMode={setAssignmentMode}
        setManualAssignmentWarning={setManualAssignmentWarning}
        manualSelectionStats={manualSelectionStats}
        selectedAgentIds={selectedAgentIds}
        setSelectedAgentIds={setSelectedAgentIds}
        agentFilterDept={agentFilterDept}
        setAgentFilterDept={setAgentFilterDept}
        departments={departments}
        agents={agents}
        spriteMap={spriteMap}
        detail={detail}
        selectedProject={selectedProject}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        {(isCreating || !!editingProjectId) && (
          <button
            type="button"
            onClick={() => {
              onSave();
            }}
            disabled={!canSave || saving}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {editingProjectId
              ? t({ ko: "수정 저장", en: "Save", ja: "保存", zh: "保存" })
              : t({ ko: "프로젝트 등록", en: "Create", ja: "作成", zh: "创建" })}
          </button>
        )}
        {(isCreating || !!editingProjectId) && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
          >
            {t({ ko: "취소", en: "Cancel", ja: "キャンセル", zh: "取消" })}
          </button>
        )}
        <button
          type="button"
          onClick={onStartEditSelected}
          disabled={!selectedProject || isCreating || !!editingProjectId}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40"
        >
          {t({ ko: "선택 프로젝트 편집", en: "Edit Selected", ja: "選択編集", zh: "编辑选中项" })}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!selectedProject}
          className="rounded-lg border border-red-700/70 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
        >
          {t({ ko: "삭제", en: "Delete", ja: "削除", zh: "删除" })}
        </button>
      </div>
    </div>
  );
}
