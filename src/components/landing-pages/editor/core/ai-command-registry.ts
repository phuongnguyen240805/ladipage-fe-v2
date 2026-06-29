import { BlockType } from "../types";

export interface AICommand {
  patterns: string[];
  action: string;
  blockType?: BlockType;
  updateKey?: string;
  updateValue?: any;
  explanation: string;
}

export const AI_COMMANDS: AICommand[] = [
  {
    patterns: ["thêm mục liên hệ", "thêm form liên hệ", "add contact section", "contact section"],
    action: "insert_block",
    blockType: "form_capture",
    explanation: "Tôi đã thêm một khối liên hệ để hỗ trợ bạn thu thập thông tin khách hàng.",
  },
  {
    patterns: ["thêm danh sách tính năng", "thêm tính năng", "add features", "features list"],
    action: "insert_block",
    blockType: "feature_card",
    explanation: "Đã chèn thêm khối tính năng & lợi ích sản phẩm vào thiết kế.",
  },
  {
    patterns: ["thêm ý kiến khách hàng", "thêm đánh giá", "add testimonials", "testimonials section"],
    action: "insert_block",
    blockType: "testimonial",
    explanation: "Đã chèn thêm khối ý kiến và đánh giá từ khách hàng.",
  },
  {
    patterns: ["đổi màu nền sang đen", "nền màu đen", "nền tối", "black background", "dark theme"],
    action: "update_page_settings",
    updateKey: "bgColor",
    updateValue: "#09090b",
    explanation: "Đã cập nhật nền của toàn bộ Landing Page sang màu tối huyền bí (#09090b).",
  },
  {
    patterns: ["đổi màu nền sang trắng", "nền màu trắng", "white background", "light theme"],
    action: "update_page_settings",
    updateKey: "bgColor",
    updateValue: "#ffffff",
    explanation: "Đã trả màu nền Landing Page về màu trắng sáng tinh khôi (#ffffff).",
  },
  {
    patterns: ["đổi phông chữ", "đổi font", "font chữ", "change font"],
    action: "update_page_settings",
    updateKey: "fontFamily",
    updateValue: "Georgia, serif",
    explanation: "Đã chuyển đổi phông chữ toàn bộ trang sang phông chữ Georgia sang trọng.",
  },
];

export function findMatchingCommand(userInput: string): AICommand | null {
  const normalized = userInput.toLowerCase().trim();
  for (const cmd of AI_COMMANDS) {
    for (const pattern of cmd.patterns) {
      if (normalized.includes(pattern)) {
        return cmd;
      }
    }
  }
  return null;
}
