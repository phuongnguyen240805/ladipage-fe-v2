import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { platformAuthService } from "@/features/auth/services/platform-auth.service";
import SignUpForm from "./SignUpForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/icons", () => ({
  ChevronLeftIcon: () => <span aria-hidden="true" />,
  EyeCloseIcon: () => <span aria-hidden="true" />,
  EyeIcon: () => <span aria-hidden="true" />,
}));

afterEach(() => {
  vi.restoreAllMocks();
  push.mockReset();
});

describe("SignUpForm", () => {
  it("registers through the backend before redirecting to sign in", async () => {
    const user = userEvent.setup();
    const signUp = vi
      .spyOn(platformAuthService, "signUp")
      .mockResolvedValue({ message: "Đăng ký thành công" });
    vi.spyOn(window, "alert").mockImplementation(() => undefined);

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText("Nhập tên"), "An");
    await user.type(screen.getByPlaceholderText("Nhập họ"), "Nguyễn");
    await user.type(screen.getByPlaceholderText("info@gmail.com"), "an.nguyen@gmail.com");
    await user.type(screen.getByPlaceholderText("Tạo mật khẩu"), "Password1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    expect(signUp).toHaveBeenCalledWith(
      "an.nguyen@gmail.com",
      "Password1",
      "An Nguyễn",
    );
    expect(push).toHaveBeenCalledWith("/signin");
  });

  it("shows the backend error and does not redirect when registration fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(platformAuthService, "signUp").mockRejectedValue(
      new Error("Email này đã được đăng ký."),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText("Nhập tên"), "An");
    await user.type(screen.getByPlaceholderText("Nhập họ"), "Nguyễn");
    await user.type(screen.getByPlaceholderText("info@gmail.com"), "an.nguyen@gmail.com");
    await user.type(screen.getByPlaceholderText("Tạo mật khẩu"), "Password1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    expect(await screen.findByText("Email này đã được đăng ký.")).toBeVisible();
    expect(push).not.toHaveBeenCalled();
  });
});
