import type { ApiProviderType, OAuthConnectProvider } from "@/lib/claw-api";
import type { FacebookTokenValues, TokenFieldConfig } from "./types";
import { AntigravityLogo, CliChatGPTLogo, CliClaudeLogo, CliGeminiLogo, CliKimiLogo, GitHubCopilotLogo } from "./Logos";

export const CLI_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
  claude: { label: "Claude Code", icon: <CliClaudeLogo /> },
  codex: { label: "Codex CLI", icon: <CliChatGPTLogo /> },
  gemini: { label: "Gemini CLI", icon: <CliGeminiLogo /> },
  opencode: { label: "OpenCode", icon: "⚪" },
  kimi: { label: "Kimi Code", icon: <CliKimiLogo /> },
  copilot: { label: "GitHub Copilot", icon: "🚀" },
  antigravity: { label: "Antigravity", icon: "🌌" },
};

export const OAUTH_INFO: Record<string, { label: string }> = {
  "github-copilot": { label: "GitHub" },
  antigravity: { label: "Antigravity" },
};

export const CONNECTABLE_PROVIDERS: Array<{
  id: OAuthConnectProvider;
  label: string;
  Logo: ({ className }: { className?: string }) => React.ReactElement;
  description: string;
}> = [
  { id: "github-copilot", label: "GitHub", Logo: GitHubCopilotLogo, description: "GitHub OAuth (Copilot included)" },
  { id: "antigravity", label: "Antigravity", Logo: AntigravityLogo, description: "Google OAuth (Antigravity)" },
];

export const API_TYPE_PRESETS: Record<ApiProviderType, { label: string; base_url: string }> = {
  openai: { label: "OpenAI", base_url: "https://api.openai.com/v1" },
  anthropic: { label: "Anthropic", base_url: "https://api.anthropic.com/v1" },
  google: { label: "Google AI", base_url: "https://generativelanguage.googleapis.com/v1beta" },
  ollama: { label: "Ollama", base_url: "http://localhost:11434/v1" },
  openrouter: { label: "OpenRouter", base_url: "https://openrouter.ai/api/v1" },
  together: { label: "Together", base_url: "https://api.together.xyz/v1" },
  groq: { label: "Groq", base_url: "https://api.groq.com/openai/v1" },
  cerebras: { label: "Cerebras", base_url: "https://api.cerebras.ai/v1" },
  custom: { label: "Custom", base_url: "" },
};

export const THEME_STORAGE_KEY = "settings_theme_mode";

export const TOKEN_STORAGE_KEYS: Record<keyof FacebookTokenValues, string> = {
  eaag: "settings_token_eaag",
  eaab: "settings_token_eaab",
  eaai: "settings_token_eaai",
  eaah: "settings_token_eaah",
  cookie: "settings_token_cookie",
};

export const TOKEN_FIELDS: TokenFieldConfig[] = [
  { key: "eaag", label: "TOKEN EAAG", placeholder: "Tu dong lay tu cookie/bridge..." },
  { key: "eaab", label: "TOKEN EAAB", placeholder: "Tu dong lay tu cookie/bridge..." },
  { key: "eaai", label: "TOKEN EAAI", placeholder: "Tu dong lay tu cookie/bridge..." },
  { key: "eaah", label: "TOKEN EAAH", placeholder: "Tu dong lay tu cookie/bridge..." },
  { key: "cookie", label: "COOKIE", placeholder: "Tu dong dong bo tu phien Facebook..." },
];

export const EMPTY_TOKEN_VALUES: FacebookTokenValues = {
  eaag: "",
  eaab: "",
  eaai: "",
  eaah: "",
  cookie: "",
};

export const HIDDEN_TOKEN_FIELDS: Record<keyof FacebookTokenValues, boolean> = {
  eaag: false,
  eaab: false,
  eaai: false,
  eaah: false,
  cookie: false,
};
