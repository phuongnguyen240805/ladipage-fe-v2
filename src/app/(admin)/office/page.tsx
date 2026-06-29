"use client";

import { useMemo, useState } from "react";
import OfficeView from "@/components/OfficeView";
import type { Agent, Department, RoomTheme, SubAgent, Task } from "@/types";

const now = Date.now();
const officePackLabel = "VID - Video Pre-production";

const departments: Department[] = [
  {
    id: "planning",
    name: "Pre-production",
    name_ko: "Pre-production",
    name_ja: "Pre-production",
    name_zh: "Pre-production",
    icon: "P",
    color: "#c08457",
    description: "Story planning, brief shaping, and schedule control",
    prompt: null,
    sort_order: 1,
    created_at: now,
  },
  {
    id: "dev",
    name: "Scene Engine",
    name_ko: "Scene Engine",
    name_ja: "Scene Engine",
    name_zh: "Scene Engine",
    icon: "S",
    color: "#3b82f6",
    description: "Scene structure, motion systems, and runtime assembly",
    prompt: null,
    sort_order: 2,
    created_at: now,
  },
  {
    id: "design",
    name: "Art & Camera",
    name_ko: "Art & Camera",
    name_ja: "Art & Camera",
    name_zh: "Art & Camera",
    icon: "A",
    color: "#a855f7",
    description: "Shot design, visual mood, and camera direction",
    prompt: null,
    sort_order: 3,
    created_at: now,
  },
  {
    id: "qa",
    name: "Cut QA",
    name_ko: "Cut QA",
    name_ja: "Cut QA",
    name_zh: "Cut QA",
    icon: "Q",
    color: "#b7791f",
    description: "Continuity, timing, and final review checks",
    prompt: null,
    sort_order: 4,
    created_at: now,
  },
  {
    id: "devsecops",
    name: "DevSecOps",
    name_ko: "DevSecOps",
    name_ja: "DevSecOps",
    name_zh: "DevSecOps",
    icon: "D",
    color: "#64748b",
    description: "Pipeline, assets, and release safety",
    prompt: null,
    sort_order: 5,
    created_at: now,
  },
  {
    id: "operations",
    name: "Operations",
    name_ko: "Operations",
    name_ja: "Operations",
    name_zh: "Operations",
    icon: "O",
    color: "#22c55e",
    description: "Delivery, coordination, and production support",
    prompt: null,
    sort_order: 6,
    created_at: now,
  },
];

const departmentById = new Map(departments.map((department) => [department.id, department]));

const roomThemes: Record<string, RoomTheme> = {
  ceoOffice: { floor1: 0x151313, floor2: 0x1f1b18, wall: 0x25201d, accent: 0xc08b40 },
  planning: { floor1: 0x3d2820, floor2: 0x4b3329, wall: 0x261b17, accent: 0xd18d55 },
  dev: { floor1: 0x173650, floor2: 0x214967, wall: 0x132537, accent: 0x4ea3dc },
  design: { floor1: 0x3d2343, floor2: 0x4f2b59, wall: 0x2a1931, accent: 0xa56add },
  qa: { floor1: 0x3b2b20, floor2: 0x4b382a, wall: 0x251b16, accent: 0xc48645 },
  devsecops: { floor1: 0x1f2e40, floor2: 0x2a3d54, wall: 0x182230, accent: 0x6ea4c7 },
  operations: { floor1: 0x1d4333, floor2: 0x285640, wall: 0x16281f, accent: 0x56c587 },
  breakRoom: { floor1: 0x201a14, floor2: 0x2f251b, wall: 0x17130f, accent: 0xc58a42 },
};

function agent({
  id,
  name,
  departmentId,
  role,
  provider,
  sprite,
  status,
  currentTaskId,
  done,
  xp,
}: {
  id: string;
  name: string;
  departmentId: string;
  role: Agent["role"];
  provider: Agent["cli_provider"];
  sprite: number;
  status: Agent["status"];
  currentTaskId: string | null;
  done: number;
  xp: number;
}): Agent {
  return {
    id,
    name,
    name_ko: name,
    name_ja: name,
    name_zh: name,
    department_id: departmentId,
    department: departmentById.get(departmentId),
    role,
    cli_provider: provider,
    avatar_emoji: name.slice(0, 2).toUpperCase(),
    sprite_number: sprite,
    personality: "Video production specialist",
    status,
    current_task_id: currentTaskId,
    stats_tasks_done: done,
    stats_xp: xp,
    created_at: now,
  };
}

