import React, { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlassSelect } from "./GlassSelect";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("glass select preserves form behavior", () => {
  it("retains the accessible name of an enclosing native label", () => {
    render(<label>Chọn khoa<GlassSelect><option>Khoa A</option></GlassSelect></label>);
    expect(screen.getByRole("combobox", { name: /Chọn khoa/ })).toBeInTheDocument();
  });
  it("keeps react-hook-form registration and blur validation working", async () => {
    const submitted = vi.fn();
    function RegisteredForm() {
      const { register, handleSubmit, formState } = useForm({ defaultValues: { language: "vi" }, mode: "onBlur" });
      return <form onSubmit={handleSubmit(submitted)}><GlassSelect aria-label="Ngôn ngữ" {...register("language", { required: true })}><option value="vi">Tiếng Việt</option><option value="en">English</option></GlassSelect><button type="submit">Lưu</button><output>{String(Boolean(formState.touchedFields.language))}</output></form>;
    }
    render(<RegisteredForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "English" }));
    await user.tab();
    expect(screen.getByRole("status")).toHaveTextContent("true");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(submitted.mock.calls[0]?.[0]).toEqual({ language: "en" }));
  });
  it("changes the controlled native value, event and submitted value through the popup", async () => {
    const changed = vi.fn();
    function Form() {
      const [value, setValue] = useState("one");
      return <form data-testid="form"><label htmlFor="status">Trạng thái</label><GlassSelect id="status" name="status" value={value} onChange={(event) => { changed(event.target.value); setValue(event.target.value); }}><option value="one">Một</option><option value="two">Hai</option><option value="blocked" disabled>Khóa</option></GlassSelect></form>;
    }
    render(<Form />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: "Trạng thái" }));
    const popup = screen.getByRole("listbox");
    expect(popup).toHaveAttribute("data-liquid-surface", "popover");
    expect(screen.getByRole("option", { name: "Khóa" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("option", { name: "Hai" }));
    expect(changed).toHaveBeenCalledExactlyOnceWith("two");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("status")).toBe("two");
    expect(screen.getByRole("combobox")).toHaveTextContent("Hai");
  });

  it("supports keyboard selection and native form reset for uncontrolled fields", async () => {
    render(<form data-testid="form"><GlassSelect name="amount" defaultValue="10" aria-label="Số lượng"><option value="10">10</option><option value="20">20</option></GlassSelect></form>);
    const user = userEvent.setup();
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await waitFor(() => expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("amount")).toBe("20"));
    (screen.getByTestId("form") as HTMLFormElement).reset();
    await waitFor(() => expect(trigger).toHaveTextContent("10"));
  });

  it("keeps the native ref, required validation, disabled state and dynamic options", async () => {
    const ref = React.createRef<HTMLSelectElement>();
    const { rerender } = render(<GlassSelect ref={ref} required disabled aria-label="Khoa"><option value="">Chọn khoa</option></GlassSelect>);
    expect(ref.current?.tagName).toBe("SELECT");
    expect(screen.getByRole("combobox")).toBeDisabled();
    rerender(<GlassSelect ref={ref} required aria-label="Khoa"><option value="">Chọn khoa</option><option value="new">Khoa mới</option></GlassSelect>);
    expect(ref.current?.checkValidity()).toBe(false);
    fireEvent.focus(ref.current!);
    expect(screen.getByRole("combobox")).toHaveFocus();
    await userEvent.setup().keyboard("{ArrowDown}");
    expect(await screen.findByRole("option", { name: "Khoa mới" })).toBeInTheDocument();
  });
});
