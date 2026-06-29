/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck
const now = new Date().toISOString();

const workspace = {
  id: "workspace_demo",
  name: "OfferKit Marketing",
  slug: "offerkit-marketing",
  currency: "USD",
  timezone: "Asia/Bangkok",
  locale: "vi-VN",
};

const campaigns = [
  {
    id: "camp_growth",
    name: "FB Lead Magnet - Growth Course",
    description: "Facebook lead offer for Growth Marketing course.",
    type: "DISCOUNT",
    status: "active",
    currency: "USD",
    timezone: "Asia/Bangkok",
    voucherCount: 128,
    perUserRedemptionLimit: 1,
    autoApply: false,
    codeLength: 8,
    codePrefix: "FB",
    startDate: now,
    endDate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp_trial",
    name: "E-Learning Trial Access",
    description: "Trial access codes for online learners.",
    type: "PROMOTION",
    status: "active",
    currency: "USD",
    timezone: "Asia/Bangkok",
    voucherCount: 86,
    perUserRedemptionLimit: 1,
    autoApply: false,
    codeLength: 10,
    codePrefix: "EDU",
    startDate: now,
    endDate: null,
    createdAt: now,
    updatedAt: now,
  },
];

const customers = [
  {
    id: "cus_001",
    externalId: "fb-lead-001",
    email: "lead@example.com",
    name: "Facebook Lead",
    phone: "0900000001",
    metadata: {},
    createdAt: now,
    updatedAt: now,
  },
];

const vouchers = [
  {
    id: "voucher_001",
    code: "FB-JUNE-24",
    campaignId: "camp_growth",
    type: "DISCOUNT",
    status: "active",
    discount: { type: "PERCENTAGE", value: 20 },
    redemptionLimit: 100,
    redemptionCount: 36,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  },
];

const rewardTypes = [
  {
    id: "reward_001",
    name: "Bonus lesson",
    description: "Unlock one extra lesson after milestone completion.",
    type: "COURSE_ACCESS",
    status: "active",
    value: 1,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  },
];

const validationRules = [
  {
    id: "rule_001",
    name: "One voucher per learner",
    description: "Limit campaign access to one code per learner.",
    appliesTo: "voucher",
    rule: { "==": [{ var: "customer.segment" }, "learner"] },
    createdAt: now,
    updatedAt: now,
  },
];

const segments = [
  {
    id: "seg_001",
    name: "Facebook learners",
    description: "Leads from Facebook campaigns who joined a course.",
    rule: {},
    count: 1284,
    createdAt: now,
    updatedAt: now,
  },
];

const orders = [
  {
    id: "ord_001",
    externalId: "enroll-001",
    customerId: "cus_001",
    amount: 86200,
    currency: "USD",
    status: "paid",
    createdAt: now,
    updatedAt: now,
  },
];

const events = [
  {
    id: "evt_001",
    type: "voucher.redeemed",
    subject: "FB-JUNE-24",
    payload: { channel: "facebook" },
    createdAt: now,
  },
];

const apiKeys = [
  {
    id: "key_001",
    name: "Demo integration",
    prefix: "demo12345678",
    scopes: ["*"],
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  },
];

