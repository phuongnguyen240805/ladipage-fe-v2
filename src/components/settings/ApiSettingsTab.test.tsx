import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ApiProvider } from "@/lib/claw-api";
import type { ApiAssignTarget, ApiFormState, ApiStateBundle } from "./types";
import ApiSettingsTab from "./ApiSettingsTab";
import { DEFAULT_API_FORM } from "./useApiProvidersState";

vi.mock("./ApiAssignModal", () => ({
  default: () => null,
}));

function t(messages: Record<string, string>): string {
  return messages.en ?? messages.ko ?? messages.ja ?? messages.zh ?? Object.values(messages)[0] ?? "";
}

const OFFICIAL_PRESETS = {
  "opencode-go-openai": {
    label: "OpenCode Go (OpenAI)",
    description: "OpenCode Go direct API preset using the OpenAI-compatible protocol.",
    type: "openai" as const,
    base_url: "https://opencode.ai/zen/go/v1",
    docs_url: "https://opencode.ai/docs/ko/go/",
    api_key_hint: "Use an OpenCode Go direct API key for this endpoint.",
    api_key_placeholder: "sk-...",
    fallback_models: ["glm-5", "kimi-k2.5"],
  },
  "alibaba-coding-plan-openai": {
    label: "Bailian Coding Plan (OpenAI)",
    description: "Alibaba Bailian Coding Plan direct API preset using the OpenAI-compatible protocol.",
    type: "openai" as const,
    base_url: "https://coding-intl.dashscope.aliyuncs.com/v1",
    docs_url: "https://www.alibabacloud.com/help/en/model-studio/other-tools-coding-plan",
    api_key_hint: "Bailian Coding Plan keys for this preset must start with sk-sp-.",
    api_key_placeholder: "sk-sp-...",
    fallback_models: ["qwen3.5-plus", "glm-5"],
    required_api_key_prefix: "sk-sp-",
  },
};

function TestHarness({
  providers = [],
  addMode = true,
  initialExpanded = {},
}: {
  providers?: ApiProvider[];
  addMode?: boolean;
  initialExpanded?: Record<string, boolean>;
}) {
  const [apiAddMode, setApiAddMode] = useState(addMode);
  const [apiEditingId, setApiEditingId] = useState<string | null>(null);
  const [apiForm, setApiForm] = useState<ApiFormState>(DEFAULT_API_FORM);
  const [apiSaveError, setApiSaveError] = useState<string | null>(null);
  const [apiModelsExpanded, setApiModelsExpanded] = useState<Record<string, boolean>>(initialExpanded);
  const [apiAssignTarget, setApiAssignTarget] = useState<ApiAssignTarget | null>(null);

  const apiState: ApiStateBundle = {
    apiProviders: providers,
    apiProvidersLoading: false,
    apiOfficialPresets: OFFICIAL_PRESETS,
    apiPresetsLoading: false,
    apiAddMode,
    apiEditingId,
    apiForm,
    apiSaving: false,
    apiSaveError,
    apiTesting: null,
    apiTestResult: {},
    apiModelsExpanded,
    apiAssignTarget,
    apiAssignAgents: [],
    apiAssignDepts: [],
    apiAssigning: false,
    setApiAddMode,
    setApiEditingId,
    setApiForm,
    setApiSaveError,
    setApiModelsExpanded,
    setApiAssignTarget,
    loadApiProviders: async () => {},
    loadApiPresets: async () => {},
    handleApiProviderSave: async () => {},
    handleApiProviderDelete: async () => {},
    handleApiProviderTest: async () => {},
    handleApiProviderToggle: async () => {},
    handleApiEditStart: (provider) => {
      setApiEditingId(provider.id);
      setApiAddMode(true);
      setApiForm({
        name: provider.name,
        type: provider.type,
        base_url: provider.base_url,
        api_key: "",
        preset_key: provider.preset_key,
      });
    },
    handleApiModelAssign: async () => {},
    handleApiAssignToAgent: async () => {},
  };

  return <ApiSettingsTab t={t} localeTag="en-US" apiState={apiState} />;
}

