import { describe, expect, it } from "vitest";
import type { Agent, Department } from "../../types";
import { buildOfficePackSyncPlan } from "./office-pack-sync";

function makeDepartment(overrides: Partial<Department> = {}): Department {
  return {
    id: "planning",
    name: "Planning",
    name_ko: "기획팀",
    name_ja: "企画チーム",
    name_zh: "企划组",
    icon: "📋",
    color: "#6366f1",
    description: null,
    prompt: null,
    sort_order: 1,
    created_at: 1,
    ...overrides,
  };
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "Planner 1",
    name_ko: "기획자 1",
    name_ja: "企画者 1",
    name_zh: "策划 1",
    department_id: "planning",
    role: "senior",
    cli_provider: "codex",
    avatar_emoji: "🤖",
    personality: null,
    status: "idle",
    current_task_id: null,
    stats_tasks_done: 0,
    stats_xp: 0,
    created_at: 1,
    ...overrides,
  };
}

describe("buildOfficePackSyncPlan", () => {
  it("변경사항이 없으면 빈 패치를 반환한다", () => {
    const departments = [makeDepartment()];
    const agents = [makeAgent()];

    const plan = buildOfficePackSyncPlan({
      currentDepartments: departments,
      currentAgents: agents,
      nextDepartments: departments,
      nextAgents: agents,
    });

    expect(plan.departmentPatches).toHaveLength(0);
    expect(plan.agentPatches).toHaveLength(0);
  });

  it("변경된 필드만 패치로 만든다", () => {
    const currentDepartments = [makeDepartment()];
    const currentAgents = [makeAgent()];
    const nextDepartments = [makeDepartment({ name: "Editorial Planning", icon: "📚", name_ja: null })];
    const nextAgents = [makeAgent({ name: "Editor 1", avatar_emoji: "📚", department_id: "dev", name_zh: null })];

    const plan = buildOfficePackSyncPlan({
      currentDepartments,
      currentAgents,
      nextDepartments,
      nextAgents,
    });

    expect(plan.departmentPatches).toEqual([
      {
        id: "planning",
        patch: {
          name: "Editorial Planning",
          icon: "📚",
          name_ja: null,
        },
      },
    ]);
    expect(plan.agentPatches).toEqual([
      {
        id: "agent-1",
        patch: {
          name: "Editor 1",
          avatar_emoji: "📚",
          department_id: "dev",
          name_zh: null,
        },
      },
    ]);
  });
});
