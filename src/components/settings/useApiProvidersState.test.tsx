import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useApiProvidersState } from "./useApiProvidersState";
import { DEFAULT_SETTINGS, type CompanySettings } from "../../types";

const apiMocks = vi.hoisted(() => ({
  createApiProvider: vi.fn(),
  deleteApiProvider: vi.fn(),
  getAgents: vi.fn(),
  getApiProviderPresets: vi.fn(),
  getApiProviders: vi.fn(),
  getDepartments: vi.fn(),
  testApiProvider: vi.fn(),
  updateAgent: vi.fn(),
  updateApiProvider: vi.fn(),
}));

vi.mock("@/lib/claw-api", () => ({
  createApiProvider: apiMocks.createApiProvider,
  deleteApiProvider: apiMocks.deleteApiProvider,
  getAgents: apiMocks.getAgents,
  getApiProviderPresets: apiMocks.getApiProviderPresets,
  getApiProviders: apiMocks.getApiProviders,
  getDepartments: apiMocks.getDepartments,
  testApiProvider: apiMocks.testApiProvider,
  updateAgent: apiMocks.updateAgent,
  updateApiProvider: apiMocks.updateApiProvider,
}));

function t(messages: Record<string, string>): string {
  return messages.en ?? messages.ko ?? messages.ja ?? messages.zh ?? Object.values(messages)[0] ?? "";
}

function makeSettings(overrides: Partial<CompanySettings> = {}): CompanySettings {
  return {
    ...DEFAULT_SETTINGS,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("useApiProvidersState preset loading", () => {
  beforeEach(() => {
    apiMocks.getApiProviders.mockResolvedValue([]);
    apiMocks.getApiProviderPresets.mockRejectedValue(new Error("preset load failed"));
    apiMocks.createApiProvider.mockResolvedValue({ ok: true, id: "provider-1" });
    apiMocks.deleteApiProvider.mockResolvedValue({ ok: true });
    apiMocks.getAgents.mockResolvedValue([]);
    apiMocks.getDepartments.mockResolvedValue([]);
    apiMocks.testApiProvider.mockResolvedValue({ ok: true, model_count: 0, models: [] });
    apiMocks.updateAgent.mockResolvedValue({ ok: true });
    apiMocks.updateApiProvider.mockResolvedValue({ ok: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("does not auto-retry failed preset loads, but allows manual retry", async () => {
    const { result } = renderHook(() => useApiProvidersState({ tab: "api", t, settings: makeSettings() }));

    await waitFor(() => {
      expect(apiMocks.getApiProviderPresets).toHaveBeenCalledTimes(1);
      expect(result.current.apiPresetsLoading).toBe(false);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(apiMocks.getApiProviderPresets).toHaveBeenCalledTimes(1);

    apiMocks.getApiProviderPresets.mockResolvedValueOnce({
      presets: {},
      official_presets: {
        "opencode-go-openai": {
          label: "OpenCode Go (OpenAI)",
          description: "Preset",
          type: "openai",
          base_url: "https://opencode.ai/zen/go/v1",
          docs_url: "https://opencode.ai/docs/ko/go/",
          api_key_hint: "Use an OpenCode Go direct API key for this endpoint.",
          api_key_placeholder: "sk-...",
          fallback_models: ["glm-5"],
        },
      },
    });

    await act(async () => {
      await result.current.loadApiPresets();
    });

    expect(apiMocks.getApiProviderPresets).toHaveBeenCalledTimes(2);
    expect(result.current.apiOfficialPresets["opencode-go-openai"]?.label).toBe("OpenCode Go (OpenAI)");
  });
});

describe("useApiProvidersState model assignment", () => {
  beforeEach(() => {
    apiMocks.getApiProviders.mockResolvedValue([]);
    apiMocks.getApiProviderPresets.mockResolvedValue({ presets: {}, official_presets: {} });
    apiMocks.getAgents.mockResolvedValue([]);
    apiMocks.getDepartments.mockResolvedValue([]);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("loads development plus hydrated pack targets when assigning an API model", async () => {
    apiMocks.getAgents.mockResolvedValueOnce([
      { id: "agent-dev", workflow_pack_key: "development" },
      { id: "agent-video", workflow_pack_key: "video_preprod" },
      { id: "agent-report", workflow_pack_key: "report" },
      { id: "agent-legacy" },
    ]);
    apiMocks.getDepartments.mockImplementation(async (options?: { workflowPackKey?: string }) => {
      if (options?.workflowPackKey === "video_preprod") {
        return [{ id: "planning", name: "Storyboard", name_ko: "스토리보드", workflow_pack_key: "video_preprod" }];
      }
      return [{ id: "planning", name: "Planning", name_ko: "기획", workflow_pack_key: "development" }];
    });

    const { result } = renderHook(() =>
      useApiProvidersState({
        tab: "api",
        t,
        settings: makeSettings({ officePackHydratedPacks: ["video_preprod"] }),
      }),
    );

    await waitFor(() => {
      expect(apiMocks.getApiProviders).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.handleApiModelAssign("provider-1", "gpt-4o");
    });

    expect(apiMocks.getAgents).toHaveBeenCalledWith({ includeSeed: true });
    expect(apiMocks.getDepartments).toHaveBeenNthCalledWith(1, { workflowPackKey: "development" });
    expect(apiMocks.getDepartments).toHaveBeenNthCalledWith(2, { workflowPackKey: "video_preprod" });
    expect(result.current.apiAssignAgents).toEqual([
      { id: "agent-dev", workflow_pack_key: "development" },
      { id: "agent-video", workflow_pack_key: "video_preprod" },
      { id: "agent-legacy" },
    ]);
    expect(result.current.apiAssignDepts).toEqual([
      { id: "planning", name: "Planning", name_ko: "기획", workflow_pack_key: "development" },
      { id: "planning", name: "Storyboard", name_ko: "스토리보드", workflow_pack_key: "video_preprod" },
    ]);
  });
});
