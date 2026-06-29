import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Tên dự án phải chứa ít nhất 3 ký tự")
    .max(50, "Tên dự án tối đa 50 ký tự")
    .trim(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
