import { useEffect, useState } from "react";
import * as api from "@/lib/claw-api";
import type { TFunction } from "./types";

export default function GitHubOAuthAppConfig({ t }: { t: TFunction }) {
  const [ghClientId, setGhClientId] = useState("");
  const [ghClientIdSaved, setGhClientIdSaved] = useState(false);
  const [ghClientIdLoaded, setGhClientIdLoaded] = useState(false);

  useEffect(() => {
    api
      .getSettingsRaw()
      .then((settings) => {
        const val = settings?.github_oauth_client_id;
        if (val) setGhClientId(String(val).replace(/^"|"$/g, ""));
        setGhClientIdLoaded(true);
      })
      .catch(() => setGhClientIdLoaded(true));
  }, []);

  const saveClientId = () => {
    const val = ghClientId.trim();
    api
      .saveSettingsPatch({ github_oauth_client_id: val || null })
      .then(() => {
        setGhClientIdSaved(true);
        setTimeout(() => setGhClientIdSaved(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-2 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {t({
            ko: "GitHub OAuth App (Private 리포 접근)",
            en: "GitHub OAuth App (Private repo access)",
            ja: "GitHub OAuth App（プライベートリポアクセス）",
            zh: "GitHub OAuth App（私有仓库访问）",
          })}
        </h4>
        {ghClientIdSaved && (
          <span className="text-[10px] text-green-400">
            {t({ ko: "저장됨", en: "Saved", ja: "保存済み", zh: "已保存" })}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        {t({
          ko: "기본 GitHub 연결은 Copilot OAuth를 사용하여 Private 리포 접근이 제한됩니다. 자체 OAuth App을 등록하면 모든 리포에 접근 가능합니다.",
          en: "Default GitHub uses Copilot OAuth which limits private repo access. Register your own OAuth App for full access.",
          ja: "デフォルトの GitHub 接続は Copilot OAuth を使用し、プライベートリポへのアクセスが制限されます。自前の OAuth App を登録すると全リポにアクセスできます。",
          zh: "默认 GitHub 使用 Copilot OAuth，限制私有仓库访问。注册自己的 OAuth App 可获取完整访问权限。",
        })}
      </p>
      <details className="text-[11px] text-slate-500">
        <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
          {t({
            ko: "OAuth App 만들기 가이드",
            en: "How to create OAuth App",
            ja: "OAuth App 作成ガイド",
            zh: "如何创建 OAuth App",
          })}
        </summary>
        <ol className="mt-2 ml-4 list-decimal space-y-1 text-slate-400">
          <li>GitHub → Settings → Developer settings → OAuth Apps → New OAuth App</li>
          <li>
            {t({
              ko: "Application name: 아무 이름 (예: My Climpire)",
              en: "Application name: any name (e.g. My Climpire)",
              ja: "Application name: 任意の名前（例: My Climpire）",
              zh: "Application name: 任意名称（如 My Climpire）",
            })}
          </li>
          <li>Homepage URL: http://localhost:8800</li>
          <li>Callback URL: http://localhost:8800/oauth/callback</li>
          <li>
            {t({
              ko: "☑ Enable Device Flow 체크",
              en: "☑ Check 'Enable Device Flow'",
              ja: "☑ Enable Device Flow にチェック",
              zh: "☑ 勾选 Enable Device Flow",
            })}
          </li>
          <li>
            {t({
              ko: "Register → Client ID를 아래에 붙여넣기",
              en: "Register → Paste Client ID below",
              ja: "Register → Client ID を下に貼り付け",
              zh: "Register → 将 Client ID 粘贴到下方",
            })}
          </li>
        </ol>
      </details>
      {ghClientIdLoaded && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Iv23li..."
            value={ghClientId}
            onChange={(e) => setGhClientId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveClientId();
            }}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
          />
          <button
            onClick={saveClientId}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-500"
          >
            {t({ ko: "저장", en: "Save", ja: "保存", zh: "保存" })}
          </button>
        </div>
      )}
      {ghClientId.trim() && (
        <p className="text-[10px] text-amber-400">
          {t({
            ko: "저장 후 GitHub 계정을 재연결하세요 (위의 '연결하기' 또는 '계정 추가' 버튼).",
            en: "After saving, reconnect your GitHub account using the 'Connect' or 'Add Account' button above.",
            ja: "保存後、上の「接続」または「アカウント追加」ボタンで GitHub アカウントを再接続してください。",
            zh: "保存后，使用上方的'连接'或'添加账号'按钮重新连接 GitHub 账号。",
          })}
        </p>
      )}
    </div>
  );
}
