import { z } from "zod";

// Simple domain matching regex to enforce correct format
export const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

export const CreateAiSeoProjectSchema = z.object({
  name: z.string().min(1, "Tên dự án là bắt buộc"),
  hostname: z
    .string()
    .min(3, "Tên miền tối thiểu 3 ký tự")
    .transform((val) => {
      // Remove https://, http://, or trailing slash for hostname normalization
      let clean = val.trim().toLowerCase();
      clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
      clean = clean.split("/")[0];
      return clean;
    })
    .refine((val) => DOMAIN_REGEX.test(val), {
      message: "Cung cấp tên miền hợp lệ ví dụ: example.com",
    }),
});

export type CreateAiSeoProjectInput = z.infer<typeof CreateAiSeoProjectSchema>;
