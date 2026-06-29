import { z } from "zod";

export const UpdateTaskSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