const agents: Agent[] = [
  agent({
    id: "agent-rian",
    name: "Rian",
    departmentId: "planning",
    role: "team_leader",
    provider: "claude",
    sprite: 1,
    status: "working",
    currentTaskId: "task-shot-map",
    done: 9,
    xp: 3260,
  }),
  agent({
    id: "agent-haru",
    name: "Haru",
    departmentId: "planning",
    role: "senior",
    provider: "codex",
    sprite: 2,
    status: "working",
    currentTaskId: "task-beat-sheet",
    done: 13,
    xp: 4470,
  }),
  agent({
    id: "agent-sena",
    name: "Sena",
    departmentId: "dev",
    role: "senior",
    provider: "codex",
    sprite: 3,
    status: "working",
    currentTaskId: "task-scene-graph",
    done: 11,
    xp: 3980,
  }),
  agent({
    id: "agent-yuna",
    name: "Yuna",
    departmentId: "design",
    role: "junior",
    provider: "gemini",
    sprite: 4,
    status: "working",
    currentTaskId: "task-camera-board",
    done: 6,
    xp: 2210,
  }),
  agent({
    id: "agent-miro",
    name: "Miro",
    departmentId: "design",
    role: "senior",
    provider: "claude",
    sprite: 5,
    status: "idle",
    currentTaskId: null,
    done: 16,
    xp: 5200,
  }),
  agent({
    id: "agent-quinn",
    name: "Quinn",
    departmentId: "qa",
    role: "team_leader",
    provider: "gemini",
    sprite: 6,
    status: "working",
    currentTaskId: "task-continuity-pass",
    done: 18,
    xp: 4860,
  }),
  agent({
    id: "agent-raven",
    name: "Raven",
    departmentId: "devsecops",
    role: "team_leader",
    provider: "opencode",
    sprite: 7,
    status: "working",
    currentTaskId: "task-asset-pipeline",
    done: 8,
    xp: 3120,
  }),
  agent({
    id: "agent-dami",
    name: "Dami",
    departmentId: "operations",
    role: "team_leader",
    provider: "copilot",
    sprite: 8,
    status: "idle",
    currentTaskId: null,
    done: 10,
    xp: 3510,
  }),
];

const agentById = new Map(agents.map((item) => [item.id, item]));

function task({
  id,
  title,
  departmentId,
  agentId,
  status,
  taskType,
  priority,
  startedMinutesAgo,
}: {
  id: string;
  title: string;
  departmentId: string;
  agentId: string | null;
  status: Task["status"];
  taskType: Task["task_type"];
  priority: number;
  startedMinutesAgo: number;
}): Task {
  return {
    id,
    title,
    description: `${officePackLabel} production work`,
    department_id: departmentId,
    assigned_agent_id: agentId,
    assigned_agent: agentId ? agentById.get(agentId) : undefined,
    status,
    priority,
    task_type: taskType,
    workflow_pack_key: "video_preprod",
    project_path: null,
    result: null,
    started_at: now - startedMinutesAgo * 60 * 1000,
    completed_at: status === "done" ? now - 12 * 60 * 1000 : null,
    created_at: now - (startedMinutesAgo + 40) * 60 * 1000,
    updated_at: now,
  };
}

