import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ApiStateBundle } from "./types";
import ApiAssignModal from "./ApiAssignModal";
import { DEFAULT_API_FORM } from "./useApiProvidersState";

vi.mock("../AgentAvatar", () => ({
  default: () => <div>avatar</div>,
  buildSpriteMap: () => ({}),
}));

function t(messages: Record<string, string>): string {
  return messages.en ?? messages.ko ?? messages.ja ?? messages.zh ?? Object.values(messages)[0] ?? "";
}

function makeApiState(): ApiStateBundle {
  return {
    apiProviders: [],
    apiProvidersLoading: false,
    apiOfficialPresets: {},
    apiPresetsLoading: false,
    apiAddMode: false,
    apiEditingId: null,
    apiForm: DEFAULT_API_FORM,
    apiSaving: false,
    apiSaveError: null,
    apiTesting: null,
    apiTestResult: {},
    apiModelsExpanded: {},
    apiAssignTarget: { providerId: "provider-1", model: "gpt-4o" },
    apiAssignAgents: [
      {
        id: "agent-dev",
        name: "Dev Lead",
        name_ko: "개발 리드",
        department_id: "planning",
        workflow_pack_key: "development",
        role: "team_leader",
        cli_provider: "claude",
        avatar_emoji: "A",
        personality: null,
        status: "idle",
        current_task_id: null,
        stats_tasks_done: 0,
        stats_xp: 0,
        created_at: 1,
      },
      {
        id: "agent-video",
        name: "Video Lead",
        name_ko: "영상 리드",
        department_id: "planning",
        workflow_pack_key: "video_preprod",
        role: "team_leader",
        cli_provider: "claude",
        avatar_emoji: "B",
        personality: null,
        status: "idle",
        current_task_id: null,
        stats_tasks_done: 0,
        stats_xp: 0,
        created_at: 2,
      },
    ],
    apiAssignDepts: [
      {
        id: "planning",
        name: "Planning",
        name_ko: "기획",
        icon: "P",
        color: "#000000",
        description: null,
        prompt: null,
        sort_order: 0,
        created_at: 1,
        workflow_pack_key: "development",
      },
      {
        id: "planning",
        name: "Storyboard",
        name_ko: "스토리보드",
        icon: "S",
        color: "#111111",
        description: null,
        prompt: null,
        sort_order: 0,
        created_at: 2,
        workflow_pack_key: "video_preprod",
      },
    ],
    apiAssigning: false,
    setApiAddMode: vi.fn(),
    setApiEditingId: vi.fn(),
    setApiForm: vi.fn(),
    setApiSaveError: vi.fn(),
    setApiModelsExpanded: vi.fn(),
    setApiAssignTarget: vi.fn(),
    loadApiProviders: vi.fn(),
    loadApiPresets: vi.fn(),
    handleApiProviderSave: vi.fn(),
    handleApiProviderDelete: vi.fn(),
    handleApiProviderTest: vi.fn(),
    handleApiProviderToggle: vi.fn(),
    handleApiEditStart: vi.fn(),
    handleApiModelAssign: vi.fn(),
    handleApiAssignToAgent: vi.fn(),
  };
}

describe("ApiAssignModal", () => {
  it("separates duplicate department ids by workflow pack", () => {
    render(<ApiAssignModal t={t} localeTag="en-US" apiState={makeApiState()} />);

    expect(screen.getByText("Development Office")).toBeInTheDocument();
    expect(screen.getByText("Video Pre-production")).toBeInTheDocument();
    expect(screen.getByText("Dev Lead")).toBeInTheDocument();
    expect(screen.getByText("Video Lead")).toBeInTheDocument();
    expect(screen.getByText("Planning")).toBeInTheDocument();
    expect(screen.getByText("Storyboard")).toBeInTheDocument();
  });
});
