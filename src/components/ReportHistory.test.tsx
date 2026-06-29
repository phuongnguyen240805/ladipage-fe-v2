import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n";
import ReportHistory from "./ReportHistory";

const apiMocks = vi.hoisted(() => ({
  getTaskReports: vi.fn(),
  getTaskReportDetail: vi.fn(),
}));

vi.mock("@/lib/claw-api", () => ({
  getTaskReports: apiMocks.getTaskReports,
  getTaskReportDetail: apiMocks.getTaskReportDetail,
}));

describe("ReportHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getTaskReports.mockResolvedValue([
      {
        id: "task-1",
        title: "Ship feature",
        description: null,
        department_id: "planning",
        assigned_agent_id: "agent-1",
        status: "done",
        project_id: "project-1",
        project_path: "/tmp/project",
        created_at: 1000,
        completed_at: 2000,
        agent_name: "Ari",
        agent_name_ko: "아리",
        agent_role: "team_leader",
        dept_name: "Planning",
        dept_name_ko: "기획팀",
        project_name: "Project",
      },
    ]);
  });

  it("renders a sprite avatar for report rows even when the active agent list does not contain the assignee", async () => {
    render(
      <I18nProvider language="en">
        <ReportHistory agents={[]} departments={[]} uiLanguage="en" onClose={() => {}} />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByAltText("Ari")).toBeInTheDocument();
    });
  });
});
