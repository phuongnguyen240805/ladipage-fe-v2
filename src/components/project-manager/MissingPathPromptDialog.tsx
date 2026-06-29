import type { MissingPathPrompt, ProjectI18nTranslate } from "./types";

interface MissingPathPromptDialogProps {
  prompt: MissingPathPrompt | null;
  t: ProjectI18nTranslate;
  saving: boolean;
  onCancel: () => void;
  onConfirmCreate: () => void;
}

export default function MissingPathPromptDialog({
  prompt,
  t,
  saving,
  onCancel,
  onConfirmCreate,
}: MissingPathPromptDialogProps) {
  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            {t({
              ko: "프로젝트 경로 확인",
              en: "Confirm Project Path",
              ja: "プロジェクトパス確認",
              zh: "确认项目路径",
            })}
          </h3>
        </div>
        <div className="space-y-2 px-4 py-4">
          <p className="text-sm text-slate-200">
            {t({
              ko: "해당 경로가 없습니다. 추가하시겠습니까?",
              en: "This path does not exist. Create it now?",
              ja: "このパスは存在しません。作成しますか？",
              zh: "该路径不存在。现在创建吗？",
            })}
          </p>
          <p className="break-all rounded-md border border-slate-700 bg-slate-800/70 px-2.5 py-2 text-xs text-slate-200">
            {prompt.normalizedPath}
          </p>
          {prompt.nearestExistingParent && (
            <p className="text-xs text-slate-400">
              {t({
                ko: `기준 폴더: ${prompt.nearestExistingParent}`,
                en: `Base folder: ${prompt.nearestExistingParent}`,
                ja: `基準フォルダ: ${prompt.nearestExistingParent}`,
                zh: `基准目录：${prompt.nearestExistingParent}`,
              })}
            </p>
          )}
          {!prompt.canCreate && (
            <p className="text-xs text-amber-300">
              {t({
                ko: "현재 권한으로 해당 경로를 생성할 수 없습니다. 다른 경로를 선택해주세요.",
                en: "This path is not creatable with current permissions. Choose another path.",
                ja: "現在の権限ではこのパスを作成できません。別のパスを指定してください。",
                zh: "当前权限无法创建此路径，请选择其他路径。",
              })}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-700 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            {t({ ko: "취소", en: "Cancel", ja: "キャンセル", zh: "取消" })}
          </button>
          <button
            type="button"
            disabled={!prompt.canCreate || saving}
            onClick={onConfirmCreate}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t({ ko: "예", en: "Yes", ja: "はい", zh: "是" })}
          </button>
        </div>
      </div>
    </div>
  );
}