describe("ApiSettingsTab", () => {
  it("filters expanded model lists by search query", async () => {
    const user = userEvent.setup();
    render(
      <TestHarness
        addMode={false}
        initialExpanded={{ "provider-1": true }}
        providers={[
          {
            id: "provider-1",
            name: "Primary OpenAI",
            type: "openai",
            base_url: "https://api.openai.com/v1",
            preset_key: null,
            enabled: true,
            has_api_key: true,
            models_cache: ["gpt-4o", "claude-3-7-sonnet", "gemini-2.5-pro"],
            models_cached_at: Date.now(),
            created_at: Date.now(),
            updated_at: Date.now(),
          },
        ]}
      />,
    );

    const searchInput = screen.getByRole("textbox", { name: "Search models" });
    await user.type(searchInput, "claude");

    expect(screen.getByText("claude-3-7-sonnet")).toBeInTheDocument();
    expect(screen.queryByText("gpt-4o")).not.toBeInTheDocument();
    expect(screen.queryByText("gemini-2.5-pro")).not.toBeInTheDocument();
  });

  it("applies official preset values and locks Base URL editing", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /OpenCode Go \(OpenAI\)/ }));

    expect(screen.getByDisplayValue("OpenCode Go (OpenAI)")).toBeInTheDocument();
    const baseUrlInput = screen.getByPlaceholderText("https://api.openai.com/v1") as HTMLInputElement;
    expect(baseUrlInput.value).toBe("https://opencode.ai/zen/go/v1");
    expect(baseUrlInput.readOnly).toBe(true);
    expect(screen.getByText("glm-5")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open docs" })).toHaveAttribute("href", "https://opencode.ai/docs/ko/go/");
  });

  it("unlocks manual editing when switching back to a generic type", async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    await user.click(screen.getByRole("button", { name: /OpenCode Go \(OpenAI\)/ }));
    const nameInput = screen.getByPlaceholderText("e.g. My OpenAI");
    await user.clear(nameInput);
    await user.type(nameInput, "Team Gateway");
    await user.click(screen.getByRole("button", { name: "Custom" }));

    const baseUrlInput = screen.getByPlaceholderText("https://api.openai.com/v1") as HTMLInputElement;
    expect(baseUrlInput.readOnly).toBe(false);
    expect(screen.getByDisplayValue("Team Gateway")).toBeInTheDocument();
  });

  it("shows preset badge and seeded models on provider cards", async () => {
    const user = userEvent.setup();
    render(
      <TestHarness
        addMode={false}
        providers={[
          {
            id: "provider-1",
            name: "Bailian Coding Plan",
            type: "openai",
            base_url: "https://coding-intl.dashscope.aliyuncs.com/v1",
            preset_key: "alibaba-coding-plan-openai",
            has_api_key: true,
            enabled: true,
            models_cache: ["qwen3.5-plus", "glm-5"],
            models_cached_at: 1_717_171_717_000,
            created_at: 1_717_171_717_000,
            updated_at: 1_717_171_717_000,
          },
        ]}
      />,
    );

    expect(screen.getByText("Bailian Coding Plan (OpenAI)")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Models \(2\)/ }));
    expect(screen.getByText("qwen3.5-plus")).toBeInTheDocument();
    expect(screen.getByText("glm-5")).toBeInTheDocument();
  });

  it("retries presets through the refresh button instead of auto-looping silently", async () => {
    const user = userEvent.setup();
    const loadApiProviders = vi.fn(async () => {});
    const loadApiPresets = vi.fn(async () => {});
    const apiAddMode = false;
    const setApiAddMode = vi.fn();
    const apiEditingId = null;
    const setApiEditingId = vi.fn();
    const apiForm = DEFAULT_API_FORM;
    const setApiForm = vi.fn();
    const apiSaveError = "load failed";
    const setApiSaveError = vi.fn();
    const apiModelsExpanded = {};
    const setApiModelsExpanded = vi.fn();
    const apiAssignTarget = null;
    const setApiAssignTarget = vi.fn();

    const apiState: ApiStateBundle = {
      apiProviders: [],
      apiProvidersLoading: false,
      apiOfficialPresets: {},
      apiPresetsLoading: false,
      apiAddMode,
      apiEditingId,
      apiForm,
      apiSaving: false,
      apiSaveError,
      apiTesting: null,
      apiTestResult: {},
      apiModelsExpanded,
      apiAssignTarget,
      apiAssignAgents: [],
      apiAssignDepts: [],
      apiAssigning: false,
      setApiAddMode,
      setApiEditingId,
      setApiForm,
      setApiSaveError,
      setApiModelsExpanded,
      setApiAssignTarget,
      loadApiProviders,
      loadApiPresets,
      handleApiProviderSave: async () => {},
      handleApiProviderDelete: async () => {},
      handleApiProviderTest: async () => {},
      handleApiProviderToggle: async () => {},
      handleApiEditStart: () => {},
      handleApiModelAssign: async () => {},
      handleApiAssignToAgent: async () => {},
    };

    render(<ApiSettingsTab t={t} localeTag="en-US" apiState={apiState} />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(loadApiProviders).toHaveBeenCalledTimes(1);
    expect(loadApiPresets).toHaveBeenCalledTimes(1);
  });
});
