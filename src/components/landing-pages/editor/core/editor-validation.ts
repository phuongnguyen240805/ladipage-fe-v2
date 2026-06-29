import { EditorBlock, EditorData } from "../types";

export type EditorValidationSeverity = "error" | "warning";

export interface EditorValidationIssue {
  severity: EditorValidationSeverity;
  path: string;
  message: string;
}

export function validateEditorData(data: EditorData): EditorValidationIssue[] {
  const issues: EditorValidationIssue[] = [];

  if (!data.pageSettings.slug?.trim()) {
    issues.push({ severity: "error", path: "pageSettings.slug", message: "Page slug is required." });
  }

  if (!data.pageSettings.seoTitle?.trim()) {
    issues.push({ severity: "error", path: "pageSettings.seoTitle", message: "SEO title is required." });
  }

  data.sections.forEach((block, index) => validateBlock(block, `sections.${index}`, issues));
  return issues;
}

export function hasPublishBlockingIssues(data: EditorData): boolean {
  return validateEditorData(data).some((issue) => issue.severity === "error");
}

function validateBlock(block: EditorBlock, path: string, issues: EditorValidationIssue[]) {
  const props = block.props as Record<string, unknown>;

  if (block.type === "image" && !String(props.alt ?? "").trim()) {
    issues.push({ severity: "warning", path: `${path}.props.alt`, message: "Image should have alt text." });
  }

  if (block.type === "button" && !String(props.url ?? "").trim()) {
    issues.push({ severity: "error", path: `${path}.props.url`, message: "Button URL is required before publish." });
  }

  if (block.type === "form_capture" && Array.isArray(props.fields)) {
    props.fields.forEach((field, index) => {
      if (field && typeof field === "object" && "required" in field && (field as { required?: unknown }).required) {
        if (!String((field as { label?: unknown }).label ?? "").trim()) {
          issues.push({ severity: "error", path: `${path}.props.fields.${index}.label`, message: "Required form field needs a label." });
        }
      }
    });
  }

  const isPreservedHtml =
    block.type === "html_code" &&
    (block.props?.preserveHtml === true || block.props?.mode === "iframe");

  if (
    block.type === "html_code" &&
    !isPreservedHtml &&
    /<script|\son\w+=|javascript:/i.test(String(props.code ?? ""))
  ) {
    issues.push({ severity: "error", path: `${path}.props.code`, message: "HTML code contains unsafe script or event handler." });
  }

  if (block.type === "columns" && Array.isArray(props.children)) {
    props.children.forEach((column, columnIndex) => {
      if (!Array.isArray(column)) return;
      column.forEach((child, childIndex) => validateBlock(child as EditorBlock, `${path}.props.children.${columnIndex}.${childIndex}`, issues));
    });
  }

  if (Array.isArray(block.children)) {
    block.children.forEach((child, childIndex) => validateBlock(child, `${path}.children.${childIndex}`, issues));
  }
}