const tasks: Task[] = [
  task({
    id: "task-shot-map",
    title: "Shot map for opening sequence",
    departmentId: "planning",
    agentId: "agent-rian",
    status: "in_progress",
    taskType: "general",
    priority: 1,
    startedMinutesAgo: 42,
  }),
  task({
    id: "task-beat-sheet",
    title: "Pre-production beat sheet",
    departmentId: "planning",
    agentId: "agent-haru",
    status: "collaborating",
    taskType: "documentation",
    priority: 2,
    startedMinutesAgo: 31,
  }),
  task({
    id: "task-scene-graph",
    title: "Scene graph assembly",
    departmentId: "dev",
    agentId: "agent-sena",
    status: "in_progress",
    taskType: "development",
    priority: 1,
    startedMinutesAgo: 28,
  }),
  task({
    id: "task-camera-board",
    title: "Camera board pass",
    departmentId: "design",
    agentId: "agent-yuna",
    status: "review",
    taskType: "design",
    priority: 2,
    startedMinutesAgo: 64,
  }),
  task({
    id: "task-asset-pipeline",
    title: "Asset pipeline check",
    departmentId: "devsecops",
    agentId: "agent-raven",
    status: "in_progress",
    taskType: "development",
    priority: 2,
    startedMinutesAgo: 19,
  }),
  task({
    id: "task-release-brief",
    title: "Release brief",
    departmentId: "operations",
    agentId: "agent-dami",
    status: "planned",
    taskType: "general",
    priority: 3,
    startedMinutesAgo: 14,
  }),
  task({
    id: "task-continuity-pass",
    title: "Continuity pass",
    departmentId: "qa",
    agentId: "agent-quinn",
    status: "in_progress",
    taskType: "analysis",
    priority: 2,
    startedMinutesAgo: 96,
  }),
];

const subAgents: SubAgent[] = [
  { id: "sub-shot-map-1", parentAgentId: "agent-rian", task: "Shot notes", status: "working" },
  { id: "sub-scene-1", parentAgentId: "agent-sena", task: "Scene data", status: "working" },
  { id: "sub-camera-1", parentAgentId: "agent-yuna", task: "Camera pass", status: "working" },
  { id: "sub-pipeline-1", parentAgentId: "agent-raven", task: "Asset checks", status: "working" },
];

const navButtons = ["Tasks", "Decisions", "Agents", "Reports", "Announcement", "Office Manager"];

export default function OfficePage() {
  const [selected, setSelected] = useState<string>("Video office running");
  const unreadAgentIds = useMemo(() => new Set(["agent-rian", "agent-yuna", "agent-quinn"]), []);
  const workingCount = agents.filter((item) => item.status === "working").length;
  const inProgressCount = tasks.filter((item) => item.status === "in_progress" || item.status === "collaborating").length;
  const doneCount = tasks.filter((item) => item.status === "done").length;

  return (
    <main className="h-[calc(100vh-84px)] min-w-0 overflow-hidden bg-[#f4efe6] text-slate-900">
      <header className="flex h-14 min-w-0 items-center justify-between gap-3 border-b border-[#d9cfbf] bg-[#f7f2ea] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="shrink-0 text-xl font-semibold tracking-normal">Office</h1>
          <span className="hidden rounded-md border border-[#d6c7ad] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-normal text-[#6c604f] md:inline-flex">
            Office Pack
          </span>
          <span className="truncate rounded-md border border-[#d6c7ad] bg-white px-3 py-1 text-xs font-semibold text-[#4b4034]">
            {officePackLabel}
          </span>
        </div>

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          {navButtons.map((label, index) => (
            <button
              key={label}
              className={[
                "h-9 rounded-md border px-3 text-sm font-semibold shadow-sm transition",
                index === 0
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-[#d6c7ad] bg-white text-[#4b4034] hover:bg-[#fffaf3]",
              ].join(" ")}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold text-[#4b4034]">
          <span className="rounded-md border border-[#d6c7ad] bg-white px-2 py-1">Staff {agents.length}</span>
          <span className="rounded-md border border-[#d6c7ad] bg-white px-2 py-1">Working {workingCount}</span>
          <span className="rounded-md border border-[#d6c7ad] bg-white px-2 py-1">In Progress {inProgressCount}</span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            Done {doneCount}/7
          </span>
        </div>
      </header>

      <section className="h-[calc(100%-56px)] min-w-0 overflow-hidden">
        <OfficeView
          departments={departments}
          agents={agents}
          tasks={tasks}
          subAgents={subAgents}
          unreadAgentIds={unreadAgentIds}
          customDeptThemes={roomThemes}
          onSelectAgent={(selectedAgent) => setSelected(`${selectedAgent.name} selected`)}
          onSelectDepartment={(department) => setSelected(`${department.name} selected`)}
        />
      </section>

      <div className="sr-only" aria-live="polite">
        {selected}
      </div>
    </main>
  );
}
