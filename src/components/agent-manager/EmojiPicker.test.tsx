import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EmojiPicker from "./EmojiPicker";

describe("EmojiPicker", () => {
  it("renders translated group labels when opened", () => {
    const handleChange = vi.fn();

    render(<EmojiPicker tr={(_, en) => en} value="🤖" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: "🤖" }));

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Objects")).toBeInTheDocument();
    expect(screen.getByText("Nature")).toBeInTheDocument();
    expect(screen.queryByText("부서/업무")).not.toBeInTheDocument();
    expect(screen.queryByText("사람/표정")).not.toBeInTheDocument();
  });
});
