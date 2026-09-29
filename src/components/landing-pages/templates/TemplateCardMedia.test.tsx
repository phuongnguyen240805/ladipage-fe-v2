import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TemplateItem } from "../dung-chung/types";
import { TemplateCardMedia, resetTemplateCardPreviewCache } from "./TemplateCardMedia";
import { TemplateUiPreview, previewPanVisualSpeed } from "./TemplateUiPreview";

vi.mock("./template-service", () => ({
  loadTemplateEditorData: vi.fn(),
}));

import { loadTemplateEditorData } from "./template-service";

const loadTemplateEditorDataMock = vi.mocked(loadTemplateEditorData);

function mediaMatches(query: string) {
  if (query.includes("prefers-reduced-motion")) return false;
  if (query.includes("hover: hover")) return true;
  return false;
}

function template(overrides: Partial<TemplateItem> = {}): TemplateItem {
  return {
    id: "template-1",
    name: "LDP - Trà sen",
    image: "/images/template_tea.png",
    category: "ecommerce",
    isPro: false,
    views: 12,
    downloads: 3,
    scrollDist: "calc(-100% + 260px)",
    editor_data_url: "/template-artifacts/tea/editor-data.json",
    render_url: "/template-artifacts/tea/render.html",
    ...overrides,
  };
}

const pageData = {
  sections: [
    {
      id: "hero",
      type: "text",
      props: { content: "Đầu trang" },
      frame: { height: 1800 },
      children: [],
    },
  ],
};

describe("TemplateCardMedia", () => {
  beforeEach(() => {
    resetTemplateCardPreviewCache();
    loadTemplateEditorDataMock.mockReset();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: mediaMatches(query),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
  });

  it("keeps the still image until hover, then pans the loaded page", async () => {
    loadTemplateEditorDataMock.mockResolvedValue(pageData);
    const { container } = render(<TemplateCardMedia template={template()} />);

    expect(screen.getByRole("img", { name: "LDP - Trà sen" })).toBeInTheDocument();
    expect(loadTemplateEditorDataMock).not.toHaveBeenCalled();

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải xem trước template");

    await waitFor(() => {
      expect(container.querySelector(".template-ui-scroll-effect.is-playing")).toBeTruthy();
    });
    expect(screen.queryByRole("img", { name: "LDP - Trà sen" })).not.toBeInTheDocument();

    fireEvent.mouseLeave(container.firstElementChild as HTMLElement);
    await waitFor(() => {
      expect(container.querySelector(".template-ui-scroll-effect.is-playing")).toBeNull();
    });
    expect(container.querySelector(".template-ui-scroll-effect")).toBeTruthy();
  });

  it("keeps the still image when the page cannot be loaded", async () => {
    loadTemplateEditorDataMock.mockResolvedValue(null);
    const { container } = render(<TemplateCardMedia template={template()} />);

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    await waitFor(() => {
      expect(loadTemplateEditorDataMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("img", { name: "LDP - Trà sen" })).toBeInTheDocument();
    expect(container.querySelector(".template-ui-scroll-effect")).toBeNull();
  });

  it("loads the page but stays at the top when motion is reduced", async () => {
    loadTemplateEditorDataMock.mockResolvedValue(pageData);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion") || query.includes("hover: hover"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
    const { container } = render(<TemplateCardMedia template={template()} />);

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    await waitFor(() => {
      expect(container.querySelector(".template-ui-scroll-effect")).toBeTruthy();
    });
    expect(container.querySelector(".template-ui-scroll-effect.is-playing")).toBeNull();
  });

  it("does not load the page on devices without hover", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
    const { container } = render(<TemplateCardMedia template={template()} />);

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    expect(loadTemplateEditorDataMock).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "LDP - Trà sen" })).toBeInTheDocument();
  });
});

describe("preview pan speed", () => {
  it("keeps one calm speed for long pages and slows short pages down", () => {
    expect(previewPanVisualSpeed(1600)).toBe(72);
    expect(previewPanVisualSpeed(200)).toBeCloseTo(200 / 6.5);
  });
});

describe("TemplateUiPreview card scroll", () => {
  it("lays preserved html out in document flow so the full page can pan", () => {
    const { container } = render(
      <TemplateUiPreview
        mode="card"
        playing={false}
        template={template({
          editor_data: {
            sections: [
              {
                id: "preserved",
                type: "custom_section",
                frame: { height: 900 },
                children: [
                  {
                    id: "html",
                    type: "html_code",
                    props: {
                      code: "<main><h1>Đầu trang</h1><p>Cuối trang</p></main>",
                      preserveHtml: true,
                      mode: "iframe",
                      height: 900,
                    },
                    frame: { x: 0, y: 0, width: 1280, height: 900 },
                  },
                ],
              },
            ],
          },
        })}
      />,
    );

    const flow = container.querySelector("[data-preview-flow='true']") as HTMLElement | null;
    expect(flow).toBeTruthy();
    expect(flow?.style.height).toBe("auto");
    expect(flow?.style.overflow).toBe("visible");
    expect(container.querySelector(".template-ui-scroll-effect")).toBeTruthy();
  });
});
