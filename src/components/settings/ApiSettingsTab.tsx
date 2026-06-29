import { useState } from "react";
import { API_TYPE_PRESETS } from "./constants";
import ApiAssignModal from "./ApiAssignModal";
import type { ApiStateBundle, TFunction } from "./types";
import { DEFAULT_API_FORM } from "./useApiProvidersState";

interface ApiSettingsTabProps {
  t: TFunction;
  localeTag: string;
  apiState: ApiStateBundle;
}

export default function ApiSettingsTab({ t, localeTag, apiState }: ApiSettingsTabProps) {
  const {
    apiProviders,
    apiProvidersLoading,
    apiOfficialPresets,
    apiPresetsLoading,
    apiAddMode,
    apiEditingId,
    apiForm,
    apiSaving,
    apiSaveError,
    apiTesting,
    apiTestResult,
    apiModelsExpanded,
    setApiAddMode,
    setApiEditingId,
    setApiForm,
    setApiSaveError,
    setApiModelsExpanded,
    loadApiProviders,
    loadApiPresets,
    handleApiProviderSave,
    handleApiProviderDelete,
    handleApiProviderTest,
    handleApiProviderToggle,
    handleApiEditStart,
    handleApiModelAssign,
  } = apiState;

  const [modelSearchQueries, setModelSearchQueries] = useState<Record<string, string>>({});
  const selectedOfficialPreset = apiForm.preset_key ? apiOfficialPresets[apiForm.preset_key] : null;
  const isOfficialPresetSelected = Boolean(apiForm.preset_key);

  function resetForm(): void {
    setApiAddMode(false);
    setApiEditingId(null);
    setApiSaveError(null);
    setApiForm(DEFAULT_API_FORM);
  }

  function openAddMode(): void {
    setApiAddMode(true);
    setApiEditingId(null);
    setApiSaveError(null);
    setApiForm(DEFAULT_API_FORM);
  }

  return (
    <>
      <section className="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            {t({ ko: "API 프로바이더", en: "API Providers", ja: "API プロバイダー", zh: "API 提供方" })}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void Promise.all([loadApiProviders(), loadApiPresets()]);
              }}
              disabled={apiProvidersLoading || apiPresetsLoading}
              className="text-xs text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
            >
              {t({ ko: "새로고침", en: "Refresh", ja: "更新", zh: "刷新" })}
            </button>
            {!apiAddMode && (
              <button
                onClick={openAddMode}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
              >
                + {t({ ko: "추가", en: "Add", ja: "追加", zh: "添加" })}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          {t({
            ko: "로컬 모델, 프론티어 모델, 기타 호환 서비스용 API를 등록해 에이전트에 직접 연결할 수 있습니다.",
            en: "Register local, frontier, and compatible third-party APIs, then assign those models directly to agents.",
            ja: "ローカルモデルや先端モデル、互換サービスの API を登録してエージェントへ直接割り当てられます。",
            zh: "可注册本地模型、前沿模型和兼容第三方服务的 API，并将模型直接分配给代理。",
          })}
        </p>

        {apiAddMode && (
          <div className="space-y-3 rounded-lg border border-blue-500/30 bg-slate-900/50 p-4">
            <h4 className="text-xs font-semibold uppercase text-blue-400">
              {apiEditingId
                ? t({ ko: "프로바이더 수정", en: "Edit Provider", ja: "プロバイダー編集", zh: "编辑提供方" })
                : t({
                    ko: "새 프로바이더 추가",
                    en: "Add New Provider",
                    ja: "新しいプロバイダーを追加",
                    zh: "添加新提供方",
                  })}
            </h4>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                {t({ ko: "공식 프리셋", en: "Official Presets", ja: "公式プリセット", zh: "官方预设" })}
              </label>
              <p className="mb-2 text-[11px] text-slate-500">
                {t({
                  ko: "OpenCode Go와 Bailian Coding Plan용 공식 프리셋입니다.",
                  en: "Official presets for OpenCode Go and Bailian Coding Plan.",
                  ja: "OpenCode Go と Bailian Coding Plan 向けの公式プリセットです。",
                  zh: "适用于 OpenCode Go 与 Bailian Coding Plan 的官方预设。",
                })}
              </p>

              {apiPresetsLoading ? (
                <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-500">
                  {t({
                    ko: "프리셋 불러오는 중...",
                    en: "Loading presets...",
                    ja: "プリセットを読み込み中...",
                    zh: "正在加载预设...",
                  })}
                </div>
              ) : Object.keys(apiOfficialPresets).length === 0 ? (
                <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-500">
                  {t({
                    ko: "공식 프리셋을 불러오지 못했습니다.",
                    en: "Official presets could not be loaded.",
                    ja: "公式プリセットを読み込めませんでした。",
                    zh: "无法加载官方预设。",
                  })}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(apiOfficialPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setApiSaveError(null);
                        setApiForm((prev) => ({
                          ...prev,
                          preset_key: key,
                          name: preset.label,
                          type: preset.type,
                          base_url: preset.base_url,
                        }));
                      }}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                        apiForm.preset_key === key
                          ? "border-blue-500/60 bg-blue-600/15"
                          : "border-slate-700/40 bg-slate-900/40 hover:border-slate-500/60 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{preset.label}</span>
                        <span className="rounded bg-slate-800/70 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                          {preset.type}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">{preset.description}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">{preset.base_url}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedOfficialPreset && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-blue-300">{selectedOfficialPreset.label}</div>
                  <a
                    href={selectedOfficialPreset.docs_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    {t({ ko: "문서 열기", en: "Open docs", ja: "ドキュメントを開く", zh: "打开文档" })}
                  </a>
                </div>
                <div className="mt-2 text-[11px] text-slate-300">{selectedOfficialPreset.api_key_hint}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedOfficialPreset.fallback_models.map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-blue-500/20 bg-slate-950/40 px-2 py-0.5 text-[10px] font-mono text-blue-200"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                {t({ ko: "일반 타입", en: "Generic Type", ja: "汎用タイプ", zh: "通用类型" })}
              </label>
              <p className="mb-2 text-[11px] text-slate-500">
                {isOfficialPresetSelected
                  ? t({
                      ko: "일반 타입을 선택하면 프리셋 잠금이 해제됩니다.",
                      en: "Choose a generic type to leave preset mode and unlock manual editing.",
                      ja: "汎用タイプを選ぶとプリセット固定が解除されます。",
                      zh: "选择通用类型即可退出预设模式并解锁手动编辑。",
                    })
                  : t({
                      ko: "프로토콜과 Base URL을 직접 설정하려면 일반 타입을 사용하세요.",
                      en: "Use a generic type when you want to manage protocol and Base URL yourself.",
                      ja: "プロトコルと Base URL を手動設定する場合は汎用タイプを使います。",
                      zh: "如果要自己管理协议与 Base URL，请使用通用类型。",
                    })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(API_TYPE_PRESETS) as Array<
                    [keyof typeof API_TYPE_PRESETS, { label: string; base_url: string }]
                  >
                ).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setApiSaveError(null);
                      setApiForm((prev) => ({
                        ...prev,
                        preset_key: null,
                        type: key,
                        base_url: preset.base_url || prev.base_url,
                        name: prev.name || preset.label,
                      }));
                    }}
                    className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                      !apiForm.preset_key && apiForm.type === key
                        ? "border-blue-500/50 bg-blue-600/30 text-blue-300"
                        : "border-slate-600/30 bg-slate-700/30 text-slate-400 hover:border-slate-500/50 hover:text-slate-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                {t({ ko: "이름", en: "Name", ja: "名前", zh: "名称" })}
              </label>
              <input
                type="text"
                value={apiForm.name}
                onChange={(e) => {
                  setApiSaveError(null);
                  setApiForm((prev) => ({ ...prev, name: e.target.value }));
                }}
                placeholder={t({
                  ko: "예: My OpenAI",
                  en: "e.g. My OpenAI",
                  ja: "例: My OpenAI",
                  zh: "例如：My OpenAI",
                })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Base URL</label>
              <input
                type="text"
                value={apiForm.base_url}
                onChange={(e) => {
                  setApiSaveError(null);
                  setApiForm((prev) => ({ ...prev, base_url: e.target.value }));
                }}
                placeholder="https://api.openai.com/v1"
                readOnly={isOfficialPresetSelected}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none ${
                  isOfficialPresetSelected
                    ? "border-blue-500/20 bg-slate-800/70 text-slate-300"
                    : "border-slate-600 bg-slate-700/50"
                }`}
              />
              {isOfficialPresetSelected && (
                <p className="mt-1 text-[11px] text-slate-500">
                  {t({
                    ko: "선택한 프리셋이 프로토콜과 Base URL을 관리합니다.",
                    en: "The selected preset manages the protocol and Base URL.",
                    ja: "選択したプリセットがプロトコルと Base URL を管理します。",
                    zh: "所选预设会管理协议与 Base URL。",
                  })}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                API Key{" "}
                {!selectedOfficialPreset && apiForm.type === "ollama" && (
                  <span className="text-slate-600">
                    (
                    {t({
                      ko: "로컬 환경에서는 보통 필요하지 않음",
                      en: "usually not needed for local",
                      ja: "ローカルでは通常不要",
                      zh: "本地环境通常不需要",
                    })}
                    )
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiForm.api_key}
                onChange={(e) => {
                  setApiSaveError(null);
                  setApiForm((prev) => ({ ...prev, api_key: e.target.value }));
                }}
                placeholder={
                  apiEditingId
                    ? t({
                        ko: "변경하려면 입력 (빈값=유지)",
                        en: "Enter to change (blank=keep)",
                        ja: "変更する場合のみ入力 (空欄=維持)",
                        zh: "仅在修改时输入（留空=保持）",
                      })
                    : (selectedOfficialPreset?.api_key_placeholder ?? "sk-...")
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
              />
              {selectedOfficialPreset && (
                <p className="mt-1 text-[11px] text-slate-500">{selectedOfficialPreset.api_key_hint}</p>
              )}
            </div>

            {apiSaveError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                {apiSaveError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleApiProviderSave()}
                disabled={apiSaving || !apiForm.name.trim() || !apiForm.base_url.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {apiSaving
                  ? t({ ko: "저장 중...", en: "Saving...", ja: "保存中...", zh: "保存中..." })
                  : apiEditingId
                    ? t({ ko: "수정", en: "Update", ja: "更新", zh: "更新" })
                    : t({ ko: "추가", en: "Add", ja: "追加", zh: "添加" })}
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600"
              >
                {t({ ko: "취소", en: "Cancel", ja: "キャンセル", zh: "取消" })}
              </button>
            </div>
          </div>
        )}

        {apiProvidersLoading ? (
          <div className="animate-pulse py-4 text-center text-xs text-slate-500">
            {t({ ko: "불러오는 중...", en: "Loading...", ja: "読み込み中...", zh: "加载中..." })}
          </div>
        ) : apiProviders.length === 0 && !apiAddMode ? (
          <div className="py-6 text-center text-xs text-slate-500">
            {t({
              ko: "등록된 API 프로바이더가 없습니다. 위의 + 추가 버튼으로 시작하세요.",
              en: "No API providers registered. Click + Add above to get started.",
              ja: "API プロバイダーがありません。上の + Add から始めてください。",
              zh: "还没有注册 API 提供方。点击上方的 + Add 开始。",
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {apiProviders.map((provider) => {
              const testResult = apiTestResult[provider.id];
              const isExpanded = apiModelsExpanded[provider.id];
              const searchQuery = (modelSearchQueries[provider.id] || "").trim().toLowerCase();
              const filteredModels = isExpanded
                ? provider.models_cache.filter((m) => (searchQuery ? m.toLowerCase().includes(searchQuery) : true))
                : [];
              const presetLabel = provider.preset_key
                ? (apiOfficialPresets[provider.preset_key]?.label ?? provider.preset_key)
                : null;

              return (
                <div
                  key={provider.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    provider.enabled
                      ? "border-slate-600/50 bg-slate-800/40"
                      : "border-slate-700/30 bg-slate-900/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${
                          provider.enabled ? "bg-emerald-400" : "bg-slate-600"
                        }`}
                      />
                      <span className="truncate text-sm font-medium text-white">{provider.name}</span>
                      <span className="flex-shrink-0 rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                        {provider.type}
                      </span>
                      {presetLabel && (
                        <span className="flex-shrink-0 rounded border border-blue-500/20 bg-blue-600/20 px-1.5 py-0.5 text-[10px] text-blue-300">
                          {presetLabel}
                        </span>
                      )}
                      {provider.has_api_key && <span className="flex-shrink-0 text-[10px] text-emerald-400">key</span>}
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => void handleApiProviderTest(provider.id)}
                        disabled={apiTesting === provider.id}
                        className="rounded border border-cyan-500/30 bg-cyan-600/20 px-2 py-1 text-[10px] text-cyan-400 transition-colors hover:bg-cyan-600/30 disabled:opacity-50"
                        title={t({ ko: "연결 테스트", en: "Test Connection", ja: "接続テスト", zh: "连接测试" })}
                      >
                        {apiTesting === provider.id ? "..." : t({ ko: "테스트", en: "Test", ja: "テスト", zh: "测试" })}
                      </button>
                      <button
                        onClick={() => handleApiEditStart(provider)}
                        className="rounded border border-slate-500/30 bg-slate-600/30 px-2 py-1 text-[10px] text-slate-400 transition-colors hover:bg-slate-600/50 hover:text-slate-200"
                      >
                        {t({ ko: "수정", en: "Edit", ja: "編集", zh: "编辑" })}
                      </button>
                      <button
                        onClick={() => void handleApiProviderToggle(provider.id, provider.enabled)}
                        className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                          provider.enabled
                            ? "border-amber-500/30 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
                            : "border-emerald-500/30 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                        }`}
                      >
                        {provider.enabled
                          ? t({ ko: "비활성화", en: "Disable", ja: "無効化", zh: "禁用" })
                          : t({ ko: "활성화", en: "Enable", ja: "有効化", zh: "启用" })}
                      </button>
                      <button
                        onClick={() => void handleApiProviderDelete(provider.id)}
                        className="rounded border border-red-500/30 bg-red-600/20 px-2 py-1 text-[10px] text-red-400 transition-colors hover:bg-red-600/30"
                      >
                        {t({ ko: "삭제", en: "Delete", ja: "削除", zh: "删除" })}
                      </button>
                    </div>
                  </div>

                  <div className="mt-1.5 truncate text-[11px] font-mono text-slate-500">{provider.base_url}</div>

                  {testResult && (
                    <div
                      className={`mt-2 rounded px-2.5 py-1.5 text-[11px] ${
                        testResult.ok
                          ? "border border-green-500/20 bg-green-500/10 text-green-400"
                          : "border border-red-500/20 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {testResult.msg}
                    </div>
                  )}

                  {provider.models_cache && provider.models_cache.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setApiModelsExpanded((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="text-[11px] text-slate-400 transition-colors hover:text-slate-200"
                      >
                        {isExpanded ? "-" : "+"}{" "}
                        {t({ ko: "모델 목록", en: "Models", ja: "モデル一覧", zh: "模型列表" })} (
                        {provider.models_cache.length})
                        {provider.models_cached_at && (
                          <span className="ml-1 text-slate-600">
                            {new Date(provider.models_cached_at).toLocaleString(localeTag, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            placeholder={t({
                              ko: "모델 검색...",
                              en: "Search models...",
                              ja: "モデル検索...",
                              zh: "搜索模型...",
                            })}
                            aria-label={t({
                              ko: "모델 검색",
                              en: "Search models",
                              ja: "モデルを検索",
                              zh: "搜索模型",
                            })}
                            value={modelSearchQueries[provider.id] || ""}
                            onChange={(e) =>
                              setModelSearchQueries((prev) => ({ ...prev, [provider.id]: e.target.value }))
                            }
                            className="w-full rounded border border-slate-600 bg-slate-800/70 px-2 py-1 text-[11px] text-white focus:border-blue-500 focus:outline-none"
                          />
                          <div className="max-h-48 overflow-y-auto rounded border border-slate-700/30 bg-slate-900/40 p-2">
                            {filteredModels.map((model) => (
                              <div
                                key={model}
                                className="flex items-center justify-between text-[11px] font-mono text-slate-400 py-0.5 group/model hover:bg-slate-700/30 rounded px-1 -mx-1"
                              >
                                <span className="truncate">{model}</span>
                                <button
                                  onClick={() => void handleApiModelAssign(provider.id, model)}
                                  className="text-[9px] px-1.5 py-0.5 bg-blue-600/60 hover:bg-blue-500 text-blue-200 rounded opacity-0 group-hover/model:opacity-100 transition-opacity whitespace-nowrap ml-2"
                                  title={t({
                                    ko: "에이전트에 배정",
                                    en: "Assign to agent",
                                    ja: "エージェントに割り当て",
                                    zh: "分配给代理",
                                  })}
                                >
                                  {t({ ko: "배정", en: "Assign", ja: "割当", zh: "分配" })}
                                </button>
                              </div>
                            ))}
                            {filteredModels.length === 0 && (
                              <div className="text-[11px] text-slate-500 text-center py-2">
                                {t({ ko: "검색 결과 없음", en: "No results", ja: "結果なし", zh: "无结果" })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ApiAssignModal t={t} localeTag={localeTag} apiState={apiState} />
    </>
  );
}
