import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { I18nProvider } from "../../i18n";
import DiffModal from "./DiffModal";

const apiMocks = vi.hoisted(() => ({
  getTaskDiff: vi.fn(),
  getTaskVerifyCommit: vi.fn(),
  mergeTask: vi.fn(),
  discardTask: vi.fn(),
}));

vi.mock("@/lib/claw-api", () => ({
  getTaskDiff: apiMocks.getTaskDiff,
  getTaskVerifyCommit: apiMocks.getTaskVerifyCommit,
  mergeTask: apiMocks.mergeTask,
  discardTask: apiMocks.discardTask,
}));

describe("DiffModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getTaskDiff.mockResolvedValue({
      ok: true,
      hasWorktree: true,
      branchName: "climpire/test",
      stat: "1 file changed",
      diff: "diff --git a/a b/a",
    });
    apiMocks.getTaskVerifyCommit.mockResolvedValue({
      ok: true,
      hasWorktree: true,
      verdict: "ok",
      commitCount: 1,
      compareRef: "main",
      files: ["src/verify.ts"],
      uncommittedFiles: [],
      hasUncommittedChanges: false,
      hasRealCode: true,
    });
    apiMocks.mergeTask.mockResolvedValue({ ok: true, message: "merged" });
    apiMocks.discardTask.mockResolvedValue({ ok: true, message: "discarded" });
  });

  it("renders final branch verification status from verify-commit", async () => {
    render(
      <I18nProvider language="en">
        <DiffModal taskId="task-1" onClose={vi.fn()} />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Final Branch Verification")).toBeInTheDocument();
    });

    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("1 commit")).toBeInTheDocument();
    expect(screen.getByText("src/verify.ts")).toBeInTheDocument();
    expect(apiMocks.getTaskVerifyCommit).toHaveBeenCalledWith("task-1");
  });
});
