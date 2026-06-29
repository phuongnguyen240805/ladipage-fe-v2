import { z } from "zod";

// Simple domain matching regex to enforce correct format
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-5]{2,6}$/i;

export const CreateSeoProjectSchema = z.object({
  projectId: z.string().uuid("ID dự án không hợp lệ"),
  domain: z
    .string()
    .min(3, "Tên miền tối thiểu 3 ký tự")
    .regex(DOMAIN_REGEX, "Định dạng tên miền không hợp lệ (ví dụ: website.com)"),
});

export type CreateSeoProjectInput = z.infer<typeof CreateSeoProjectSchema>;
