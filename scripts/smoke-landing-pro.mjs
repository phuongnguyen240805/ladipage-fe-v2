const TIER_RANK = { free: 0, pro: 1, enterprise: 2 };

function hasPermission(permissions, permission) {
  return permissions.includes("*") || permissions.includes("admin") || permissions.includes(permission);
}

function isProOrHigher(tier) {
  return TIER_RANK[tier] >= TIER_RANK.pro;
}

function canUseProTemplate(ctx) {
  return isProOrHigher(ctx.subscriptionTier) && hasPermission(ctx.permissions, "landing:templates:use_pro");
}

function canUseAdvancedBlocks(ctx) {
  return isProOrHigher(ctx.subscriptionTier) && hasPermission(ctx.permissions, "landing:builder:advanced");
}

function canCreatePage(ctx) {
  return ctx.pages.used < ctx.pages.limit && hasPermission(ctx.permissions, "landing:pages:edit");
}

const basePermissions = [
  "landing:pages:view",
  "landing:pages:edit",
  "landing:templates:use_pro",
  "landing:builder:advanced",
];

const free = {
  permissions: basePermissions,
  subscriptionTier: "free",
  pages: { used: 2, limit: 1 },
};

const pro = {
  permissions: basePermissions,
  subscriptionTier: "pro",
  pages: { used: 2, limit: 50 },
};

const assertions = [
  ["free blocks pro template", canUseProTemplate(free) === false],
  ["pro allows pro template", canUseProTemplate(pro) === true],
  ["free blocks advanced blocks", canUseAdvancedBlocks(free) === false],
  ["pro allows advanced blocks", canUseAdvancedBlocks(pro) === true],
  ["free quota blocks create", canCreatePage(free) === false],
  ["pro quota allows create", canCreatePage(pro) === true],
];

const failed = assertions.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("Landing Pro smoke failed:");
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log("Landing Pro smoke passed");
