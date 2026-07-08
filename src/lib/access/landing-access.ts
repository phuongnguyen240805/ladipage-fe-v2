import type { PlanTier, BillingUsageDto } from "@liora/api-types";

export type AiGenerationUsage = {
  used: number;
  limit: number;
};

export type LandingAccessContext = {
  permissions: string[];
  subscriptionTier: PlanTier;
  billingUsage?: BillingUsageDto;
  aiGenerationUsage?: AiGenerationUsage;
  websiteBuilderInstalled: boolean;
  websiteBuilderCanOpen?: boolean;
};

export type LandingTemplateTierSource = {
  isPro?: boolean;
  price_type?: string | null;
};

export function hasLandingPermission(
  ctx: Pick<LandingAccessContext, "permissions">,
  permission: string
): boolean {
  return (
    ctx.permissions.includes("*") ||
    ctx.permissions.includes("admin") ||
    ctx.permissions.includes(permission)
  );
}

export function isProOrHigher(tier: PlanTier): boolean {
  return tier === "pro" || tier === "enterprise";
}

export function isProTemplate(template: LandingTemplateTierSource): boolean {
  return template.isPro === true || template.price_type === "pro";
}

/** Free template: mọi user. Pro template: tier Pro+ và (nếu có RBAC) permission use_pro. */
export function canUseProTemplate(ctx: LandingAccessContext): boolean {
  if (!isProOrHigher(ctx.subscriptionTier)) return false;
  if (ctx.permissions.length === 0) return true;
  return hasLandingPermission(ctx, "landing:templates:use_pro");
}

export function canApplyTemplate(
  ctx: LandingAccessContext,
  template: LandingTemplateTierSource
): boolean {
  if (!isProTemplate(template)) return true;
  return canUseProTemplate(ctx);
}

// Các gate khác — tạm tắt theo yêu cầu trước đó (không chặn hub/create/domains).
export function canAccessLandingHub(_ctx: LandingAccessContext): boolean {
  return true;
}

export function isUnlimitedPagesLimit(limit: number): boolean {
  return limit < 0;
}

export function canCreateLandingPageWithUsage(used: number, limit: number): boolean {
  if (isUnlimitedPagesLimit(limit)) return true;
  return used < limit;
}

/** Tạo page thủ công (blank, import, template) — không giới hạn quota. */
export function canCreateLandingPage(_ctx: LandingAccessContext): boolean {
  return true;
}

/** AI Generator / Clone URL / PPC — 5 lần / tài khoản (mặc định từ BE). */
export function canCreateAiLandingPage(ctx: LandingAccessContext): boolean {
  const used = ctx.aiGenerationUsage?.used ?? 0;
  const limit = ctx.aiGenerationUsage?.limit ?? 5;
  return canCreateLandingPageWithUsage(used, limit);
}

export function canUseAdvancedBuilderBlocks(_ctx: LandingAccessContext): boolean {
  return true;
}

export function canAccessDomainsTab(_ctx: LandingAccessContext): boolean {
  return true;
}

export function canAccessLeadsTab(_ctx: LandingAccessContext): boolean {
  return true;
}

export function canPublishLandingPage(_ctx: LandingAccessContext): boolean {
  return true;
}

export function canCreateDomain(_ctx: LandingAccessContext): boolean {
  return true;
}