const webhooks = [
  {
    id: "wh_001",
    name: "CRM webhook",
    url: "https://example.com/offerkit",
    events: ["voucher.redeemed"],
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
];

const loyaltyPrograms = [
  {
    id: "loyalty_001",
    name: "Growth Learning Path",
    campaignId: "camp_trial",
    status: "active",
    pointsName: "Points",
    createdAt: now,
    updatedAt: now,
  },
];

const referralPrograms = [
  {
    id: "ref_001",
    name: "Partner Sprint",
    campaignId: "camp_growth",
    status: "active",
    rewardType: "voucher",
    createdAt: now,
    updatedAt: now,
  },
];

function page(data: unknown[]) {
  return { data, next: null };
}

function first(data: Record<string, unknown>[]) {
  return data[0] ?? { id: "demo", name: "Demo item", createdAt: now, updatedAt: now };
}

function created(input?: unknown) {
  return {
    id: "demo_created",
    code: "DEMO-CODE",
    secret: "offerkit_demo_secret",
    createdAt: now,
    updatedAt: now,
    ...(typeof input === "object" && input ? input : {}),
  };
}

export function ovx(): any {
  return {
    workspace: {
      get: async () => workspace,
      update: async (input: unknown) => ({ ...workspace, ...input }),
    },
    campaigns: {
      list: async () => page(campaigns),
      get: async () => first(campaigns),
      create: async (input: unknown) => created(input),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
    },
    customers: {
      list: async () => page(customers),
      get: async () => first(customers),
      create: async (input: unknown) => created(input),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
    },
    vouchers: {
      list: async () => page(vouchers),
      get: async () => first(vouchers),
      create: async (input: unknown) => created(input),
      bulk: async () => ({ created: 25 }),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
      validate: async () => ({ valid: true, discount: { amount: 20, currency: "USD" } }),
      redeem: async () => ({ redeemed: true, redemptionId: "red_demo" }),
      stackRedeem: async () => ({ redeemed: true, redemptions: [] }),
      transactions: async () => page([]),
    },
    orders: {
      list: async () => page(orders),
      get: async () => first(orders),
      redemptions: async () => page([]),
      fulfill: async () => ({ ok: true }),
      cancel: async () => ({ ok: true }),
    },
    insights: {
      summary: async () => ({
        campaigns: campaigns.length,
        vouchers: vouchers.length,
        redemptions: 36,
        revenue: 86200,
        conversionRate: 0.72,
      }),
    },
    events: {
      list: async () => page(events),
    },
    rewardTypes: {
      list: async () => page(rewardTypes),
      get: async () => first(rewardTypes),
      create: async (input: unknown) => created(input),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
    },
    validationRules: {
      list: async () => page(validationRules),
      get: async () => first(validationRules),
      create: async (input: unknown) => created(input),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
    },
    segments: {
      list: async () => page(segments),
      get: async () => first(segments),
      create: async (input: unknown) => created(input),
      update: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
      preview: async () => ({ count: 42, sample: customers }),
    },
    apiKeys: {
      list: async () => page(apiKeys),
      create: async (input: unknown) => created(input),
      revoke: async () => ({ ok: true }),
    },
    auditLog: {
      list: async () => page(events),
    },
    webhooks: {
      list: async () => page(webhooks),
      get: async () => first(webhooks),
      create: async (input: unknown) => created(input),
      delete: async () => ({ ok: true }),
      deliveries: async () => page([]),
      replay: async () => ({ ok: true }),
    },
    referrals: {
      programs: {
        list: async () => page(referralPrograms),
        get: async () => first(referralPrograms),
        create: async (input: unknown) => created(input),
        delete: async () => ({ ok: true }),
      },
      listCodes: async () => page([]),
      listProgramConversions: async () => page([]),
      issue: async () => ({ code: "REF-DEMO" }),
      convert: async () => ({ converted: true }),
    },
    loyalty: {
      programs: {
        list: async () => page(loyaltyPrograms),
        get: async () => first(loyaltyPrograms),
        create: async (input: unknown) => created(input),
        delete: async () => ({ ok: true }),
      },
      tiers: {
        list: async () => page([]),
        create: async (input: unknown) => created(input),
        delete: async () => ({ ok: true }),
      },
      earningRules: {
        list: async () => page([]),
        create: async (input: unknown) => created(input),
        delete: async () => ({ ok: true }),
      },
      rewards: {
        list: async () => page([]),
        create: async (input: unknown) => created(input),
        delete: async () => ({ ok: true }),
      },
      members: {
        list: async () => page([]),
        get: async () => ({ id: "member_001", customerId: "cus_001", programId: "loyalty_001", points: 120 }),
        history: async () => page([]),
        enroll: async () => created(),
        earn: async () => ({ points: 120 }),
        adjust: async () => ({ points: 120 }),
        redeem: async () => ({ redeemed: true }),
      },
    },
  };
}
