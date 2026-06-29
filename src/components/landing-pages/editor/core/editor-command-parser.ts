import { BlockType, createDefaultBlock, EditorBlock } from "../types";
import { EditorAction } from "./editor-actions";

export interface ParsedEditorCommand {
  actions: EditorAction[];
  message: string;
}

export function parseEditorCommand(
  text: string,
  selectedBlock: EditorBlock | null,
): ParsedEditorCommand {
  const normalized = text.toLowerCase().trim();
  const actions: EditorAction[] = [];

  if (selectedBlock) {
    const props: Record<string, unknown> = {};

    if (normalized.includes("màu cam") || normalized.includes("orange")) props.color = "#f97316";
    if (normalized.includes("màu đỏ") || normalized.includes("red")) props.color = "#ef4444";
    if (normalized.includes("màu đen") || normalized.includes("black")) props.color = "#111827";
    if (normalized.includes("căn giữa") || normalized.includes("center")) props.textAlign = "center";
    if (normalized.includes("căn trái")) props.textAlign = "left";
    if (normalized.includes("căn phải")) props.textAlign = "right";

    const quoted = text.match(/["'“](.+?)["'”]/)?.[1]?.trim();
    if (quoted) {
      if ("headline" in selectedBlock.props) props.headline = quoted;
      else if ("content" in selectedBlock.props) props.content = quoted;
      else if ("label" in selectedBlock.props) props.label = quoted;
      else if ("title" in selectedBlock.props) props.title = quoted;
    }

    if (Object.keys(props).length > 0) {
      actions.push({ type: "UPDATE_BLOCK_PROPS", blockId: selectedBlock.id, props });
      return { actions, message: "Đã tạo lệnh cập nhật block đang chọn." };
    }

    if (normalized.includes("xóa block")) {
      actions.push({ type: "DELETE_BLOCK", blockId: selectedBlock.id });
      return { actions, message: "Đã tạo lệnh xóa block đang chọn." };
    }

    if (normalized.includes("nhân đôi")) {
      actions.push({ type: "DUPLICATE_BLOCK", blockId: selectedBlock.id });
      return { actions, message: "Đã tạo lệnh nhân đôi block đang chọn." };
    }
  }

  if (normalized.includes("thêm block") || normalized.includes("tạo block") || normalized.includes("thêm")) {
    const type = resolveBlockType(normalized);
    actions.push({ type: "INSERT_BLOCK", block: createDefaultBlock(type) });
    return { actions, message: `Đã tạo lệnh thêm block ${type}.` };
  }

  if (normalized.includes("nền đen")) {
    actions.push({ type: "UPDATE_PAGE_SETTINGS", key: "bgColor", value: "#09090b" });
    return { actions, message: "Đã tạo lệnh đổi nền trang." };
  }

  return { actions, message: "Mình đã hiểu yêu cầu. Hãy chọn block cụ thể để chỉnh chính xác hơn." };
}

function resolveBlockType(text: string): BlockType {
  if (text.includes("popup")) return "funnel_popup";
  if (text.includes("form")) return "form_capture";
  if (text.includes("nút") || text.includes("button")) return "button";
  if (text.includes("ảnh") || text.includes("image")) return "image";
  if (text.includes("hero")) return "hero";
  if (text.includes("countdown") || text.includes("đếm ngược")) return "countdown";
  return "text";
}
