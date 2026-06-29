import { CONNECTABLE_PROVIDERS } from "./constants";
import type { OAuthConnectCardProps } from "./types";

export default function OAuthConnectCards({
  t,
  oauthStatus,
  deviceCode,
  deviceStatus,
  deviceError,
  onConnect,
  onStartDeviceCodeFlow,
}: OAuthConnectCardProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {t({
          ko: "OAuth 계정 추가",
          en: "Add OAuth Account",
          ja: "OAuth アカウント追加",
          zh: "添加 OAuth 账号",
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CONNECTABLE_PROVIDERS.map(({ id, label, Logo, description }) => {
          const providerInfo = oauthStatus.providers[id];
          const isConnected = Boolean(providerInfo?.executionReady ?? providerInfo?.connected);
          const isDetectedOnly = Boolean(providerInfo?.detected) && !isConnected;
          const storageOk = oauthStatus.storageReady;
          const isGitHub = id === "github-copilot";

          return (
            <div
              key={id}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                isConnected
                  ? "bg-green-500/5 border-green-500/30"
                  : isDetectedOnly
                    ? "bg-amber-500/5 border-amber-500/30"
                    : storageOk
                      ? "bg-slate-700/30 border-slate-600/50 hover:border-blue-400/50 hover:bg-slate-700/50"
                      : "bg-slate-800/30 border-slate-700/30 opacity-50"
              }`}
            >
              <Logo className="w-8 h-8" />
              <span className="text-sm font-medium text-white">{label}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight">{description}</span>

              {!storageOk ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                  {t({
                    ko: "암호화 키 필요",
                    en: "Encryption key required",
                    ja: "暗号化キーが必要",
                    zh: "需要加密密钥",
                  })}
                </span>
              ) : (
                <>
                  {isConnected ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 font-medium">
                      {t({ ko: "실행 가능", en: "Runnable", ja: "実行可能", zh: "可执行" })}
                    </span>
                  ) : isDetectedOnly ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-medium">
                      {t({ ko: "감지됨", en: "Detected", ja: "検出済み", zh: "已检测" })}
                    </span>
                  ) : null}

                  {isGitHub ? (
                    deviceCode && deviceStatus === "polling" ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="text-xs text-slate-300 font-mono bg-slate-700/60 px-3 py-1.5 rounded-lg tracking-widest select-all">
                          {deviceCode.userCode}
                        </div>
                        <span className="text-[10px] text-blue-400 animate-pulse">
                          {t({
                            ko: "코드 입력 대기 중...",
                            en: "Waiting for code...",
                            ja: "コード入力待機中...",
                            zh: "等待输入代码...",
                          })}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => void onStartDeviceCodeFlow()}
                        className="text-[11px] px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                      >
                        {isConnected || isDetectedOnly
                          ? t({ ko: "계정 추가", en: "Add Account", ja: "アカウント追加", zh: "添加账号" })
                          : t({ ko: "연결하기", en: "Connect", ja: "接続", zh: "连接" })}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onConnect(id)}
                      className="text-[11px] px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                    >
                      {isConnected || isDetectedOnly
                        ? t({ ko: "계정 추가", en: "Add Account", ja: "アカウント追加", zh: "添加账号" })
                        : t({ ko: "연결하기", en: "Connect", ja: "接続", zh: "连接" })}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {deviceStatus === "complete" && (
        <div className="space-y-1.5">
          <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
            {t({ ko: "GitHub 연결 완료!", en: "GitHub connected!", ja: "GitHub 接続完了!", zh: "GitHub 已连接!" })}
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-lg">
            {t({
              ko: "Copilot 구독이 있으면 AI 모델을 사용할 수 있고, 없어도 프로젝트 관리의 GitHub 리포 가져오기 기능은 정상 작동합니다.",
              en: "With a Copilot subscription you can use AI models. Without it, GitHub repo import in Project Manager still works.",
              ja: "Copilot サブスクリプションがあれば AI モデルを利用できます。なくてもプロジェクト管理の GitHub リポインポートは利用可能です。",
              zh: "有 Copilot 订阅可使用 AI 模型；没有订阅也可正常使用项目管理的 GitHub 仓库导入功能。",
            })}
          </div>
        </div>
      )}

      {deviceError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {deviceError}
        </div>
      )}
    </div>
  );
}
