import { z } from "zod";

export const Step1Schema = z.object({
  websiteUrl: z
    .string()
    .min(1, "Domain is required")
    .url("Provide valid URL like https://example.com"),
  projectName: z
    .string()
    .min(1, "Tên dự án là bắt buộc"),
  countryCode: z.string().min(1, "Mã quốc gia là bắt buộc"),
  languageCode: z.string().min(1, "Mã ngôn ngữ là bắt buộc"),
  crawlBudget: z.coerce.number().min(1, "Crawl budget phải lớn hơn 0"),
  userAgent: z.string().min(1, "User agent không được để trống"),
  crawlConcurrency: z.coerce.number().min(1, "Độ song song phải lớn hơn 0"),
  respectRobotsTxt: z.boolean(),
  urlExclusionRules: z.array(z.string()).default([]),
});

export type Step1Input = z.infer<typeof Step1Schema>;

export const Step2Schema = z.object({
  businessName: z.string().min(1, "Tên doanh nghiệp là bắt buộc"),
  businessDescription: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  audience: z.string().optional().default(""),
  location: z.string().optional().default(""),
  language: z.string().min(1, "Ngôn ngữ là bắt buộc"),
  phone: z.string().optional().default(""),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().min(1, "Phải cung cấp ít nhất 1 địa chỉ doanh nghiệp"),
  serviceAreas: z.array(z.string()).default([]),
  socialProfiles: z.array(z.string()).default([]),
  gscProperty: z.string().optional().default(""),
  gbpLocation: z.string().optional().default(""),
});

export type Step2Input = z.infer<typeof Step2Schema>;
