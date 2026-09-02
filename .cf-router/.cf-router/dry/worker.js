var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../.open-next/middleware/open-next.config.mjs
var open_next_config_exports = {};
__export(open_next_config_exports, {
  default: () => open_next_config_default
});
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function getCloudflareContextFromWrangler(options) {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const environment = options?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV;
  const { env, cf, ctx } = await getPlatformProxy({
    ...options,
    // The `env` passed to the fetch handler does not contain variables from `.env*` files.
    // because we invoke wrangler with `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV`=`"false"`.
    // Initializing `envFiles` with an empty list is the equivalent for this API call.
    envFiles: [],
    environment
  });
  return {
    env,
    cf,
    ctx
  };
}
function getResponseBody(method, response) {
  if (method === "HEAD") {
    return null;
  }
  return response.body || new ReadableStream();
}
function isUserWorkerFirst(runWorkerFirst, pathname) {
  if (!Array.isArray(runWorkerFirst)) {
    return runWorkerFirst ?? false;
  }
  let hasPositiveMatch = false;
  for (let rule of runWorkerFirst) {
    let isPositiveRule = true;
    if (rule.startsWith("!")) {
      rule = rule.slice(1);
      isPositiveRule = false;
    } else if (hasPositiveMatch) {
      continue;
    }
    const match2 = new RegExp(`^${rule.replace(/([[\]().*+?^$|{}\\])/g, "\\$1").replace("\\*", ".*")}$`).test(pathname);
    if (match2) {
      if (isPositiveRule) {
        hasPositiveMatch = true;
      } else {
        return false;
      }
    }
  }
  return hasPositiveMatch;
}
function defineCloudflareConfig(config = {}) {
  const { incrementalCache, tagCache, queue, cachePurge, enableCacheInterception = false, routePreloadingBehavior = "none" } = config;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue),
        cdnInvalidation: resolveCdnInvalidation(cachePurge)
      },
      routePreloadingBehavior
    },
    // node:crypto is used to compute cache keys
    edgeExternals: ["node:crypto"],
    cloudflare: {
      useWorkerdCondition: true
    },
    dangerous: {
      enableCacheInterception
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue)
      },
      assetResolver: /* @__PURE__ */ __name(() => asset_resolver_default, "assetResolver")
    }
  };
}
function resolveIncrementalCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveTagCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveQueue(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveCdnInvalidation(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
var cloudflareContextSymbol, initOpenNextCloudflareForDevErrorMsg, resolver, asset_resolver_default, baseConfig, open_next_config_default;
var init_open_next_config = __esm({
  "../.open-next/middleware/open-next.config.mjs"() {
    "use strict";
    cloudflareContextSymbol = /* @__PURE__ */ Symbol.for("__cloudflare-context__");
    __name(getCloudflareContext, "getCloudflareContext");
    __name(getCloudflareContextFromGlobalScope, "getCloudflareContextFromGlobalScope");
    __name(inSSG, "inSSG");
    __name(getCloudflareContextSync, "getCloudflareContextSync");
    __name(getCloudflareContextAsync, "getCloudflareContextAsync");
    __name(addCloudflareContextToNodejsGlobal, "addCloudflareContextToNodejsGlobal");
    __name(getCloudflareContextFromWrangler, "getCloudflareContextFromWrangler");
    initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;
    resolver = {
      name: "cloudflare-asset-resolver",
      async maybeGetAssetResult(event) {
        const { ASSETS } = getCloudflareContext().env;
        if (!ASSETS || !isUserWorkerFirst(globalThis.__ASSETS_RUN_WORKER_FIRST__, event.rawPath)) {
          return void 0;
        }
        const { method, headers } = event;
        if (method !== "GET" && method != "HEAD") {
          return void 0;
        }
        const url = new URL(event.rawPath, "https://assets.local");
        const response = await ASSETS.fetch(url, {
          headers,
          method
        });
        if (response.status === 404) {
          await response.body?.cancel();
          return void 0;
        }
        return {
          type: "core",
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: getResponseBody(method, response),
          isBase64Encoded: false
        };
      }
    };
    __name(getResponseBody, "getResponseBody");
    __name(isUserWorkerFirst, "isUserWorkerFirst");
    asset_resolver_default = resolver;
    __name(defineCloudflareConfig, "defineCloudflareConfig");
    __name(resolveIncrementalCache, "resolveIncrementalCache");
    __name(resolveTagCache, "resolveTagCache");
    __name(resolveQueue, "resolveQueue");
    __name(resolveCdnInvalidation, "resolveCdnInvalidation");
    baseConfig = defineCloudflareConfig();
    open_next_config_default = {
      ...baseConfig,
      functions: {
        landing: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/landing-pages/[pageId]/edit/page",
            "app/(admin)/landing-pages/editor/[pageId]/page",
            "app/(admin)/landing-pages/page",
            "app/(admin)/landing-pages/templates/page",
            "app/api/landing-cms/session/route",
            "app/api/landing-pages/[id]/lab-preview/route",
            "app/api/landing-pages/[id]/publish/route",
            "app/api/landing-pages/domains/[id]/refresh/route",
            "app/api/landing-pages/domains/[id]/route",
            "app/api/landing-pages/domains/[id]/routes/route",
            "app/api/landing-pages/domains/route",
            "app/api/landing-pages/form-configs/route",
            "app/api/landing-pages/import/route",
            "app/api/landing-pages/import-zip/route",
            "app/api/landing-pages/leads/route",
            "app/api/landing-pages/route",
            "app/api/landing-pages/tags/[tagId]/route",
            "app/api/landing-pages/tags/route",
            "app/api/public/landing-pages/sdk-config/route",
            "app/api/public/landing-templates/list/route",
            "app/api/public/landing-templates/sdk-config/route",
            "app/api/revalidate/landing/route",
            "app/api/templates/[id]/stats/route",
            "app/api/templates/detail/route",
            "app/api/templates/list/route",
            "app/api/templates/stats/route",
            "app/ladipage/page",
            "app/p/[slug]/route",
            "app/sdk/builder.js/route",
            "app/sdk/landingpage.js/route",
            "app/sdk/landingpage-runtime.js/route",
            "app/sdk/landing-template.js/route",
            "app/sdk/landing-template-runtime.js/route",
            "app/templates/[slug]/route"
          ],
          patterns: [
            "/api/landing-cms",
            "/api/landing-cms/*",
            "/api/landing-pages",
            "/api/landing-pages/*",
            "/api/public/landing-pages",
            "/api/public/landing-pages/*",
            "/api/public/landing-templates",
            "/api/public/landing-templates/*",
            "/api/revalidate/landing",
            "/api/revalidate/landing/*",
            "/api/templates",
            "/api/templates/*",
            "/ladipage",
            "/ladipage/*",
            "/landing-pages",
            "/landing-pages/*",
            "/p",
            "/p/*",
            "/sdk",
            "/sdk/*",
            "/templates",
            "/templates/*"
          ]
        },
        builder: {
          ...baseConfig.default,
          routes: [
            "app/(builder)/builder/[pageId]/page",
            "app/api/builder/import-html/route",
            "app/api/builder/pages/[pageId]/route",
            "app/api/builder/publish/route",
            "app/api/builder/session/route",
            "app/api/builder/upload/route"
          ],
          patterns: [
            "/api/builder",
            "/api/builder/*",
            "/builder",
            "/builder/*"
          ]
        },
        ai: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/ai-seo/chat/page",
            "app/(admin)/ai-seo/history/page",
            "app/(admin)/ai-seo/page",
            "app/(admin)/ai-seo/playbooks/page",
            "app/(admin)/ai-seo/projects/[projectId]/installation/page",
            "app/(admin)/ai-seo/projects/[projectId]/landing-pages/page",
            "app/(admin)/ai-seo/projects/[projectId]/page",
            "app/(admin)/ai-seo/projects/[projectId]/tasks/page",
            "app/(admin)/ai-seo/projects/create/page",
            "app/(admin)/ai-seo/projects/page",
            "app/(admin)/otto/create-project/page",
            "app/(admin)/otto/page",
            "app/api/ai-seo/agents/route",
            "app/api/ai-seo/conversations/[id]/messages/route",
            "app/api/ai-seo/conversations/[id]/route",
            "app/api/ai-seo/conversations/route",
            "app/api/ai-seo/integrations/google/gbp/callback/route",
            "app/api/ai-seo/integrations/google/gbp/connect-url/route",
            "app/api/ai-seo/integrations/google/gsc/callback/route",
            "app/api/ai-seo/integrations/google/gsc/connect-url/route",
            "app/api/ai-seo/jobs/[jobId]/events/route",
            "app/api/ai-seo/jobs/[jobId]/route",
            "app/api/ai-seo/projects/[projectId]/agent-status/route",
            "app/api/ai-seo/projects/[projectId]/favorite/route",
            "app/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/route",
            "app/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scan/route",
            "app/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scores/route",
            "app/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/tasks/route",
            "app/api/ai-seo/projects/[projectId]/landing-pages/route",
            "app/api/ai-seo/projects/[projectId]/route",
            "app/api/ai-seo/projects/[projectId]/scan/route",
            "app/api/ai-seo/projects/route",
            "app/api/ai-seo/reconcile-published/route",
            "app/api/ai-seo/runs/[runId]/tool-calls/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/installation/check/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/installation/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/setup/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/start-audit/route",
            "app/api/ai-seo/seo-projects/[seoProjectId]/tasks/route",
            "app/api/ai-seo/seo-projects/route",
            "app/api/ai-seo/seo-tasks/[taskId]/approve/route",
            "app/api/ai-seo/seo-tasks/[taskId]/deploy/route",
            "app/api/ai-seo/seo-tasks/[taskId]/reject/route",
            "app/api/ai-seo/seo-tasks/[taskId]/route",
            "app/api/ai-seo/seo-tasks/route",
            "app/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/connect-ai-seo/route",
            "app/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/publish/route",
            "app/api/ai-seo/website-projects/[websiteProjectId]/pages/route",
            "app/api/ai-seo/website-projects/route",
            "app/api/flowise/[...path]/route"
          ],
          patterns: [
            "/ai-seo",
            "/ai-seo/*",
            "/api/ai-seo",
            "/api/ai-seo/*",
            "/api/flowise",
            "/api/flowise/*",
            "/otto",
            "/otto/*"
          ]
        },
        education: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/e-learning/bao-cao/page",
            "app/(admin)/e-learning/branch-management/page",
            "app/(admin)/e-learning/consultant/page",
            "app/(admin)/e-learning/danh-muc/page",
            "app/(admin)/e-learning/giang-vien/page",
            "app/(admin)/e-learning/khoa-hoc/page",
            "app/(admin)/e-learning/lecturer/attendance/page",
            "app/(admin)/e-learning/lecturer/enter-grades/page",
            "app/(admin)/e-learning/lecturer/learning-progress/page",
            "app/(admin)/e-learning/lecturer/lecture-editor/page",
            "app/(admin)/e-learning/lecturer/lectures/page",
            "app/(admin)/e-learning/lecturer/my-classes/page",
            "app/(admin)/e-learning/lecturer/my-schedule/page",
            "app/(admin)/e-learning/lecturer/page",
            "app/(admin)/e-learning/lecturer/profile/page",
            "app/(admin)/e-learning/lecturer/room-info/page",
            "app/(admin)/e-learning/lecturer/schedule-adjustments/page",
            "app/(admin)/e-learning/page",
            "app/(admin)/e-learning/parents/page",
            "app/(admin)/e-learning/sinh-vien/page",
            "app/(admin)/e-learning/student/[...feature]/page",
            "app/(admin)/e-learning/student/page",
            "app/(admin)/e-learning/thiet-lap/page",
            "app/(admin)/e-learning/thoi-khoa-bieu/page",
            "app/(admin)/e-learning/tong-quan/page",
            "app/education/change-password/page",
            "app/education/dashboard/admin/(auth)/signin/page",
            "app/education/dashboard/admin/[...feature]/page",
            "app/education/dashboard/admin/academic-cohorts/page",
            "app/education/dashboard/admin/buildings/page",
            "app/education/dashboard/admin/classes/page",
            "app/education/dashboard/admin/contracts/page",
            "app/education/dashboard/admin/course-classes/page",
            "app/education/dashboard/admin/courses/[id]/page",
            "app/education/dashboard/admin/courses/page",
            "app/education/dashboard/admin/degrees/page",
            "app/education/dashboard/admin/departments/page",
            "app/education/dashboard/admin/divisions/page",
            "app/education/dashboard/admin/employees/page",
            "app/education/dashboard/admin/lecturers/page",
            "app/education/dashboard/admin/majors/page",
            "app/education/dashboard/admin/page",
            "app/education/dashboard/admin/password-reset-requests/page",
            "app/education/dashboard/admin/persons/page",
            "app/education/dashboard/admin/positions/page",
            "app/education/dashboard/admin/rbac/page",
            "app/education/dashboard/admin/rooms/[id]/page",
            "app/education/dashboard/admin/rooms/page",
            "app/education/dashboard/admin/schedule-adjustments/page",
            "app/education/dashboard/admin/schedules/page",
            "app/education/dashboard/admin/school-years/page",
            "app/education/dashboard/admin/semesters/page",
            "app/education/dashboard/admin/specializations/page",
            "app/education/dashboard/admin/staffs/page",
            "app/education/dashboard/admin/student-class-assignments/page",
            "app/education/dashboard/admin/students/page",
            "app/education/dashboard/admin/student-status-catalog/page",
            "app/education/dashboard/admin/time-slots/page",
            "app/education/dashboard/admin/training-programs/page",
            "app/education/dashboard/admin/users/page",
            "app/education/dashboard/branch-management/(auth)/signin/page",
            "app/education/dashboard/branch-management/page",
            "app/education/dashboard/consultant/page",
            "app/education/dashboard/lecturer/attendance/page",
            "app/education/dashboard/lecturer/enter-grades/page",
            "app/education/dashboard/lecturer/learning-progress/page",
            "app/education/dashboard/lecturer/lecture-editor/page",
            "app/education/dashboard/lecturer/lectures/page",
            "app/education/dashboard/lecturer/my-classes/page",
            "app/education/dashboard/lecturer/my-schedule/page",
            "app/education/dashboard/lecturer/page",
            "app/education/dashboard/lecturer/profile/page",
            "app/education/dashboard/lecturer/room-info/page",
            "app/education/dashboard/lecturer/schedule-adjustments/page",
            "app/education/dashboard/parents/page",
            "app/education/dashboard/student/[...feature]/page",
            "app/education/dashboard/student/academic-results/page",
            "app/education/dashboard/student/my-schedule/page",
            "app/education/dashboard/student/page",
            "app/education/dashboard/student/profile/page",
            "app/education/forgot-password/page",
            "app/education/page",
            "app/education/profile/page"
          ],
          patterns: [
            "/education",
            "/education/*",
            "/e-learning",
            "/e-learning/*"
          ]
        },
        ads: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/facebook-ads/assets/page",
            "app/(admin)/facebook-ads/cai-dat/page",
            "app/(admin)/facebook-ads/connections/page",
            "app/(admin)/facebook-ads/create/page",
            "app/(admin)/facebook-ads/drafts/page",
            "app/(admin)/facebook-ads/email-tam-thoi/page",
            "app/(admin)/facebook-ads/fanpage/page",
            "app/(admin)/facebook-ads/guide/page",
            "app/(admin)/facebook-ads/manager/page",
            "app/(admin)/facebook-ads/permissions/page",
            "app/(admin)/facebook-ads/policy/page",
            "app/(admin)/facebook-ads/reports/page",
            "app/(admin)/facebook-ads/rules/page",
            "app/(admin)/facebook-ads/support/page",
            "app/(admin)/facebook-ads/tai-khoan-bm/page",
            "app/(admin)/facebook-ads/tai-khoan-qc/page",
            "app/(admin)/facebook-ads/tools/[slug]/page",
            "app/(admin)/facebook-ads/tools/page",
            "app/(admin)/facebook-ads-v2/cai-dat/page",
            "app/(admin)/facebook-ads-v2/create/page",
            "app/(admin)/facebook-ads-v2/drafts/page",
            "app/(admin)/facebook-ads-v2/email-tam-thoi/page",
            "app/(admin)/facebook-ads-v2/fanpage/page",
            "app/(admin)/facebook-ads-v2/manager/page",
            "app/(admin)/facebook-ads-v2/reports/page",
            "app/(admin)/facebook-ads-v2/rules/page",
            "app/(admin)/facebook-ads-v2/tai-khoan-bm/page",
            "app/(admin)/facebook-ads-v2/tai-khoan-qc/page",
            "app/(admin)/facebook-ads-v2/tools/[slug]/page",
            "app/(admin)/facebook-ads-v2/tools/page",
            "app/(extension-preview)/extension-preview/facebook-ads/page",
            "app/api/gads/[...path]/route"
          ],
          patterns: [
            "/api/gads",
            "/api/gads/*",
            "/extension-preview/facebook-ads",
            "/extension-preview/facebook-ads/*",
            "/facebook-ads",
            "/facebook-ads/*",
            "/facebook-ads-v2",
            "/facebook-ads-v2/*"
          ]
        },
        commerce: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/ban-hang/page",
            "app/(admin)/khach-hang/page",
            "app/(admin)/offerkit/campaigns/[id]/page",
            "app/(admin)/offerkit/campaigns/new/page",
            "app/(admin)/offerkit/campaigns/page",
            "app/(admin)/offerkit/customers/[id]/page",
            "app/(admin)/offerkit/customers/new/page",
            "app/(admin)/offerkit/customers/page",
            "app/(admin)/offerkit/events/page",
            "app/(admin)/offerkit/insights/page",
            "app/(admin)/offerkit/loyalty/[id]/page",
            "app/(admin)/offerkit/loyalty/members/[id]/page",
            "app/(admin)/offerkit/loyalty/new/page",
            "app/(admin)/offerkit/loyalty/page",
            "app/(admin)/offerkit/orders/[id]/page",
            "app/(admin)/offerkit/orders/page",
            "app/(admin)/offerkit/page",
            "app/(admin)/offerkit/redemptions/stack/page",
            "app/(admin)/offerkit/referrals/[id]/page",
            "app/(admin)/offerkit/referrals/new/page",
            "app/(admin)/offerkit/referrals/page",
            "app/(admin)/offerkit/rewards/[id]/page",
            "app/(admin)/offerkit/rewards/new/page",
            "app/(admin)/offerkit/rewards/page",
            "app/(admin)/offerkit/rules/[id]/page",
            "app/(admin)/offerkit/rules/new/page",
            "app/(admin)/offerkit/rules/page",
            "app/(admin)/offerkit/segments/[id]/page",
            "app/(admin)/offerkit/segments/new/page",
            "app/(admin)/offerkit/segments/page",
            "app/(admin)/offerkit/settings/api-keys/page",
            "app/(admin)/offerkit/settings/audit-log/page",
            "app/(admin)/offerkit/settings/page",
            "app/(admin)/offerkit/vouchers/[code]/page",
            "app/(admin)/offerkit/vouchers/new/page",
            "app/(admin)/offerkit/vouchers/page",
            "app/(admin)/offerkit/webhooks/[id]/page",
            "app/(admin)/offerkit/webhooks/page",
            "app/(full-width-pages)/sales-kit/page"
          ],
          patterns: [
            "/ban-hang",
            "/ban-hang/*",
            "/khach-hang",
            "/khach-hang/*",
            "/offerkit",
            "/offerkit/*",
            "/sales-kit",
            "/sales-kit/*"
          ]
        },
        care: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/cskh/cai-dat/page",
            "app/(admin)/cskh/general/page",
            "app/(admin)/cskh/hoi-thoai/page",
            "app/(admin)/cskh/page",
            "app/(admin)/cskh/statistics/page",
            "app/(admin)/cskh/thong-ke/page"
          ],
          patterns: [
            "/cskh",
            "/cskh/*"
          ]
        },
        office: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/office/page"
          ],
          patterns: [
            "/office",
            "/office/*"
          ]
        },
        cloudphone: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/automation/page",
            "app/(admin)/cloudphone/account-manager/page",
            "app/(admin)/cloudphone/cua-hang-cho-thue/page",
            "app/(admin)/cloudphone/custom-actions/page",
            "app/(admin)/cloudphone/dieu-khien-dong-bo/page",
            "app/(admin)/cloudphone/file-manager/page",
            "app/(admin)/cloudphone/quan-ly-thiet-bi/page",
            "app/(admin)/cloudphone/social-accounts/page",
            "app/(admin)/cloudphone/workflow-builder/[id]/page",
            "app/(admin)/cloudphone/workflow-builder/page",
            "app/(admin)/cloudphone/workflow-manager/page",
            "app/(admin)/cloudphone/workflow-store/page"
          ],
          patterns: [
            "/automation",
            "/automation/*",
            "/cloudphone",
            "/cloudphone/*"
          ]
        },
        misc: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/(others-pages)/profile/page",
            "app/(admin)/authority/page",
            "app/(admin)/bao-cao/page",
            "app/(admin)/content/page",
            "app/(admin)/keywords/page",
            "app/(admin)/kho-ung-dung/page",
            "app/(admin)/local/page",
            "app/(admin)/settings/page",
            "app/(admin)/site-metrics/page"
          ],
          patterns: [
            "/authority",
            "/authority/*",
            "/bao-cao",
            "/bao-cao/*",
            "/content",
            "/content/*",
            "/keywords",
            "/keywords/*",
            "/kho-ung-dung",
            "/kho-ung-dung/*",
            "/local",
            "/local/*",
            "/profile",
            "/profile/*",
            "/settings",
            "/settings/*",
            "/site-metrics",
            "/site-metrics/*"
          ]
        },
        core: {
          ...baseConfig.default,
          routes: [
            "app/(admin)/page",
            "app/(full-width-pages)/(auth)/signin/page",
            "app/(full-width-pages)/(auth)/signup/page",
            "app/(full-width-pages)/(error-pages)/error-404/page",
            "app/_global-error/page",
            "app/_not-found/page",
            "app/api/auth/refresh/route",
            "app/favicon.ico/route"
          ],
          patterns: [
            "/",
            "//*",
            "/_global-error",
            "/_global-error/*",
            "/_not-found",
            "/_not-found/*",
            "/api/auth/refresh",
            "/api/auth/refresh/*",
            "/error-404",
            "/error-404/*",
            "/favicon.ico",
            "/favicon.ico/*",
            "/signin",
            "/signin/*",
            "/signup",
            "/signup/*"
          ]
        }
      }
    };
  }
});

// ../.open-next/cloudflare/images.js
var define_IMAGES_DEVICE_SIZES_default = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
var define_IMAGES_FORMATS_default = ["image/webp"];
var define_IMAGES_IMAGE_SIZES_default = [32, 48, 64, 96, 128, 256, 384];
var define_IMAGES_LOCAL_PATTERNS_default = [{ pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$", search: "" }];
var define_IMAGES_QUALITIES_default = [75];
var define_IMAGES_REMOTE_PATTERNS_default = [{ protocol: "https", hostname: "^(?:^(?:graph\\.facebook\\.com)$)$", pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$" }, { protocol: "https", hostname: "^(?:^(?:ladipage\\-assets\\.gofiber\\-phuongnguyen\\.workers\\.dev)$)$", pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$" }];
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
__name(isOpenNextError, "isOpenNextError");
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
__name(debug, "debug");
function warn(...args) {
  console.warn(...args);
}
__name(warn, "warn");
var DOWNPLAYED_ERROR_LOGS = [
  {
    clientName: "S3Client",
    commandName: "GetObjectCommand",
    errorName: "NoSuchKey"
  }
];
var isDownplayedErrorLog = /* @__PURE__ */ __name((errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code)), "isDownplayedErrorLog");
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error22 = args.find((arg) => isOpenNextError(arg));
    if (error22.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error22.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error22.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
__name(error, "error");
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
__name(getOpenNextErrorLogLevel, "getOpenNextErrorLogLevel");
async function handleImageRequest(requestURL, requestHeaders, env) {
  const parseResult = parseImageRequest(requestURL, requestHeaders);
  if (!parseResult.ok) {
    return new Response(parseResult.message, {
      status: 400
    });
  }
  let imageResponse;
  if (parseResult.url.startsWith("/")) {
    if (env.ASSETS === void 0) {
      error("env.ASSETS binding is not defined");
      return new Response('"url" parameter is valid but upstream response is invalid', {
        status: 404
      });
    }
    const absoluteURL = new URL(parseResult.url, requestURL);
    imageResponse = await env.ASSETS.fetch(absoluteURL);
  } else {
    let fetchImageResult;
    try {
      fetchImageResult = await fetchWithRedirects(parseResult.url, 7e3, 3);
    } catch (e) {
      throw new Error("Failed to fetch image", { cause: e });
    }
    if (!fetchImageResult.ok) {
      if (fetchImageResult.error === "timed_out") {
        return new Response('"url" parameter is valid but upstream response timed out', {
          status: 504
        });
      }
      if (fetchImageResult.error === "too_many_redirects") {
        return new Response('"url" parameter is valid but upstream response is invalid', {
          status: 508
        });
      }
      throw new Error("Failed to fetch image");
    }
    imageResponse = fetchImageResult.response;
  }
  if (!imageResponse.ok || imageResponse.body === null) {
    return new Response('"url" parameter is valid but upstream response is invalid', {
      status: imageResponse.status
    });
  }
  let immutable = false;
  if (parseResult.static) {
    immutable = true;
  } else {
    const cacheControlHeader = imageResponse.headers.get("Cache-Control");
    if (cacheControlHeader !== null) {
      immutable = cacheControlHeader.includes("immutable");
    }
  }
  const readHeaderResult = await readImageHeader(imageResponse);
  if (readHeaderResult instanceof Response) {
    return readHeaderResult;
  }
  const { contentType, imageStream } = readHeaderResult;
  if (contentType === null) {
    warn(`Failed to detect content type of "${parseResult.url}"`);
    return new Response('"url" parameter is valid but image type is not allowed', {
      status: 400
    });
  }
  if (contentType === SVG) {
    if (true) {
      return new Response('"url" parameter is valid but image type is not allowed', {
        status: 400
      });
    }
    const response2 = createImageResponse(imageStream, contentType, {
      immutable
    });
    return response2;
  }
  if (contentType === GIF) {
    if (env.IMAGES === void 0) {
      warn("env.IMAGES binding is not defined");
      const response3 = createImageResponse(imageStream, contentType, {
        immutable
      });
      return response3;
    }
    const imageSource = env.IMAGES.input(imageStream);
    const imageTransformationResult = await imageSource.transform({
      width: parseResult.width,
      fit: "scale-down"
    }).output({
      quality: parseResult.quality,
      format: GIF
    });
    const outputImageStream = imageTransformationResult.image();
    const response2 = createImageResponse(outputImageStream, GIF, {
      immutable
    });
    return response2;
  }
  if (contentType === AVIF || contentType === WEBP || contentType === JPEG || contentType === PNG) {
    if (env.IMAGES === void 0) {
      warn("env.IMAGES binding is not defined");
      const response3 = createImageResponse(imageStream, contentType, {
        immutable
      });
      return response3;
    }
    const outputFormat = parseResult.format ?? contentType;
    const imageSource = env.IMAGES.input(imageStream);
    const imageTransformationResult = await imageSource.transform({
      width: parseResult.width,
      fit: "scale-down"
    }).output({
      quality: parseResult.quality,
      format: outputFormat
    });
    const outputImageStream = imageTransformationResult.image();
    const response2 = createImageResponse(outputImageStream, outputFormat, {
      immutable
    });
    return response2;
  }
  warn(`Image content type ${contentType} not supported`);
  const response = createImageResponse(imageStream, contentType, {
    immutable
  });
  return response;
}
__name(handleImageRequest, "handleImageRequest");
async function handleCdnCgiImageRequest(requestURL, env) {
  const parseResult = parseCdnCgiImageRequest(requestURL.pathname);
  if (!parseResult.ok) {
    return new Response(parseResult.message, {
      status: 400
    });
  }
  let imageResponse;
  if (parseResult.url.startsWith("/")) {
    if (env.ASSETS === void 0) {
      return new Response("env.ASSETS binding is not defined", {
        status: 404
      });
    }
    const absoluteURL = new URL(parseResult.url, requestURL);
    imageResponse = await env.ASSETS.fetch(absoluteURL);
  } else {
    imageResponse = await fetch(parseResult.url);
  }
  if (!imageResponse.ok || imageResponse.body === null) {
    return new Response('"url" parameter is valid but upstream response is invalid', {
      status: imageResponse.status
    });
  }
  const readHeaderResult = await readImageHeader(imageResponse);
  if (readHeaderResult instanceof Response) {
    return readHeaderResult;
  }
  const { contentType, imageStream } = readHeaderResult;
  if (contentType === null || !SUPPORTED_CDN_CGI_INPUT_TYPES.has(contentType)) {
    return new Response('"url" parameter is valid but image type is not allowed', {
      status: 400
    });
  }
  if (contentType === SVG && true) {
    return new Response('"url" parameter is valid but image type is not allowed', {
      status: 400
    });
  }
  return new Response(imageStream, {
    headers: { "Content-Type": contentType }
  });
}
__name(handleCdnCgiImageRequest, "handleCdnCgiImageRequest");
function parseCdnCgiImageRequest(pathname) {
  const match2 = pathname.match(/^\/cdn-cgi\/image\/(?<options>[^/]+)\/(?<url>.+)$/);
  if (match2 === null || // Valid URLs have at least one option
  !match2.groups?.options || !match2.groups?.url) {
    return { ok: false, message: "Invalid /cdn-cgi/image/ URL format" };
  }
  const imageUrl = match2.groups.url;
  if (imageUrl.startsWith("/")) {
    return { ok: false, message: '"url" parameter cannot be a protocol-relative URL (//)' };
  }
  let resolvedUrl;
  if (imageUrl.match(/^https?:\/\//)) {
    resolvedUrl = imageUrl;
  } else {
    resolvedUrl = `/${imageUrl}`;
  }
  return {
    ok: true,
    url: resolvedUrl,
    static: false
  };
}
__name(parseCdnCgiImageRequest, "parseCdnCgiImageRequest");
async function readImageHeader(imageResponse) {
  const [contentTypeStream, imageStream] = imageResponse.body.tee();
  const headerBytes = new Uint8Array(32);
  const reader = contentTypeStream.getReader({ mode: "byob" });
  const readResult = await reader.readAtLeast(32, headerBytes);
  if (readResult.value === void 0) {
    await imageResponse.body.cancel();
    return new Response('"url" parameter is valid but upstream response is invalid', {
      status: 400
    });
  }
  const contentType = detectImageContentType(readResult.value);
  return { contentType, imageStream };
}
__name(readImageHeader, "readImageHeader");
async function fetchWithRedirects(url, timeoutMS, maxRedirectCount) {
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMS),
      redirect: "manual"
    });
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") {
      const result2 = {
        ok: false,
        error: "timed_out"
      };
      return result2;
    }
    throw e;
  }
  if (redirectResponseStatuses.includes(response.status)) {
    const locationHeader = response.headers.get("Location");
    if (locationHeader !== null) {
      if (maxRedirectCount < 1) {
        const result3 = {
          ok: false,
          error: "too_many_redirects"
        };
        return result3;
      }
      let redirectTarget;
      if (locationHeader.startsWith("/")) {
        redirectTarget = new URL(locationHeader, url).href;
      } else {
        redirectTarget = locationHeader;
      }
      const result2 = await fetchWithRedirects(redirectTarget, timeoutMS, maxRedirectCount - 1);
      return result2;
    }
  }
  const result = {
    ok: true,
    response
  };
  return result;
}
__name(fetchWithRedirects, "fetchWithRedirects");
var redirectResponseStatuses = [301, 302, 303, 307, 308];
function createImageResponse(image, contentType, imageResponseFlags) {
  const response = new Response(image, {
    headers: {
      Vary: "Accept",
      "Content-Type": contentType,
      "Content-Disposition": "attachment",
      "Content-Security-Policy": "script-src 'none'; frame-src 'none'; sandbox;"
    }
  });
  if (imageResponseFlags.immutable) {
    response.headers.set("Cache-Control", "public, max-age=315360000, immutable");
  }
  return response;
}
__name(createImageResponse, "createImageResponse");
function parseImageRequest(requestURL, requestHeaders) {
  const formats = define_IMAGES_FORMATS_default;
  const parsedUrlOrError = validateUrlQueryParameter(requestURL);
  if (!("url" in parsedUrlOrError)) {
    return parsedUrlOrError;
  }
  const widthOrError = validateWidthQueryParameter(requestURL);
  if (typeof widthOrError !== "number") {
    return widthOrError;
  }
  const qualityOrError = validateQualityQueryParameter(requestURL);
  if (typeof qualityOrError !== "number") {
    return qualityOrError;
  }
  const acceptHeader = requestHeaders.get("Accept") ?? "";
  let format = null;
  for (const allowedFormat of formats) {
    if (acceptHeader.includes(allowedFormat)) {
      format = allowedFormat;
      break;
    }
  }
  const result = {
    ok: true,
    url: parsedUrlOrError.url,
    width: widthOrError,
    quality: qualityOrError,
    format,
    static: parsedUrlOrError.static
  };
  return result;
}
__name(parseImageRequest, "parseImageRequest");
function validateUrlQueryParameter(requestURL) {
  const urls = requestURL.searchParams.getAll("url");
  if (urls.length < 1) {
    const result = {
      ok: false,
      message: '"url" parameter is required'
    };
    return result;
  }
  if (urls.length > 1) {
    const result = {
      ok: false,
      message: '"url" parameter cannot be an array'
    };
    return result;
  }
  const url = urls[0];
  if (url.length > 3072) {
    const result = {
      ok: false,
      message: '"url" parameter is too long'
    };
    return result;
  }
  if (url.startsWith("//")) {
    const result = {
      ok: false,
      message: '"url" parameter cannot be a protocol-relative URL (//)'
    };
    return result;
  }
  if (url.startsWith("/")) {
    const staticAsset = url.startsWith(`${__NEXT_BASE_PATH__ || ""}/_next/static/media`);
    const pathname = getPathnameFromRelativeURL(url);
    if (/\/_next\/image($|\/)/.test(decodeURIComponent(pathname))) {
      const result = {
        ok: false,
        message: '"url" parameter cannot be recursive'
      };
      return result;
    }
    if (!staticAsset) {
      if (!hasLocalMatch(define_IMAGES_LOCAL_PATTERNS_default, url)) {
        const result = { ok: false, message: '"url" parameter is not allowed' };
        return result;
      }
    }
    return { url, static: staticAsset };
  }
  let parsedURL;
  try {
    parsedURL = new URL(url);
  } catch {
    const result = { ok: false, message: '"url" parameter is invalid' };
    return result;
  }
  const validProtocols = ["http:", "https:"];
  if (!validProtocols.includes(parsedURL.protocol)) {
    const result = {
      ok: false,
      message: '"url" parameter is invalid'
    };
    return result;
  }
  if (!hasRemoteMatch(define_IMAGES_REMOTE_PATTERNS_default, parsedURL)) {
    const result = {
      ok: false,
      message: '"url" parameter is not allowed'
    };
    return result;
  }
  return { url: parsedURL.href, static: false };
}
__name(validateUrlQueryParameter, "validateUrlQueryParameter");
function validateWidthQueryParameter(requestURL) {
  const widthQueryValues = requestURL.searchParams.getAll("w");
  if (widthQueryValues.length < 1) {
    const result = {
      ok: false,
      message: '"w" parameter (width) is required'
    };
    return result;
  }
  if (widthQueryValues.length > 1) {
    const result = {
      ok: false,
      message: '"w" parameter (width) cannot be an array'
    };
    return result;
  }
  const widthQueryValue = widthQueryValues[0];
  if (!/^[0-9]+$/.test(widthQueryValue)) {
    const result = {
      ok: false,
      message: '"w" parameter (width) must be an integer greater than 0'
    };
    return result;
  }
  const width = parseInt(widthQueryValue, 10);
  if (width <= 0 || isNaN(width)) {
    const result = {
      ok: false,
      message: '"w" parameter (width) must be an integer greater than 0'
    };
    return result;
  }
  const sizeValid = define_IMAGES_DEVICE_SIZES_default.includes(width) || define_IMAGES_IMAGE_SIZES_default.includes(width);
  if (!sizeValid) {
    const result = {
      ok: false,
      message: `"w" parameter (width) of ${width} is not allowed`
    };
    return result;
  }
  return width;
}
__name(validateWidthQueryParameter, "validateWidthQueryParameter");
function validateQualityQueryParameter(requestURL) {
  const qualityQueryValues = requestURL.searchParams.getAll("q");
  if (qualityQueryValues.length < 1) {
    const result = {
      ok: false,
      message: '"q" parameter (quality) is required'
    };
    return result;
  }
  if (qualityQueryValues.length > 1) {
    const result = {
      ok: false,
      message: '"q" parameter (quality) cannot be an array'
    };
    return result;
  }
  const qualityQueryValue = qualityQueryValues[0];
  if (!/^[0-9]+$/.test(qualityQueryValue)) {
    const result = {
      ok: false,
      message: '"q" parameter (quality) must be an integer between 1 and 100'
    };
    return result;
  }
  const quality = parseInt(qualityQueryValue, 10);
  if (isNaN(quality) || quality < 1 || quality > 100) {
    const result = {
      ok: false,
      message: '"q" parameter (quality) must be an integer between 1 and 100'
    };
    return result;
  }
  if (!define_IMAGES_QUALITIES_default.includes(quality)) {
    const result = {
      ok: false,
      message: `"q" parameter (quality) of ${quality} is not allowed`
    };
    return result;
  }
  return quality;
}
__name(validateQualityQueryParameter, "validateQualityQueryParameter");
function getPathnameFromRelativeURL(relativeURL) {
  return relativeURL.split("?")[0];
}
__name(getPathnameFromRelativeURL, "getPathnameFromRelativeURL");
function hasLocalMatch(localPatterns, relativeURL) {
  const parseRelativeURLResult = parseRelativeURL(relativeURL);
  for (const localPattern of localPatterns) {
    const matched = matchLocalPattern(localPattern, parseRelativeURLResult);
    if (matched) {
      return true;
    }
  }
  return false;
}
__name(hasLocalMatch, "hasLocalMatch");
function parseRelativeURL(relativeURL) {
  if (!relativeURL.includes("?")) {
    const result2 = {
      pathname: relativeURL,
      search: ""
    };
    return result2;
  }
  const parts = relativeURL.split("?");
  const pathname = parts[0];
  const search = "?" + parts.slice(1).join("?");
  const result = {
    pathname,
    search
  };
  return result;
}
__name(parseRelativeURL, "parseRelativeURL");
function matchLocalPattern(pattern, url) {
  if (pattern.search !== void 0 && pattern.search !== url.search) {
    return false;
  }
  return new RegExp(pattern.pathname).test(url.pathname);
}
__name(matchLocalPattern, "matchLocalPattern");
function hasRemoteMatch(remotePatterns, url) {
  for (const remotePattern of remotePatterns) {
    const matched = matchRemotePattern(remotePattern, url);
    if (matched) {
      return true;
    }
  }
  return false;
}
__name(hasRemoteMatch, "hasRemoteMatch");
function matchRemotePattern(pattern, url) {
  if (pattern.protocol !== void 0 && pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) {
    return false;
  }
  if (pattern.port !== void 0 && pattern.port !== url.port) {
    return false;
  }
  if (pattern.hostname === void 0 || !new RegExp(pattern.hostname).test(url.hostname)) {
    return false;
  }
  if (pattern.search !== void 0 && pattern.search !== url.search) {
    return false;
  }
  return new RegExp(pattern.pathname).test(url.pathname);
}
__name(matchRemotePattern, "matchRemotePattern");
var AVIF = "image/avif";
var WEBP = "image/webp";
var PNG = "image/png";
var JPEG = "image/jpeg";
var JXL = "image/jxl";
var JP2 = "image/jp2";
var HEIC = "image/heic";
var GIF = "image/gif";
var SVG = "image/svg+xml";
var ICO = "image/x-icon";
var ICNS = "image/x-icns";
var TIFF = "image/tiff";
var BMP = "image/bmp";
var SUPPORTED_CDN_CGI_INPUT_TYPES = /* @__PURE__ */ new Set([JPEG, PNG, GIF, WEBP, SVG, HEIC]);
function detectImageContentType(buffer) {
  if ([255, 216, 255].every((b, i) => buffer[i] === b)) {
    return JPEG;
  }
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => buffer[i] === b)) {
    return PNG;
  }
  if ([71, 73, 70, 56].every((b, i) => buffer[i] === b)) {
    return GIF;
  }
  if ([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80].every((b, i) => !b || buffer[i] === b)) {
    return WEBP;
  }
  if ([60, 63, 120, 109, 108].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([60, 115, 118, 103].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([0, 0, 0, 0, 102, 116, 121, 112, 97, 118, 105, 102].every((b, i) => !b || buffer[i] === b)) {
    return AVIF;
  }
  if ([0, 0, 1, 0].every((b, i) => buffer[i] === b)) {
    return ICO;
  }
  if ([105, 99, 110, 115].every((b, i) => buffer[i] === b)) {
    return ICNS;
  }
  if ([73, 73, 42, 0].every((b, i) => buffer[i] === b)) {
    return TIFF;
  }
  if ([66, 77].every((b, i) => buffer[i] === b)) {
    return BMP;
  }
  if ([255, 10].every((b, i) => buffer[i] === b)) {
    return JXL;
  }
  if ([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10].every((b, i) => buffer[i] === b)) {
    return JXL;
  }
  if ([0, 0, 0, 0, 102, 116, 121, 112, 104, 101, 105, 99].every((b, i) => !b || buffer[i] === b)) {
    return HEIC;
  }
  if ([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10].every((b, i) => buffer[i] === b)) {
    return JP2;
  }
  return null;
}
__name(detectImageContentType, "detectImageContentType");

// ../.open-next/cloudflare/init.js
import { AsyncLocalStorage } from "node:async_hooks";
import process2 from "node:process";
import stream from "node:stream";

// ../.open-next/cloudflare/next-env.mjs
var next_env_exports = {};
__export(next_env_exports, {
  development: () => development,
  production: () => production,
  test: () => test
});
var production = { "NODE_ENV": "production", "NEXT_PUBLIC_API_URL": "https://ladipage-backend-23sqjd-d087f6-158-220-105-203.sslip.io/api", "NEXT_PUBLIC_SUPABASE_URL": "https://lrweyftvjumnvkiyplyg.supabase.co", "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjM0NjYsImV4cCI6MjA5NzAzOTQ2Nn0.olM5P-igLaEi6M4GPO1WEzDVsB-kPSKUd6cAK2Z_YIU", "SUPABASE_SECRET_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2MzQ2NiwiZXhwIjoyMDk3MDM5NDY2fQ.M10p-4avKbwldlqOtAxo8scYegpWs4d2DYnGHxzF0V0", "NEXT_PUBLIC_AUTH_MODE": "legacy", "NEXT_PUBLIC_SESSION_COOKIE_NAME": "ladipage-session", "NEXT_PUBLIC_FB_SESSION_COOKIE_NAME": "ladipage-fb-session", "NEXT_PUBLIC_SB_REFRESH_COOKIE_NAME": "ladipage-sb-refresh", "NEXT_PUBLIC_AUTH_MOCK": "true", "NEXT_PUBLIC_FB_GRAPH_VERSION": "v21.0", "NEXT_PUBLIC_LANDING_EDITOR": "instatic", "NEXT_PUBLIC_LANDING_PUBLISH_SOURCE": "instatic-artifact", "LANDING_PUBLISH_SOURCE": "instatic-artifact", "NEXT_PUBLIC_APP_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "NEXT_PUBLIC_INSTATIC_EDITOR_ORIGIN": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_CMS": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_VITE": "http://127.0.0.1:5174", "NEXT_PUBLIC_AI_SEO_USE_NEST": "true", "NEXT_PUBLIC_AI_SEO_CHAT_USE_BFF": "true", "LANDING_ORIGIN_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "LANDING_FREE_SUBDOMAIN_ENABLED": "false", "NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED": "false", "FREE_SITE_DOMAIN": "", "NEXT_PUBLIC_FREE_SITE_DOMAIN": "", "LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "CLOUDFLARE_SAAS_FALLBACK_ORIGIN": "ladipage.publicvm.com", "NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "NEXT_PUBLIC_COMMERCE_USE_API": "true", "NEXT_PUBLIC_API_MOCKING": "false", "NEXT_PUBLIC_ADS_PLATFORM_MODE": "live", "NEXT_PUBLIC_CDN_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev", "LANDING_ASSET_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev", "VERCEL_OIDC_TOKEN": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9waHVvbmdzLXByb2plY3RzLTAzN2Y1YzAwIiwic3ViIjoib3duZXI6cGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMDpwcm9qZWN0OmxhZGlwYWdlLWZlLXYyOmVudmlyb25tZW50OmRldmVsb3BtZW50Iiwic2NvcGUiOiJvd25lcjpwaHVvbmdzLXByb2plY3RzLTAzN2Y1YzAwOnByb2plY3Q6bGFkaXBhZ2UtZmUtdjI6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJhdWQiOiJodHRwczovL3ZlcmNlbC5jb20vcGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMCIsIm93bmVyIjoicGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMCIsIm93bmVyX2lkIjoidGVhbV9mOFB3ZkkxemZQdldxVTZGRmY3R0wySlUiLCJwcm9qZWN0IjoibGFkaXBhZ2UtZmUtdjIiLCJwcm9qZWN0X2lkIjoicHJqX2RoNjNyNEt2QThqWnNKdmpEY0d0N2w0NFhMaWciLCJlbnZpcm9ubWVudCI6ImRldmVsb3BtZW50IiwicGxhbiI6ImhvYmJ5IiwidXNlcl9pZCI6IjlOS3doenRYWlVCSHRLdXhFRnl4UnZIYiIsImNsaWVudF9pZCI6ImNsX0hZeU9QQk50Rk1mSGhhVW45TDRRUGZUWno2VFA0N2JwIiwiYXBwX2lkIjoiY2xfSFl5T1BCTnRGTWZIaGFVbjlMNFFQZlRaejZUUDQ3YnAiLCJuYmYiOjE3ODgzNTQwMDMsImlhdCI6MTc4ODM1NDAwMywiZXhwIjoxNzg4Mzk3MjAzfQ.a7La47jcwYK7vA--644AJJP3A4XTMdnfw8k2t3-K-7kTbC667z-lSj7Mtw6L4VOKo7u7unKm4BziZ_q9qOKo_QwpmG2pfNvcyc7lncNd4bQaH67a0CIsMuqAseL8jdyyQ-1S-_UJE2x-elCTWAZRtcIVFEgYKnl8KGpH_G9jalDm90OvU-Ygq8zmBGZhgLJv6aZ-Xjo8cNIzVJPEivEK8Sn-7q4fR04Wp94mJ9ldBHHh9MoPxGdjTwX01pZEtdtij9keBT0Mc_z8pZmMMuBdmDLt6Q3jd_21Ly3WlplYpIR21muT-Pr-mOhm8OMaunm1yMQ8ycgui1I-M1_01RXXEA" };
var development = { "NODE_ENV": "production", "NEXT_PUBLIC_API_URL": "https://ladipage-backend-23sqjd-d087f6-158-220-105-203.sslip.io/api", "NEXT_PUBLIC_SUPABASE_URL": "https://lrweyftvjumnvkiyplyg.supabase.co", "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjM0NjYsImV4cCI6MjA5NzAzOTQ2Nn0.olM5P-igLaEi6M4GPO1WEzDVsB-kPSKUd6cAK2Z_YIU", "SUPABASE_SECRET_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2MzQ2NiwiZXhwIjoyMDk3MDM5NDY2fQ.M10p-4avKbwldlqOtAxo8scYegpWs4d2DYnGHxzF0V0", "NEXT_PUBLIC_AUTH_MODE": "legacy", "NEXT_PUBLIC_SESSION_COOKIE_NAME": "ladipage-session", "NEXT_PUBLIC_FB_SESSION_COOKIE_NAME": "ladipage-fb-session", "NEXT_PUBLIC_SB_REFRESH_COOKIE_NAME": "ladipage-sb-refresh", "NEXT_PUBLIC_AUTH_MOCK": "true", "NEXT_PUBLIC_FB_GRAPH_VERSION": "v21.0", "NEXT_PUBLIC_LANDING_EDITOR": "instatic", "NEXT_PUBLIC_LANDING_PUBLISH_SOURCE": "instatic-artifact", "LANDING_PUBLISH_SOURCE": "instatic-artifact", "NEXT_PUBLIC_APP_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "NEXT_PUBLIC_INSTATIC_EDITOR_ORIGIN": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_CMS": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_VITE": "http://127.0.0.1:5174", "NEXT_PUBLIC_AI_SEO_USE_NEST": "true", "NEXT_PUBLIC_AI_SEO_CHAT_USE_BFF": "true", "LANDING_ORIGIN_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "LANDING_FREE_SUBDOMAIN_ENABLED": "false", "NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED": "false", "FREE_SITE_DOMAIN": "", "NEXT_PUBLIC_FREE_SITE_DOMAIN": "", "LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "CLOUDFLARE_SAAS_FALLBACK_ORIGIN": "ladipage.publicvm.com", "NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "NEXT_PUBLIC_COMMERCE_USE_API": "true", "NEXT_PUBLIC_API_MOCKING": "false", "NEXT_PUBLIC_ADS_PLATFORM_MODE": "live", "NEXT_PUBLIC_CDN_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev", "LANDING_ASSET_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev", "VERCEL_OIDC_TOKEN": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9waHVvbmdzLXByb2plY3RzLTAzN2Y1YzAwIiwic3ViIjoib3duZXI6cGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMDpwcm9qZWN0OmxhZGlwYWdlLWZlLXYyOmVudmlyb25tZW50OmRldmVsb3BtZW50Iiwic2NvcGUiOiJvd25lcjpwaHVvbmdzLXByb2plY3RzLTAzN2Y1YzAwOnByb2plY3Q6bGFkaXBhZ2UtZmUtdjI6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJhdWQiOiJodHRwczovL3ZlcmNlbC5jb20vcGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMCIsIm93bmVyIjoicGh1b25ncy1wcm9qZWN0cy0wMzdmNWMwMCIsIm93bmVyX2lkIjoidGVhbV9mOFB3ZkkxemZQdldxVTZGRmY3R0wySlUiLCJwcm9qZWN0IjoibGFkaXBhZ2UtZmUtdjIiLCJwcm9qZWN0X2lkIjoicHJqX2RoNjNyNEt2QThqWnNKdmpEY0d0N2w0NFhMaWciLCJlbnZpcm9ubWVudCI6ImRldmVsb3BtZW50IiwicGxhbiI6ImhvYmJ5IiwidXNlcl9pZCI6IjlOS3doenRYWlVCSHRLdXhFRnl4UnZIYiIsImNsaWVudF9pZCI6ImNsX0hZeU9QQk50Rk1mSGhhVW45TDRRUGZUWno2VFA0N2JwIiwiYXBwX2lkIjoiY2xfSFl5T1BCTnRGTWZIaGFVbjlMNFFQZlRaejZUUDQ3YnAiLCJuYmYiOjE3ODgzNTQwMDMsImlhdCI6MTc4ODM1NDAwMywiZXhwIjoxNzg4Mzk3MjAzfQ.a7La47jcwYK7vA--644AJJP3A4XTMdnfw8k2t3-K-7kTbC667z-lSj7Mtw6L4VOKo7u7unKm4BziZ_q9qOKo_QwpmG2pfNvcyc7lncNd4bQaH67a0CIsMuqAseL8jdyyQ-1S-_UJE2x-elCTWAZRtcIVFEgYKnl8KGpH_G9jalDm90OvU-Ygq8zmBGZhgLJv6aZ-Xjo8cNIzVJPEivEK8Sn-7q4fR04Wp94mJ9ldBHHh9MoPxGdjTwX01pZEtdtij9keBT0Mc_z8pZmMMuBdmDLt6Q3jd_21Ly3WlplYpIR21muT-Pr-mOhm8OMaunm1yMQ8ycgui1I-M1_01RXXEA" };
var test = { "NODE_ENV": "production", "NEXT_PUBLIC_API_URL": "https://ladipage-backend-23sqjd-d087f6-158-220-105-203.sslip.io/api", "NEXT_PUBLIC_SUPABASE_URL": "https://lrweyftvjumnvkiyplyg.supabase.co", "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjM0NjYsImV4cCI6MjA5NzAzOTQ2Nn0.olM5P-igLaEi6M4GPO1WEzDVsB-kPSKUd6cAK2Z_YIU", "SUPABASE_SECRET_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2V5ZnR2anVtbnZraXlwbHlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2MzQ2NiwiZXhwIjoyMDk3MDM5NDY2fQ.M10p-4avKbwldlqOtAxo8scYegpWs4d2DYnGHxzF0V0", "NEXT_PUBLIC_AUTH_MODE": "legacy", "NEXT_PUBLIC_SESSION_COOKIE_NAME": "ladipage-session", "NEXT_PUBLIC_FB_SESSION_COOKIE_NAME": "ladipage-fb-session", "NEXT_PUBLIC_SB_REFRESH_COOKIE_NAME": "ladipage-sb-refresh", "NEXT_PUBLIC_AUTH_MOCK": "true", "NEXT_PUBLIC_FB_GRAPH_VERSION": "v21.0", "NEXT_PUBLIC_LANDING_EDITOR": "instatic", "NEXT_PUBLIC_LANDING_PUBLISH_SOURCE": "instatic-artifact", "LANDING_PUBLISH_SOURCE": "instatic-artifact", "NEXT_PUBLIC_APP_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "NEXT_PUBLIC_INSTATIC_EDITOR_ORIGIN": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_CMS": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io", "INSTATIC_REWRITE_TARGET_VITE": "http://127.0.0.1:5174", "NEXT_PUBLIC_AI_SEO_USE_NEST": "true", "NEXT_PUBLIC_AI_SEO_CHAT_USE_BFF": "true", "LANDING_ORIGIN_URL": "https://ladipage.gofiber-phuongnguyen.workers.dev", "LANDING_FREE_SUBDOMAIN_ENABLED": "false", "NEXT_PUBLIC_LANDING_FREE_SUBDOMAIN_ENABLED": "false", "FREE_SITE_DOMAIN": "", "NEXT_PUBLIC_FREE_SITE_DOMAIN": "", "LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "CLOUDFLARE_SAAS_FALLBACK_ORIGIN": "ladipage.publicvm.com", "NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED": "true", "LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_LANDING_DOMAIN_BYPASS_QUOTA": "false", "NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET": "ladipage.publicvm.com", "NEXT_PUBLIC_COMMERCE_USE_API": "true", "NEXT_PUBLIC_API_MOCKING": "false", "NEXT_PUBLIC_ADS_PLATFORM_MODE": "live", "NEXT_PUBLIC_CDN_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev", "LANDING_ASSET_BASE_URL": "https://ladipage-assets.gofiber-phuongnguyen.workers.dev" };

// ../.open-next/cloudflare/init.js
var cloudflareContextALS = new AsyncLocalStorage();
Object.defineProperty(globalThis, /* @__PURE__ */ Symbol.for("__cloudflare-context__"), {
  get() {
    return cloudflareContextALS.getStore();
  }
});
async function runWithCloudflareRequestContext(request, env, ctx, handler3) {
  init(request, env);
  return cloudflareContextALS.run({ env, ctx, cf: request.cf }, handler3);
}
__name(runWithCloudflareRequestContext, "runWithCloudflareRequestContext");
var initialized = false;
function init(request, env) {
  if (initialized) {
    return;
  }
  initialized = true;
  const url = new URL(request.url);
  initRuntime();
  populateProcessEnv(url, env);
}
__name(init, "init");
function initRuntime() {
  globalThis.__dirname ??= "";
  globalThis.__filename ??= "";
  import.meta.url ??= "file:///worker.js";
  const __original_fetch = globalThis.fetch;
  globalThis.fetch = (input, init2) => {
    if (init2) {
      delete init2.cache;
    }
    return __original_fetch(input, init2);
  };
  const CustomRequest = class extends globalThis.Request {
    static {
      __name(this, "CustomRequest");
    }
    constructor(input, init2) {
      if (init2) {
        delete init2.cache;
        Object.defineProperty(init2, "body", {
          // @ts-ignore
          value: init2.body instanceof stream.Readable ? ReadableStream.from(init2.body) : init2.body
        });
      }
      super(input, init2);
    }
  };
  Object.assign(globalThis, {
    Request: CustomRequest,
    __BUILD_TIMESTAMP_MS__: 1788363956631,
    __NEXT_BASE_PATH__: "",
    __ASSETS_RUN_WORKER_FIRST__: false,
    __TRAILING_SLASH__: false,
    // The external middleware will use the convertTo function of the `edge` converter
    // by default it will try to fetch the request, but since we are running everything in the same worker
    // we need to use the request as is.
    __dangerous_ON_edge_converter_returns_request: true
  });
}
__name(initRuntime, "initRuntime");
function populateProcessEnv(url, env) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      process2.env[key] = value;
    }
  }
  const mode = env.NEXTJS_ENV ?? "production";
  if (next_env_exports[mode]) {
    for (const key in next_env_exports[mode]) {
      process2.env[key] ??= next_env_exports[mode][key];
    }
  }
  process2.env.OPEN_NEXT_ORIGIN = JSON.stringify({
    default: {
      host: url.hostname,
      protocol: url.protocol.slice(0, -1),
      port: url.port
    }
  });
  process2.env.__NEXT_PRIVATE_ORIGIN = url.origin;
  if ("") {
    process2.env.DEPLOYMENT_ID = "";
  }
}
__name(populateProcessEnv, "populateProcessEnv");

// ../.open-next/cloudflare/skew-protection.js
import process3 from "node:process";
function maybeGetSkewProtectionResponse(request) {
  if (false) {
    const url = new URL(request.url);
    if (url.hostname === "localhost" || url.hostname.endsWith(".workers.dev")) {
      return void 0;
    }
    const requestDeploymentId = request.headers.get("x-deployment-id") ?? url.searchParams.get("dpl");
    if (!requestDeploymentId || requestDeploymentId === process3.env.DEPLOYMENT_ID) {
      return void 0;
    }
    deploymentMapping ??= process3.env[DEPLOYMENT_MAPPING_ENV_NAME] ? JSON.parse(process3.env[DEPLOYMENT_MAPPING_ENV_NAME]) : {};
    if (!(requestDeploymentId in deploymentMapping)) {
      return void 0;
    }
    const version = deploymentMapping[requestDeploymentId];
    if (!version || version === CURRENT_VERSION_ID) {
      return void 0;
    }
    const versionDomain = version.split("-")[0];
    const hostname = `${versionDomain}-${process3.env.CF_WORKER_NAME}.${process3.env.CF_PREVIEW_DOMAIN}.workers.dev`;
    url.hostname = hostname;
    const requestToOlderDeployment = new Request(url, request);
    const headers = new Headers(request.headers);
    headers.delete("origin");
    return fetch(requestToOlderDeployment, { headers });
  }
}
__name(maybeGetSkewProtectionResponse, "maybeGetSkewProtectionResponse");

// ../.open-next/middleware/handler.mjs
import { Buffer as Buffer2 } from "node:buffer";
import { AsyncLocalStorage as AsyncLocalStorage2 } from "node:async_hooks";
import { Buffer as Buffer22 } from "node:buffer";
import { ReadableStream as ReadableStream2 } from "node:stream/web";
import crypto from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";
import path from "node:path";
import { Transform } from "node:stream";
import { ReadableStream as ReadableStream22 } from "node:stream/web";
import { createHash } from "node:crypto";
import path2 from "node:path";
globalThis.Buffer = Buffer2;
globalThis.AsyncLocalStorage = AsyncLocalStorage2;
var defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if (p === "__import_unsupported" && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};
globalThis.openNextDebug = false;
globalThis.openNextVersion = "4.1.0";
globalThis.nextVersion = "16.2.12";
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm2 = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __export2 = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
function isOpenNextError2(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
__name(isOpenNextError2, "isOpenNextError");
var init_error = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});
function debug2(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
__name(debug2, "debug");
function warn2(...args) {
  console.warn(...args);
}
__name(warn2, "warn");
function error2(...args) {
  if (args.some((arg) => isDownplayedErrorLog2(arg))) {
    return debug2(...args);
  }
  if (args.some((arg) => isOpenNextError2(arg))) {
    const error22 = args.find((arg) => isOpenNextError2(arg));
    if (error22.logLevel < getOpenNextErrorLogLevel2()) {
      return;
    }
    if (error22.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError2(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error22.logLevel === 1) {
      return warn2(...args.map((arg) => isOpenNextError2(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
__name(error2, "error");
function getOpenNextErrorLogLevel2() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
__name(getOpenNextErrorLogLevel2, "getOpenNextErrorLogLevel");
var DOWNPLAYED_ERROR_LOGS2;
var isDownplayedErrorLog2;
var init_logger = __esm2({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS2 = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog2 = /* @__PURE__ */ __name((errorLog) => DOWNPLAYED_ERROR_LOGS2.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code)), "isDownplayedErrorLog");
  }
});
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = /* @__PURE__ */ __name(function() {
      }, "C");
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    __name(parseCookie, "parseCookie");
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    __name(stringifyCookie, "stringifyCookie");
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    __name(stringifySetCookie, "stringifySetCookie");
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    __name(parseSetCookie, "parseSetCookie");
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    __name(endIndex, "endIndex");
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    __name(eqIndex, "eqIndex");
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    __name(valueSlice, "valueSlice");
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    __name(decode, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
  }
});
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
__name(parseSetCookieHeader, "parseSetCookieHeader");
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
__name(getQueryFromIterator, "getQueryFromIterator");
var init_util = __esm2({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
__name(getQueryFromSearchParams, "getQueryFromSearchParams");
var init_utils = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});
var edge_exports = {};
__export2(edge_exports, {
  default: /* @__PURE__ */ __name(() => edge_default, "default")
});
var import_cookie;
var NULL_BODY_STATUSES;
var converter;
var edge_default;
var init_edge = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: /* @__PURE__ */ __name(async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer22.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      }, "convertFrom"),
      convertTo: /* @__PURE__ */ __name(async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      }, "convertTo"),
      name: "edge"
    };
    edge_default = converter;
  }
});
var cloudflare_edge_exports = {};
__export2(cloudflare_edge_exports, {
  default: /* @__PURE__ */ __name(() => cloudflare_edge_default, "default")
});
var cfPropNameMapping;
var handler;
var cloudflare_edge_default;
var init_cloudflare_edge = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = /* @__PURE__ */ __name(async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    }, "handler");
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});
var pattern_env_exports = {};
__export2(pattern_env_exports, {
  default: /* @__PURE__ */ __name(() => pattern_env_default, "default")
});
function initializeOnce() {
  if (initialized2)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized2 = true;
}
__name(initializeOnce, "initializeOnce");
var cachedOrigins;
var cachedPatterns;
var initialized2;
var envLoader;
var pattern_env_default;
var init_pattern_env = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized2 = false;
    envLoader = {
      name: "env",
      resolve: /* @__PURE__ */ __name(async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug2("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug2("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug2("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error2("Error while resolving origin", e);
          return false;
        }
      }, "resolve")
    };
    pattern_env_default = envLoader;
  }
});
var dummy_exports = {};
__export2(dummy_exports, {
  default: /* @__PURE__ */ __name(() => dummy_default, "default")
});
var resolver2;
var dummy_default;
var init_dummy = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver2 = {
      name: "dummy"
    };
    dummy_default = resolver2;
  }
});
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer2.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
__name(toReadableStream, "toReadableStream");
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer2.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
__name(emptyReadableStream, "emptyReadableStream");
var maybeSomethingBuffer;
var init_stream = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});
var fetch_exports = {};
__export2(fetch_exports, {
  default: /* @__PURE__ */ __name(() => fetch_default, "default")
});
var fetchProxy;
var fetch_default;
var init_fetch = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: /* @__PURE__ */ __name(async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          const cur = responseHeaders[key];
          if (cur === void 0) {
            responseHeaders[key] = value;
          } else if (Array.isArray(cur)) {
            cur.push(value);
          } else {
            responseHeaders[key] = [cur, value];
          }
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }, "proxy")
    };
    fetch_default = fetchProxy;
  }
});
var edgeFunctionHandler_exports = {};
__export2(edgeFunctionHandler_exports, {
  default: /* @__PURE__ */ __name(() => edgeFunctionHandler, "default")
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path3);
  } catch {
  }
  const correspondingRoute = routes.find((route) => route.regex.some((r) => {
    const regex = new RegExp(r);
    return regex.test(path3) || decodedPath !== void 0 && regex.test(decodedPath);
  }));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
__name(edgeFunctionHandler, "edgeFunctionHandler");
var init_edgeFunctionHandler = __esm2({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [];
  }
});
init_logger();
var RequestCache = class {
  static {
    __name(this, "RequestCache");
  }
  _caches = /* @__PURE__ */ new Map();
  /**
   * Returns the Map registered under `key`.
   * If no Map exists yet for that key, a new empty Map is created, stored, and returned.
   * Repeated calls with the same key always return the **same** Map instance.
   */
  getOrCreate(key) {
    let cache = this._caches.get(key);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this._caches.set(key, cache);
    }
    return cache;
  }
};
var DetachedPromise = class {
  static {
    __name(this, "DetachedPromise");
  }
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  static {
    __name(this, "DetachedPromiseRunner");
  }
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug2(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error2(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
__name(awaitAllDetachedPromise, "awaitAllDetachedPromise");
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: /* @__PURE__ */ __name(() => ({
      waitUntil
    }), "get")
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
__name(provideNextAfterProvider, "provideNextAfterProvider");
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set(),
    requestCache: new RequestCache()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}
__name(runWithOpenNextRequestContext, "runWithOpenNextRequestContext");
init_logger();
init_logger();
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
__name(resolveConverter, "resolveConverter");
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
__name(resolveWrapper, "resolveWrapper");
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
__name(resolveOriginResolver, "resolveOriginResolver");
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
__name(resolveAssetResolver, "resolveAssetResolver");
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}
__name(resolveProxyRequest, "resolveProxyRequest");
async function createGenericHandler(handler3) {
  const config = await Promise.resolve().then(() => (init_open_next_config(), open_next_config_exports)).then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug2("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}
__name(createGenericHandler, "createGenericHandler");
init_logger();
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug2({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "typescript": { "ignoreBuildErrors": false }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 14400, "formats": ["image/webp"], "maximumRedirects": 3, "maximumResponseBody": 5e7, "dangerouslyAllowLocalIP": false, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "localPatterns": [{ "pathname": "**", "search": "" }], "remotePatterns": [{ "protocol": "https", "hostname": "graph.facebook.com" }, { "protocol": "https", "hostname": "ladipage-assets.gofiber-phuongnguyen.workers.dev" }], "qualities": [75], "unoptimized": false, "customCacheHandler": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": { "serverFunctions": true, "browserToTerminal": "warn" }, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "D:\\monorepo-project-workspace\\ladipage-fe-v2", "cacheComponents": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 31536e3 } }, "cacheHandlers": {}, "experimental": { "appNewScrollHandler": false, "useSkewCookie": false, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "cachedNavigations": false, "partialFallbacks": false, "dynamicOnHover": false, "varyParams": false, "prefetchInlining": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "proxyPrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 15, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "strictRouteTypes": false, "useTypeScriptCli": false, "viewTransition": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "reactDebugChannel": true, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "transitionIndicator": false, "gestureTransition": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "browserDebugInfoInTerminal": "warn", "lockDistDir": true, "proxyClientMaxBodySize": 10485760, "hideLogsAfterAbort": false, "mcpServer": true, "turbopackFileSystemCacheForDev": true, "turbopackFileSystemCacheForBuild": false, "turbopackInferModuleSideEffects": true, "turbopackPluginRuntimeStrategy": "childProcesses", "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "rules": { "*.svg": { "loaders": ["@svgr/webpack"], "as": "*.js" } }, "root": "D:\\monorepo-project-workspace\\ladipage-fe-v2" }, "distDirRoot": ".next", "_originalRewrites": { "beforeFiles": [{ "source": "/admin/api/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/admin/api/:path*" }, { "source": "/_instatic/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/_instatic/:path*" }, { "source": "/uploads/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/uploads/:path*" }, { "source": "/@vite/:path*", "destination": "http://127.0.0.1:5174/@vite/:path*" }, { "source": "/@fs/:path*", "destination": "http://127.0.0.1:5174/@fs/:path*" }, { "source": "/@id/:path*", "destination": "http://127.0.0.1:5174/@id/:path*" }, { "source": "/@react-refresh", "destination": "http://127.0.0.1:5174/@react-refresh" }, { "source": "/__vite_ping", "destination": "http://127.0.0.1:5174/__vite_ping" }, { "source": "/src/:path*", "destination": "http://127.0.0.1:5174/src/:path*" }, { "source": "/node_modules/:path*", "destination": "http://127.0.0.1:5174/node_modules/:path*" }, { "source": "/assets/:path*", "destination": "http://127.0.0.1:5174/assets/:path*" }, { "source": "/runtime/:path*", "destination": "http://127.0.0.1:5174/runtime/:path*" }, { "source": "/favicon.svg", "destination": "http://127.0.0.1:5174/favicon.svg" }, { "source": "/admin", "destination": "http://127.0.0.1:5174/admin" }, { "source": "/admin/:path*", "destination": "http://127.0.0.1:5174/admin/:path*" }, { "source": "/_cms/admin/api/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/admin/api/:path*" }, { "source": "/_cms/admin", "destination": "http://127.0.0.1:5174/admin" }, { "source": "/_cms/admin/:path*", "destination": "http://127.0.0.1:5174/admin/:path*" }, { "source": "/_cms/:path*", "destination": "http://127.0.0.1:5174/:path*" }], "afterFiles": [], "fallback": [] }, "_originalRedirects": [{ "source": "/seo-automation-v3", "destination": "/ai-seo", "permanent": true }, { "source": "/settings", "destination": "/facebook-ads/cai-dat", "permanent": false }] };
var BuildId = "0lmOGlWkeOZiANpuoq6Ha";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [{ "source": "/admin/api/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/admin/api/:path*", "regex": "^/admin/api(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/_instatic/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/_instatic/:path*", "regex": "^/_instatic(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/uploads/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/uploads/:path*", "regex": "^/uploads(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/@vite/:path*", "destination": "http://127.0.0.1:5174/@vite/:path*", "regex": "^/@vite(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/@fs/:path*", "destination": "http://127.0.0.1:5174/@fs/:path*", "regex": "^/@fs(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/@id/:path*", "destination": "http://127.0.0.1:5174/@id/:path*", "regex": "^/@id(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/@react-refresh", "destination": "http://127.0.0.1:5174/@react-refresh", "regex": "^/@react-refresh(?:/)?$" }, { "source": "/__vite_ping", "destination": "http://127.0.0.1:5174/__vite_ping", "regex": "^/__vite_ping(?:/)?$" }, { "source": "/src/:path*", "destination": "http://127.0.0.1:5174/src/:path*", "regex": "^/src(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/node_modules/:path*", "destination": "http://127.0.0.1:5174/node_modules/:path*", "regex": "^/node_modules(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/assets/:path*", "destination": "http://127.0.0.1:5174/assets/:path*", "regex": "^/assets(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/runtime/:path*", "destination": "http://127.0.0.1:5174/runtime/:path*", "regex": "^/runtime(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/favicon.svg", "destination": "http://127.0.0.1:5174/favicon.svg", "regex": "^/favicon\\.svg(?:/)?$" }, { "source": "/admin", "destination": "http://127.0.0.1:5174/admin", "regex": "^/admin(?:/)?$" }, { "source": "/admin/:path*", "destination": "http://127.0.0.1:5174/admin/:path*", "regex": "^/admin(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/_cms/admin/api/:path*", "destination": "https://instatic-app-sr5zak-96373a-158-220-105-203.sslip.io/admin/api/:path*", "regex": "^/_cms/admin/api(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/_cms/admin", "destination": "http://127.0.0.1:5174/admin", "regex": "^/_cms/admin(?:/)?$" }, { "source": "/_cms/admin/:path*", "destination": "http://127.0.0.1:5174/admin/:path*", "regex": "^/_cms/admin(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }, { "source": "/_cms/:path*", "destination": "http://127.0.0.1:5174/:path*", "regex": "^/_cms(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "priority": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }, { "source": "/seo-automation-v3", "destination": "/ai-seo", "statusCode": 308, "regex": "^(?!/_next)/seo-automation-v3(?:/)?$" }, { "source": "/settings", "destination": "/facebook-ads/cai-dat", "statusCode": 307, "regex": "^(?!/_next)/settings(?:/)?$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_global-error", "regex": "^/_global\\-error(?:/)?$", "routeKeys": {}, "namedRegex": "^/_global\\-error(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/ai-seo", "regex": "^/ai\\-seo(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo(?:/)?$" }, { "page": "/ai-seo/chat", "regex": "^/ai\\-seo/chat(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo/chat(?:/)?$" }, { "page": "/ai-seo/history", "regex": "^/ai\\-seo/history(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo/history(?:/)?$" }, { "page": "/ai-seo/playbooks", "regex": "^/ai\\-seo/playbooks(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo/playbooks(?:/)?$" }, { "page": "/ai-seo/projects", "regex": "^/ai\\-seo/projects(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo/projects(?:/)?$" }, { "page": "/ai-seo/projects/create", "regex": "^/ai\\-seo/projects/create(?:/)?$", "routeKeys": {}, "namedRegex": "^/ai\\-seo/projects/create(?:/)?$" }, { "page": "/api/ai-seo/agents", "regex": "^/api/ai\\-seo/agents(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/agents(?:/)?$" }, { "page": "/api/ai-seo/conversations", "regex": "^/api/ai\\-seo/conversations(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/conversations(?:/)?$" }, { "page": "/api/ai-seo/integrations/google/gbp/callback", "regex": "^/api/ai\\-seo/integrations/google/gbp/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/integrations/google/gbp/callback(?:/)?$" }, { "page": "/api/ai-seo/integrations/google/gbp/connect-url", "regex": "^/api/ai\\-seo/integrations/google/gbp/connect\\-url(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/integrations/google/gbp/connect\\-url(?:/)?$" }, { "page": "/api/ai-seo/integrations/google/gsc/callback", "regex": "^/api/ai\\-seo/integrations/google/gsc/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/integrations/google/gsc/callback(?:/)?$" }, { "page": "/api/ai-seo/integrations/google/gsc/connect-url", "regex": "^/api/ai\\-seo/integrations/google/gsc/connect\\-url(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/integrations/google/gsc/connect\\-url(?:/)?$" }, { "page": "/api/ai-seo/projects", "regex": "^/api/ai\\-seo/projects(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/projects(?:/)?$" }, { "page": "/api/ai-seo/reconcile-published", "regex": "^/api/ai\\-seo/reconcile\\-published(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/reconcile\\-published(?:/)?$" }, { "page": "/api/ai-seo/seo-projects", "regex": "^/api/ai\\-seo/seo\\-projects(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/seo\\-projects(?:/)?$" }, { "page": "/api/ai-seo/seo-tasks", "regex": "^/api/ai\\-seo/seo\\-tasks(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/seo\\-tasks(?:/)?$" }, { "page": "/api/ai-seo/website-projects", "regex": "^/api/ai\\-seo/website\\-projects(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai\\-seo/website\\-projects(?:/)?$" }, { "page": "/api/auth/refresh", "regex": "^/api/auth/refresh(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/auth/refresh(?:/)?$" }, { "page": "/api/builder/import-html", "regex": "^/api/builder/import\\-html(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/builder/import\\-html(?:/)?$" }, { "page": "/api/builder/publish", "regex": "^/api/builder/publish(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/builder/publish(?:/)?$" }, { "page": "/api/builder/session", "regex": "^/api/builder/session(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/builder/session(?:/)?$" }, { "page": "/api/builder/upload", "regex": "^/api/builder/upload(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/builder/upload(?:/)?$" }, { "page": "/api/landing-cms/session", "regex": "^/api/landing\\-cms/session(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-cms/session(?:/)?$" }, { "page": "/api/landing-pages", "regex": "^/api/landing\\-pages(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages(?:/)?$" }, { "page": "/api/landing-pages/domains", "regex": "^/api/landing\\-pages/domains(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/domains(?:/)?$" }, { "page": "/api/landing-pages/form-configs", "regex": "^/api/landing\\-pages/form\\-configs(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/form\\-configs(?:/)?$" }, { "page": "/api/landing-pages/import", "regex": "^/api/landing\\-pages/import(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/import(?:/)?$" }, { "page": "/api/landing-pages/import-zip", "regex": "^/api/landing\\-pages/import\\-zip(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/import\\-zip(?:/)?$" }, { "page": "/api/landing-pages/leads", "regex": "^/api/landing\\-pages/leads(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/leads(?:/)?$" }, { "page": "/api/landing-pages/tags", "regex": "^/api/landing\\-pages/tags(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/landing\\-pages/tags(?:/)?$" }, { "page": "/api/public/landing-pages/sdk-config", "regex": "^/api/public/landing\\-pages/sdk\\-config(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/public/landing\\-pages/sdk\\-config(?:/)?$" }, { "page": "/api/public/landing-templates/list", "regex": "^/api/public/landing\\-templates/list(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/public/landing\\-templates/list(?:/)?$" }, { "page": "/api/public/landing-templates/sdk-config", "regex": "^/api/public/landing\\-templates/sdk\\-config(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/public/landing\\-templates/sdk\\-config(?:/)?$" }, { "page": "/api/revalidate/landing", "regex": "^/api/revalidate/landing(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/revalidate/landing(?:/)?$" }, { "page": "/api/templates/detail", "regex": "^/api/templates/detail(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/templates/detail(?:/)?$" }, { "page": "/api/templates/list", "regex": "^/api/templates/list(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/templates/list(?:/)?$" }, { "page": "/api/templates/stats", "regex": "^/api/templates/stats(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/templates/stats(?:/)?$" }, { "page": "/authority", "regex": "^/authority(?:/)?$", "routeKeys": {}, "namedRegex": "^/authority(?:/)?$" }, { "page": "/automation", "regex": "^/automation(?:/)?$", "routeKeys": {}, "namedRegex": "^/automation(?:/)?$" }, { "page": "/ban-hang", "regex": "^/ban\\-hang(?:/)?$", "routeKeys": {}, "namedRegex": "^/ban\\-hang(?:/)?$" }, { "page": "/bao-cao", "regex": "^/bao\\-cao(?:/)?$", "routeKeys": {}, "namedRegex": "^/bao\\-cao(?:/)?$" }, { "page": "/cloudphone/account-manager", "regex": "^/cloudphone/account\\-manager(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/account\\-manager(?:/)?$" }, { "page": "/cloudphone/cua-hang-cho-thue", "regex": "^/cloudphone/cua\\-hang\\-cho\\-thue(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/cua\\-hang\\-cho\\-thue(?:/)?$" }, { "page": "/cloudphone/custom-actions", "regex": "^/cloudphone/custom\\-actions(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/custom\\-actions(?:/)?$" }, { "page": "/cloudphone/dieu-khien-dong-bo", "regex": "^/cloudphone/dieu\\-khien\\-dong\\-bo(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/dieu\\-khien\\-dong\\-bo(?:/)?$" }, { "page": "/cloudphone/file-manager", "regex": "^/cloudphone/file\\-manager(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/file\\-manager(?:/)?$" }, { "page": "/cloudphone/quan-ly-thiet-bi", "regex": "^/cloudphone/quan\\-ly\\-thiet\\-bi(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/quan\\-ly\\-thiet\\-bi(?:/)?$" }, { "page": "/cloudphone/social-accounts", "regex": "^/cloudphone/social\\-accounts(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/social\\-accounts(?:/)?$" }, { "page": "/cloudphone/workflow-builder", "regex": "^/cloudphone/workflow\\-builder(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/workflow\\-builder(?:/)?$" }, { "page": "/cloudphone/workflow-manager", "regex": "^/cloudphone/workflow\\-manager(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/workflow\\-manager(?:/)?$" }, { "page": "/cloudphone/workflow-store", "regex": "^/cloudphone/workflow\\-store(?:/)?$", "routeKeys": {}, "namedRegex": "^/cloudphone/workflow\\-store(?:/)?$" }, { "page": "/content", "regex": "^/content(?:/)?$", "routeKeys": {}, "namedRegex": "^/content(?:/)?$" }, { "page": "/cskh", "regex": "^/cskh(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh(?:/)?$" }, { "page": "/cskh/cai-dat", "regex": "^/cskh/cai\\-dat(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh/cai\\-dat(?:/)?$" }, { "page": "/cskh/general", "regex": "^/cskh/general(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh/general(?:/)?$" }, { "page": "/cskh/hoi-thoai", "regex": "^/cskh/hoi\\-thoai(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh/hoi\\-thoai(?:/)?$" }, { "page": "/cskh/statistics", "regex": "^/cskh/statistics(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh/statistics(?:/)?$" }, { "page": "/cskh/thong-ke", "regex": "^/cskh/thong\\-ke(?:/)?$", "routeKeys": {}, "namedRegex": "^/cskh/thong\\-ke(?:/)?$" }, { "page": "/e-learning", "regex": "^/e\\-learning(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning(?:/)?$" }, { "page": "/e-learning/bao-cao", "regex": "^/e\\-learning/bao\\-cao(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/bao\\-cao(?:/)?$" }, { "page": "/e-learning/branch-management", "regex": "^/e\\-learning/branch\\-management(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/branch\\-management(?:/)?$" }, { "page": "/e-learning/consultant", "regex": "^/e\\-learning/consultant(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/consultant(?:/)?$" }, { "page": "/e-learning/danh-muc", "regex": "^/e\\-learning/danh\\-muc(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/danh\\-muc(?:/)?$" }, { "page": "/e-learning/giang-vien", "regex": "^/e\\-learning/giang\\-vien(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/giang\\-vien(?:/)?$" }, { "page": "/e-learning/khoa-hoc", "regex": "^/e\\-learning/khoa\\-hoc(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/khoa\\-hoc(?:/)?$" }, { "page": "/e-learning/lecturer", "regex": "^/e\\-learning/lecturer(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer(?:/)?$" }, { "page": "/e-learning/lecturer/attendance", "regex": "^/e\\-learning/lecturer/attendance(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/attendance(?:/)?$" }, { "page": "/e-learning/lecturer/enter-grades", "regex": "^/e\\-learning/lecturer/enter\\-grades(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/enter\\-grades(?:/)?$" }, { "page": "/e-learning/lecturer/learning-progress", "regex": "^/e\\-learning/lecturer/learning\\-progress(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/learning\\-progress(?:/)?$" }, { "page": "/e-learning/lecturer/lecture-editor", "regex": "^/e\\-learning/lecturer/lecture\\-editor(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/lecture\\-editor(?:/)?$" }, { "page": "/e-learning/lecturer/lectures", "regex": "^/e\\-learning/lecturer/lectures(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/lectures(?:/)?$" }, { "page": "/e-learning/lecturer/my-classes", "regex": "^/e\\-learning/lecturer/my\\-classes(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/my\\-classes(?:/)?$" }, { "page": "/e-learning/lecturer/my-schedule", "regex": "^/e\\-learning/lecturer/my\\-schedule(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/my\\-schedule(?:/)?$" }, { "page": "/e-learning/lecturer/profile", "regex": "^/e\\-learning/lecturer/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/profile(?:/)?$" }, { "page": "/e-learning/lecturer/room-info", "regex": "^/e\\-learning/lecturer/room\\-info(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/room\\-info(?:/)?$" }, { "page": "/e-learning/lecturer/schedule-adjustments", "regex": "^/e\\-learning/lecturer/schedule\\-adjustments(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/lecturer/schedule\\-adjustments(?:/)?$" }, { "page": "/e-learning/parents", "regex": "^/e\\-learning/parents(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/parents(?:/)?$" }, { "page": "/e-learning/sinh-vien", "regex": "^/e\\-learning/sinh\\-vien(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/sinh\\-vien(?:/)?$" }, { "page": "/e-learning/student", "regex": "^/e\\-learning/student(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/student(?:/)?$" }, { "page": "/e-learning/thiet-lap", "regex": "^/e\\-learning/thiet\\-lap(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/thiet\\-lap(?:/)?$" }, { "page": "/e-learning/thoi-khoa-bieu", "regex": "^/e\\-learning/thoi\\-khoa\\-bieu(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/thoi\\-khoa\\-bieu(?:/)?$" }, { "page": "/e-learning/tong-quan", "regex": "^/e\\-learning/tong\\-quan(?:/)?$", "routeKeys": {}, "namedRegex": "^/e\\-learning/tong\\-quan(?:/)?$" }, { "page": "/education", "regex": "^/education(?:/)?$", "routeKeys": {}, "namedRegex": "^/education(?:/)?$" }, { "page": "/education/change-password", "regex": "^/education/change\\-password(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/change\\-password(?:/)?$" }, { "page": "/education/dashboard/admin", "regex": "^/education/dashboard/admin(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin(?:/)?$" }, { "page": "/education/dashboard/admin/academic-cohorts", "regex": "^/education/dashboard/admin/academic\\-cohorts(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/academic\\-cohorts(?:/)?$" }, { "page": "/education/dashboard/admin/buildings", "regex": "^/education/dashboard/admin/buildings(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/buildings(?:/)?$" }, { "page": "/education/dashboard/admin/classes", "regex": "^/education/dashboard/admin/classes(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/classes(?:/)?$" }, { "page": "/education/dashboard/admin/contracts", "regex": "^/education/dashboard/admin/contracts(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/contracts(?:/)?$" }, { "page": "/education/dashboard/admin/course-classes", "regex": "^/education/dashboard/admin/course\\-classes(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/course\\-classes(?:/)?$" }, { "page": "/education/dashboard/admin/courses", "regex": "^/education/dashboard/admin/courses(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/courses(?:/)?$" }, { "page": "/education/dashboard/admin/degrees", "regex": "^/education/dashboard/admin/degrees(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/degrees(?:/)?$" }, { "page": "/education/dashboard/admin/departments", "regex": "^/education/dashboard/admin/departments(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/departments(?:/)?$" }, { "page": "/education/dashboard/admin/divisions", "regex": "^/education/dashboard/admin/divisions(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/divisions(?:/)?$" }, { "page": "/education/dashboard/admin/employees", "regex": "^/education/dashboard/admin/employees(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/employees(?:/)?$" }, { "page": "/education/dashboard/admin/lecturers", "regex": "^/education/dashboard/admin/lecturers(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/lecturers(?:/)?$" }, { "page": "/education/dashboard/admin/majors", "regex": "^/education/dashboard/admin/majors(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/majors(?:/)?$" }, { "page": "/education/dashboard/admin/password-reset-requests", "regex": "^/education/dashboard/admin/password\\-reset\\-requests(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/password\\-reset\\-requests(?:/)?$" }, { "page": "/education/dashboard/admin/persons", "regex": "^/education/dashboard/admin/persons(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/persons(?:/)?$" }, { "page": "/education/dashboard/admin/positions", "regex": "^/education/dashboard/admin/positions(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/positions(?:/)?$" }, { "page": "/education/dashboard/admin/rbac", "regex": "^/education/dashboard/admin/rbac(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/rbac(?:/)?$" }, { "page": "/education/dashboard/admin/rooms", "regex": "^/education/dashboard/admin/rooms(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/rooms(?:/)?$" }, { "page": "/education/dashboard/admin/schedule-adjustments", "regex": "^/education/dashboard/admin/schedule\\-adjustments(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/schedule\\-adjustments(?:/)?$" }, { "page": "/education/dashboard/admin/schedules", "regex": "^/education/dashboard/admin/schedules(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/schedules(?:/)?$" }, { "page": "/education/dashboard/admin/school-years", "regex": "^/education/dashboard/admin/school\\-years(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/school\\-years(?:/)?$" }, { "page": "/education/dashboard/admin/semesters", "regex": "^/education/dashboard/admin/semesters(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/semesters(?:/)?$" }, { "page": "/education/dashboard/admin/signin", "regex": "^/education/dashboard/admin/signin(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/signin(?:/)?$" }, { "page": "/education/dashboard/admin/specializations", "regex": "^/education/dashboard/admin/specializations(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/specializations(?:/)?$" }, { "page": "/education/dashboard/admin/staffs", "regex": "^/education/dashboard/admin/staffs(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/staffs(?:/)?$" }, { "page": "/education/dashboard/admin/student-class-assignments", "regex": "^/education/dashboard/admin/student\\-class\\-assignments(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/student\\-class\\-assignments(?:/)?$" }, { "page": "/education/dashboard/admin/student-status-catalog", "regex": "^/education/dashboard/admin/student\\-status\\-catalog(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/student\\-status\\-catalog(?:/)?$" }, { "page": "/education/dashboard/admin/students", "regex": "^/education/dashboard/admin/students(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/students(?:/)?$" }, { "page": "/education/dashboard/admin/time-slots", "regex": "^/education/dashboard/admin/time\\-slots(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/time\\-slots(?:/)?$" }, { "page": "/education/dashboard/admin/training-programs", "regex": "^/education/dashboard/admin/training\\-programs(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/training\\-programs(?:/)?$" }, { "page": "/education/dashboard/admin/users", "regex": "^/education/dashboard/admin/users(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/admin/users(?:/)?$" }, { "page": "/education/dashboard/branch-management", "regex": "^/education/dashboard/branch\\-management(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/branch\\-management(?:/)?$" }, { "page": "/education/dashboard/branch-management/signin", "regex": "^/education/dashboard/branch\\-management/signin(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/branch\\-management/signin(?:/)?$" }, { "page": "/education/dashboard/consultant", "regex": "^/education/dashboard/consultant(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/consultant(?:/)?$" }, { "page": "/education/dashboard/lecturer", "regex": "^/education/dashboard/lecturer(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer(?:/)?$" }, { "page": "/education/dashboard/lecturer/attendance", "regex": "^/education/dashboard/lecturer/attendance(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/attendance(?:/)?$" }, { "page": "/education/dashboard/lecturer/enter-grades", "regex": "^/education/dashboard/lecturer/enter\\-grades(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/enter\\-grades(?:/)?$" }, { "page": "/education/dashboard/lecturer/learning-progress", "regex": "^/education/dashboard/lecturer/learning\\-progress(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/learning\\-progress(?:/)?$" }, { "page": "/education/dashboard/lecturer/lecture-editor", "regex": "^/education/dashboard/lecturer/lecture\\-editor(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/lecture\\-editor(?:/)?$" }, { "page": "/education/dashboard/lecturer/lectures", "regex": "^/education/dashboard/lecturer/lectures(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/lectures(?:/)?$" }, { "page": "/education/dashboard/lecturer/my-classes", "regex": "^/education/dashboard/lecturer/my\\-classes(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/my\\-classes(?:/)?$" }, { "page": "/education/dashboard/lecturer/my-schedule", "regex": "^/education/dashboard/lecturer/my\\-schedule(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/my\\-schedule(?:/)?$" }, { "page": "/education/dashboard/lecturer/profile", "regex": "^/education/dashboard/lecturer/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/profile(?:/)?$" }, { "page": "/education/dashboard/lecturer/room-info", "regex": "^/education/dashboard/lecturer/room\\-info(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/room\\-info(?:/)?$" }, { "page": "/education/dashboard/lecturer/schedule-adjustments", "regex": "^/education/dashboard/lecturer/schedule\\-adjustments(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/lecturer/schedule\\-adjustments(?:/)?$" }, { "page": "/education/dashboard/parents", "regex": "^/education/dashboard/parents(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/parents(?:/)?$" }, { "page": "/education/dashboard/student", "regex": "^/education/dashboard/student(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/student(?:/)?$" }, { "page": "/education/dashboard/student/academic-results", "regex": "^/education/dashboard/student/academic\\-results(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/student/academic\\-results(?:/)?$" }, { "page": "/education/dashboard/student/my-schedule", "regex": "^/education/dashboard/student/my\\-schedule(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/student/my\\-schedule(?:/)?$" }, { "page": "/education/dashboard/student/profile", "regex": "^/education/dashboard/student/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/dashboard/student/profile(?:/)?$" }, { "page": "/education/forgot-password", "regex": "^/education/forgot\\-password(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/forgot\\-password(?:/)?$" }, { "page": "/education/profile", "regex": "^/education/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/education/profile(?:/)?$" }, { "page": "/error-404", "regex": "^/error\\-404(?:/)?$", "routeKeys": {}, "namedRegex": "^/error\\-404(?:/)?$" }, { "page": "/extension-preview/facebook-ads", "regex": "^/extension\\-preview/facebook\\-ads(?:/)?$", "routeKeys": {}, "namedRegex": "^/extension\\-preview/facebook\\-ads(?:/)?$" }, { "page": "/facebook-ads/assets", "regex": "^/facebook\\-ads/assets(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/assets(?:/)?$" }, { "page": "/facebook-ads/cai-dat", "regex": "^/facebook\\-ads/cai\\-dat(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/cai\\-dat(?:/)?$" }, { "page": "/facebook-ads/connections", "regex": "^/facebook\\-ads/connections(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/connections(?:/)?$" }, { "page": "/facebook-ads/create", "regex": "^/facebook\\-ads/create(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/create(?:/)?$" }, { "page": "/facebook-ads/drafts", "regex": "^/facebook\\-ads/drafts(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/drafts(?:/)?$" }, { "page": "/facebook-ads/email-tam-thoi", "regex": "^/facebook\\-ads/email\\-tam\\-thoi(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/email\\-tam\\-thoi(?:/)?$" }, { "page": "/facebook-ads/fanpage", "regex": "^/facebook\\-ads/fanpage(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/fanpage(?:/)?$" }, { "page": "/facebook-ads/guide", "regex": "^/facebook\\-ads/guide(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/guide(?:/)?$" }, { "page": "/facebook-ads/manager", "regex": "^/facebook\\-ads/manager(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/manager(?:/)?$" }, { "page": "/facebook-ads/permissions", "regex": "^/facebook\\-ads/permissions(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/permissions(?:/)?$" }, { "page": "/facebook-ads/policy", "regex": "^/facebook\\-ads/policy(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/policy(?:/)?$" }, { "page": "/facebook-ads/reports", "regex": "^/facebook\\-ads/reports(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/reports(?:/)?$" }, { "page": "/facebook-ads/rules", "regex": "^/facebook\\-ads/rules(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/rules(?:/)?$" }, { "page": "/facebook-ads/support", "regex": "^/facebook\\-ads/support(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/support(?:/)?$" }, { "page": "/facebook-ads/tai-khoan-bm", "regex": "^/facebook\\-ads/tai\\-khoan\\-bm(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/tai\\-khoan\\-bm(?:/)?$" }, { "page": "/facebook-ads/tai-khoan-qc", "regex": "^/facebook\\-ads/tai\\-khoan\\-qc(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/tai\\-khoan\\-qc(?:/)?$" }, { "page": "/facebook-ads/tools", "regex": "^/facebook\\-ads/tools(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads/tools(?:/)?$" }, { "page": "/facebook-ads-v2/cai-dat", "regex": "^/facebook\\-ads\\-v2/cai\\-dat(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/cai\\-dat(?:/)?$" }, { "page": "/facebook-ads-v2/create", "regex": "^/facebook\\-ads\\-v2/create(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/create(?:/)?$" }, { "page": "/facebook-ads-v2/drafts", "regex": "^/facebook\\-ads\\-v2/drafts(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/drafts(?:/)?$" }, { "page": "/facebook-ads-v2/email-tam-thoi", "regex": "^/facebook\\-ads\\-v2/email\\-tam\\-thoi(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/email\\-tam\\-thoi(?:/)?$" }, { "page": "/facebook-ads-v2/fanpage", "regex": "^/facebook\\-ads\\-v2/fanpage(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/fanpage(?:/)?$" }, { "page": "/facebook-ads-v2/manager", "regex": "^/facebook\\-ads\\-v2/manager(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/manager(?:/)?$" }, { "page": "/facebook-ads-v2/reports", "regex": "^/facebook\\-ads\\-v2/reports(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/reports(?:/)?$" }, { "page": "/facebook-ads-v2/rules", "regex": "^/facebook\\-ads\\-v2/rules(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/rules(?:/)?$" }, { "page": "/facebook-ads-v2/tai-khoan-bm", "regex": "^/facebook\\-ads\\-v2/tai\\-khoan\\-bm(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/tai\\-khoan\\-bm(?:/)?$" }, { "page": "/facebook-ads-v2/tai-khoan-qc", "regex": "^/facebook\\-ads\\-v2/tai\\-khoan\\-qc(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/tai\\-khoan\\-qc(?:/)?$" }, { "page": "/facebook-ads-v2/tools", "regex": "^/facebook\\-ads\\-v2/tools(?:/)?$", "routeKeys": {}, "namedRegex": "^/facebook\\-ads\\-v2/tools(?:/)?$" }, { "page": "/favicon.ico", "regex": "^/favicon\\.ico(?:/)?$", "routeKeys": {}, "namedRegex": "^/favicon\\.ico(?:/)?$" }, { "page": "/keywords", "regex": "^/keywords(?:/)?$", "routeKeys": {}, "namedRegex": "^/keywords(?:/)?$" }, { "page": "/khach-hang", "regex": "^/khach\\-hang(?:/)?$", "routeKeys": {}, "namedRegex": "^/khach\\-hang(?:/)?$" }, { "page": "/kho-ung-dung", "regex": "^/kho\\-ung\\-dung(?:/)?$", "routeKeys": {}, "namedRegex": "^/kho\\-ung\\-dung(?:/)?$" }, { "page": "/ladipage", "regex": "^/ladipage(?:/)?$", "routeKeys": {}, "namedRegex": "^/ladipage(?:/)?$" }, { "page": "/landing-pages", "regex": "^/landing\\-pages(?:/)?$", "routeKeys": {}, "namedRegex": "^/landing\\-pages(?:/)?$" }, { "page": "/landing-pages/templates", "regex": "^/landing\\-pages/templates(?:/)?$", "routeKeys": {}, "namedRegex": "^/landing\\-pages/templates(?:/)?$" }, { "page": "/local", "regex": "^/local(?:/)?$", "routeKeys": {}, "namedRegex": "^/local(?:/)?$" }, { "page": "/offerkit", "regex": "^/offerkit(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit(?:/)?$" }, { "page": "/offerkit/campaigns", "regex": "^/offerkit/campaigns(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/campaigns(?:/)?$" }, { "page": "/offerkit/campaigns/new", "regex": "^/offerkit/campaigns/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/campaigns/new(?:/)?$" }, { "page": "/offerkit/customers", "regex": "^/offerkit/customers(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/customers(?:/)?$" }, { "page": "/offerkit/customers/new", "regex": "^/offerkit/customers/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/customers/new(?:/)?$" }, { "page": "/offerkit/events", "regex": "^/offerkit/events(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/events(?:/)?$" }, { "page": "/offerkit/insights", "regex": "^/offerkit/insights(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/insights(?:/)?$" }, { "page": "/offerkit/loyalty", "regex": "^/offerkit/loyalty(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/loyalty(?:/)?$" }, { "page": "/offerkit/loyalty/new", "regex": "^/offerkit/loyalty/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/loyalty/new(?:/)?$" }, { "page": "/offerkit/orders", "regex": "^/offerkit/orders(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/orders(?:/)?$" }, { "page": "/offerkit/redemptions/stack", "regex": "^/offerkit/redemptions/stack(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/redemptions/stack(?:/)?$" }, { "page": "/offerkit/referrals", "regex": "^/offerkit/referrals(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/referrals(?:/)?$" }, { "page": "/offerkit/referrals/new", "regex": "^/offerkit/referrals/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/referrals/new(?:/)?$" }, { "page": "/offerkit/rewards", "regex": "^/offerkit/rewards(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/rewards(?:/)?$" }, { "page": "/offerkit/rewards/new", "regex": "^/offerkit/rewards/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/rewards/new(?:/)?$" }, { "page": "/offerkit/rules", "regex": "^/offerkit/rules(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/rules(?:/)?$" }, { "page": "/offerkit/rules/new", "regex": "^/offerkit/rules/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/rules/new(?:/)?$" }, { "page": "/offerkit/segments", "regex": "^/offerkit/segments(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/segments(?:/)?$" }, { "page": "/offerkit/segments/new", "regex": "^/offerkit/segments/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/segments/new(?:/)?$" }, { "page": "/offerkit/settings", "regex": "^/offerkit/settings(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/settings(?:/)?$" }, { "page": "/offerkit/settings/api-keys", "regex": "^/offerkit/settings/api\\-keys(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/settings/api\\-keys(?:/)?$" }, { "page": "/offerkit/settings/audit-log", "regex": "^/offerkit/settings/audit\\-log(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/settings/audit\\-log(?:/)?$" }, { "page": "/offerkit/vouchers", "regex": "^/offerkit/vouchers(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/vouchers(?:/)?$" }, { "page": "/offerkit/vouchers/new", "regex": "^/offerkit/vouchers/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/vouchers/new(?:/)?$" }, { "page": "/offerkit/webhooks", "regex": "^/offerkit/webhooks(?:/)?$", "routeKeys": {}, "namedRegex": "^/offerkit/webhooks(?:/)?$" }, { "page": "/office", "regex": "^/office(?:/)?$", "routeKeys": {}, "namedRegex": "^/office(?:/)?$" }, { "page": "/otto", "regex": "^/otto(?:/)?$", "routeKeys": {}, "namedRegex": "^/otto(?:/)?$" }, { "page": "/otto/create-project", "regex": "^/otto/create\\-project(?:/)?$", "routeKeys": {}, "namedRegex": "^/otto/create\\-project(?:/)?$" }, { "page": "/profile", "regex": "^/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/profile(?:/)?$" }, { "page": "/sales-kit", "regex": "^/sales\\-kit(?:/)?$", "routeKeys": {}, "namedRegex": "^/sales\\-kit(?:/)?$" }, { "page": "/sdk/builder.js", "regex": "^/sdk/builder\\.js(?:/)?$", "routeKeys": {}, "namedRegex": "^/sdk/builder\\.js(?:/)?$" }, { "page": "/sdk/landing-template-runtime.js", "regex": "^/sdk/landing\\-template\\-runtime\\.js(?:/)?$", "routeKeys": {}, "namedRegex": "^/sdk/landing\\-template\\-runtime\\.js(?:/)?$" }, { "page": "/sdk/landing-template.js", "regex": "^/sdk/landing\\-template\\.js(?:/)?$", "routeKeys": {}, "namedRegex": "^/sdk/landing\\-template\\.js(?:/)?$" }, { "page": "/sdk/landingpage-runtime.js", "regex": "^/sdk/landingpage\\-runtime\\.js(?:/)?$", "routeKeys": {}, "namedRegex": "^/sdk/landingpage\\-runtime\\.js(?:/)?$" }, { "page": "/sdk/landingpage.js", "regex": "^/sdk/landingpage\\.js(?:/)?$", "routeKeys": {}, "namedRegex": "^/sdk/landingpage\\.js(?:/)?$" }, { "page": "/settings", "regex": "^/settings(?:/)?$", "routeKeys": {}, "namedRegex": "^/settings(?:/)?$" }, { "page": "/signin", "regex": "^/signin(?:/)?$", "routeKeys": {}, "namedRegex": "^/signin(?:/)?$" }, { "page": "/signup", "regex": "^/signup(?:/)?$", "routeKeys": {}, "namedRegex": "^/signup(?:/)?$" }, { "page": "/site-metrics", "regex": "^/site\\-metrics(?:/)?$", "routeKeys": {}, "namedRegex": "^/site\\-metrics(?:/)?$" }], "dynamic": [{ "page": "/ai-seo/projects/[projectId]", "regex": "^/ai\\-seo/projects/([^/]+?)(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)(?:/)?$" }, { "page": "/ai-seo/projects/[projectId]/installation", "regex": "^/ai\\-seo/projects/([^/]+?)/installation(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/installation(?:/)?$" }, { "page": "/ai-seo/projects/[projectId]/landing-pages", "regex": "^/ai\\-seo/projects/([^/]+?)/landing\\-pages(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages(?:/)?$" }, { "page": "/ai-seo/projects/[projectId]/tasks", "regex": "^/ai\\-seo/projects/([^/]+?)/tasks(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/tasks(?:/)?$" }, { "page": "/api/ai-seo/conversations/[id]", "regex": "^/api/ai\\-seo/conversations/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/ai\\-seo/conversations/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/conversations/[id]/messages", "regex": "^/api/ai\\-seo/conversations/([^/]+?)/messages(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/ai\\-seo/conversations/(?<nxtPid>[^/]+?)/messages(?:/)?$" }, { "page": "/api/ai-seo/jobs/[jobId]", "regex": "^/api/ai\\-seo/jobs/([^/]+?)(?:/)?$", "routeKeys": { "nxtPjobId": "nxtPjobId" }, "namedRegex": "^/api/ai\\-seo/jobs/(?<nxtPjobId>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/jobs/[jobId]/events", "regex": "^/api/ai\\-seo/jobs/([^/]+?)/events(?:/)?$", "routeKeys": { "nxtPjobId": "nxtPjobId" }, "namedRegex": "^/api/ai\\-seo/jobs/(?<nxtPjobId>[^/]+?)/events(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]", "regex": "^/api/ai\\-seo/projects/([^/]+?)(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/agent-status", "regex": "^/api/ai\\-seo/projects/([^/]+?)/agent\\-status(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/agent\\-status(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/favorite", "regex": "^/api/ai\\-seo/projects/([^/]+?)/favorite(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/favorite(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/landing-pages", "regex": "^/api/ai\\-seo/projects/([^/]+?)/landing\\-pages(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]", "regex": "^/api/ai\\-seo/projects/([^/]+?)/landing\\-pages/([^/]+?)(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages/(?<nxtPpageId>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scan", "regex": "^/api/ai\\-seo/projects/([^/]+?)/landing\\-pages/([^/]+?)/scan(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages/(?<nxtPpageId>[^/]+?)/scan(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scores", "regex": "^/api/ai\\-seo/projects/([^/]+?)/landing\\-pages/([^/]+?)/scores(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages/(?<nxtPpageId>[^/]+?)/scores(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/tasks", "regex": "^/api/ai\\-seo/projects/([^/]+?)/landing\\-pages/([^/]+?)/tasks(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/landing\\-pages/(?<nxtPpageId>[^/]+?)/tasks(?:/)?$" }, { "page": "/api/ai-seo/projects/[projectId]/scan", "regex": "^/api/ai\\-seo/projects/([^/]+?)/scan(?:/)?$", "routeKeys": { "nxtPprojectId": "nxtPprojectId" }, "namedRegex": "^/api/ai\\-seo/projects/(?<nxtPprojectId>[^/]+?)/scan(?:/)?$" }, { "page": "/api/ai-seo/runs/[runId]/tool-calls", "regex": "^/api/ai\\-seo/runs/([^/]+?)/tool\\-calls(?:/)?$", "routeKeys": { "nxtPrunId": "nxtPrunId" }, "namedRegex": "^/api/ai\\-seo/runs/(?<nxtPrunId>[^/]+?)/tool\\-calls(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]/installation", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)/installation(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)/installation(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]/installation/check", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)/installation/check(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)/installation/check(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]/setup", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)/setup(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)/setup(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]/start-audit", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)/start\\-audit(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)/start\\-audit(?:/)?$" }, { "page": "/api/ai-seo/seo-projects/[seoProjectId]/tasks", "regex": "^/api/ai\\-seo/seo\\-projects/([^/]+?)/tasks(?:/)?$", "routeKeys": { "nxtPseoProjectId": "nxtPseoProjectId" }, "namedRegex": "^/api/ai\\-seo/seo\\-projects/(?<nxtPseoProjectId>[^/]+?)/tasks(?:/)?$" }, { "page": "/api/ai-seo/seo-tasks/[taskId]", "regex": "^/api/ai\\-seo/seo\\-tasks/([^/]+?)(?:/)?$", "routeKeys": { "nxtPtaskId": "nxtPtaskId" }, "namedRegex": "^/api/ai\\-seo/seo\\-tasks/(?<nxtPtaskId>[^/]+?)(?:/)?$" }, { "page": "/api/ai-seo/seo-tasks/[taskId]/approve", "regex": "^/api/ai\\-seo/seo\\-tasks/([^/]+?)/approve(?:/)?$", "routeKeys": { "nxtPtaskId": "nxtPtaskId" }, "namedRegex": "^/api/ai\\-seo/seo\\-tasks/(?<nxtPtaskId>[^/]+?)/approve(?:/)?$" }, { "page": "/api/ai-seo/seo-tasks/[taskId]/deploy", "regex": "^/api/ai\\-seo/seo\\-tasks/([^/]+?)/deploy(?:/)?$", "routeKeys": { "nxtPtaskId": "nxtPtaskId" }, "namedRegex": "^/api/ai\\-seo/seo\\-tasks/(?<nxtPtaskId>[^/]+?)/deploy(?:/)?$" }, { "page": "/api/ai-seo/seo-tasks/[taskId]/reject", "regex": "^/api/ai\\-seo/seo\\-tasks/([^/]+?)/reject(?:/)?$", "routeKeys": { "nxtPtaskId": "nxtPtaskId" }, "namedRegex": "^/api/ai\\-seo/seo\\-tasks/(?<nxtPtaskId>[^/]+?)/reject(?:/)?$" }, { "page": "/api/ai-seo/website-projects/[websiteProjectId]/pages", "regex": "^/api/ai\\-seo/website\\-projects/([^/]+?)/pages(?:/)?$", "routeKeys": { "nxtPwebsiteProjectId": "nxtPwebsiteProjectId" }, "namedRegex": "^/api/ai\\-seo/website\\-projects/(?<nxtPwebsiteProjectId>[^/]+?)/pages(?:/)?$" }, { "page": "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/connect-ai-seo", "regex": "^/api/ai\\-seo/website\\-projects/([^/]+?)/pages/([^/]+?)/connect\\-ai\\-seo(?:/)?$", "routeKeys": { "nxtPwebsiteProjectId": "nxtPwebsiteProjectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/website\\-projects/(?<nxtPwebsiteProjectId>[^/]+?)/pages/(?<nxtPpageId>[^/]+?)/connect\\-ai\\-seo(?:/)?$" }, { "page": "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/publish", "regex": "^/api/ai\\-seo/website\\-projects/([^/]+?)/pages/([^/]+?)/publish(?:/)?$", "routeKeys": { "nxtPwebsiteProjectId": "nxtPwebsiteProjectId", "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/ai\\-seo/website\\-projects/(?<nxtPwebsiteProjectId>[^/]+?)/pages/(?<nxtPpageId>[^/]+?)/publish(?:/)?$" }, { "page": "/api/builder/pages/[pageId]", "regex": "^/api/builder/pages/([^/]+?)(?:/)?$", "routeKeys": { "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/api/builder/pages/(?<nxtPpageId>[^/]+?)(?:/)?$" }, { "page": "/api/flowise/[...path]", "regex": "^/api/flowise/(.+?)(?:/)?$", "routeKeys": { "nxtPpath": "nxtPpath" }, "namedRegex": "^/api/flowise/(?<nxtPpath>.+?)(?:/)?$" }, { "page": "/api/gads/[...path]", "regex": "^/api/gads/(.+?)(?:/)?$", "routeKeys": { "nxtPpath": "nxtPpath" }, "namedRegex": "^/api/gads/(?<nxtPpath>.+?)(?:/)?$" }, { "page": "/api/landing-pages/domains/[id]", "regex": "^/api/landing\\-pages/domains/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/landing\\-pages/domains/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/landing-pages/domains/[id]/refresh", "regex": "^/api/landing\\-pages/domains/([^/]+?)/refresh(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/landing\\-pages/domains/(?<nxtPid>[^/]+?)/refresh(?:/)?$" }, { "page": "/api/landing-pages/domains/[id]/routes", "regex": "^/api/landing\\-pages/domains/([^/]+?)/routes(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/landing\\-pages/domains/(?<nxtPid>[^/]+?)/routes(?:/)?$" }, { "page": "/api/landing-pages/tags/[tagId]", "regex": "^/api/landing\\-pages/tags/([^/]+?)(?:/)?$", "routeKeys": { "nxtPtagId": "nxtPtagId" }, "namedRegex": "^/api/landing\\-pages/tags/(?<nxtPtagId>[^/]+?)(?:/)?$" }, { "page": "/api/landing-pages/[id]/lab-preview", "regex": "^/api/landing\\-pages/([^/]+?)/lab\\-preview(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/landing\\-pages/(?<nxtPid>[^/]+?)/lab\\-preview(?:/)?$" }, { "page": "/api/landing-pages/[id]/publish", "regex": "^/api/landing\\-pages/([^/]+?)/publish(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/landing\\-pages/(?<nxtPid>[^/]+?)/publish(?:/)?$" }, { "page": "/api/templates/[id]/stats", "regex": "^/api/templates/([^/]+?)/stats(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/templates/(?<nxtPid>[^/]+?)/stats(?:/)?$" }, { "page": "/builder/[pageId]", "regex": "^/builder/([^/]+?)(?:/)?$", "routeKeys": { "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/builder/(?<nxtPpageId>[^/]+?)(?:/)?$" }, { "page": "/cloudphone/workflow-builder/[id]", "regex": "^/cloudphone/workflow\\-builder/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/cloudphone/workflow\\-builder/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/e-learning/student/[...feature]", "regex": "^/e\\-learning/student/(.+?)(?:/)?$", "routeKeys": { "nxtPfeature": "nxtPfeature" }, "namedRegex": "^/e\\-learning/student/(?<nxtPfeature>.+?)(?:/)?$" }, { "page": "/education/dashboard/admin/courses/[id]", "regex": "^/education/dashboard/admin/courses/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/education/dashboard/admin/courses/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/education/dashboard/admin/rooms/[id]", "regex": "^/education/dashboard/admin/rooms/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/education/dashboard/admin/rooms/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/education/dashboard/admin/[...feature]", "regex": "^/education/dashboard/admin/(.+?)(?:/)?$", "routeKeys": { "nxtPfeature": "nxtPfeature" }, "namedRegex": "^/education/dashboard/admin/(?<nxtPfeature>.+?)(?:/)?$" }, { "page": "/education/dashboard/student/[...feature]", "regex": "^/education/dashboard/student/(.+?)(?:/)?$", "routeKeys": { "nxtPfeature": "nxtPfeature" }, "namedRegex": "^/education/dashboard/student/(?<nxtPfeature>.+?)(?:/)?$" }, { "page": "/facebook-ads/tools/[slug]", "regex": "^/facebook\\-ads/tools/([^/]+?)(?:/)?$", "routeKeys": { "nxtPslug": "nxtPslug" }, "namedRegex": "^/facebook\\-ads/tools/(?<nxtPslug>[^/]+?)(?:/)?$" }, { "page": "/facebook-ads-v2/tools/[slug]", "regex": "^/facebook\\-ads\\-v2/tools/([^/]+?)(?:/)?$", "routeKeys": { "nxtPslug": "nxtPslug" }, "namedRegex": "^/facebook\\-ads\\-v2/tools/(?<nxtPslug>[^/]+?)(?:/)?$" }, { "page": "/landing-pages/editor/[pageId]", "regex": "^/landing\\-pages/editor/([^/]+?)(?:/)?$", "routeKeys": { "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/landing\\-pages/editor/(?<nxtPpageId>[^/]+?)(?:/)?$" }, { "page": "/landing-pages/[pageId]/edit", "regex": "^/landing\\-pages/([^/]+?)/edit(?:/)?$", "routeKeys": { "nxtPpageId": "nxtPpageId" }, "namedRegex": "^/landing\\-pages/(?<nxtPpageId>[^/]+?)/edit(?:/)?$" }, { "page": "/offerkit/campaigns/[id]", "regex": "^/offerkit/campaigns/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/campaigns/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/customers/[id]", "regex": "^/offerkit/customers/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/customers/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/loyalty/members/[id]", "regex": "^/offerkit/loyalty/members/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/loyalty/members/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/loyalty/[id]", "regex": "^/offerkit/loyalty/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/loyalty/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/orders/[id]", "regex": "^/offerkit/orders/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/orders/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/referrals/[id]", "regex": "^/offerkit/referrals/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/referrals/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/rewards/[id]", "regex": "^/offerkit/rewards/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/rewards/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/rules/[id]", "regex": "^/offerkit/rules/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/rules/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/segments/[id]", "regex": "^/offerkit/segments/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/segments/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/offerkit/vouchers/[code]", "regex": "^/offerkit/vouchers/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcode": "nxtPcode" }, "namedRegex": "^/offerkit/vouchers/(?<nxtPcode>[^/]+?)(?:/)?$" }, { "page": "/offerkit/webhooks/[id]", "regex": "^/offerkit/webhooks/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/offerkit/webhooks/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/p/[slug]", "regex": "^/p/([^/]+?)(?:/)?$", "routeKeys": { "nxtPslug": "nxtPslug" }, "namedRegex": "^/p/(?<nxtPslug>[^/]+?)(?:/)?$" }, { "page": "/templates/[slug]", "regex": "^/templates/([^/]+?)(?:/)?$", "routeKeys": { "nxtPslug": "nxtPslug" }, "namedRegex": "^/templates/(?<nxtPslug>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_global-error": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_global-error", "dataRoute": "/_global-error.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo", "dataRoute": "/ai-seo.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo/chat": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo/chat", "dataRoute": "/ai-seo/chat.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo/history": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo/history", "dataRoute": "/ai-seo/history.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo/playbooks": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo/playbooks", "dataRoute": "/ai-seo/playbooks.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo/projects": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo/projects", "dataRoute": "/ai-seo/projects.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ai-seo/projects/create": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ai-seo/projects/create", "dataRoute": "/ai-seo/projects/create.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/authority": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/authority", "dataRoute": "/authority.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/automation": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/automation", "dataRoute": "/automation.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ban-hang": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ban-hang", "dataRoute": "/ban-hang.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/bao-cao": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/bao-cao", "dataRoute": "/bao-cao.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/account-manager": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/account-manager", "dataRoute": "/cloudphone/account-manager.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/cua-hang-cho-thue": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/cua-hang-cho-thue", "dataRoute": "/cloudphone/cua-hang-cho-thue.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/custom-actions": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/custom-actions", "dataRoute": "/cloudphone/custom-actions.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/dieu-khien-dong-bo": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/dieu-khien-dong-bo", "dataRoute": "/cloudphone/dieu-khien-dong-bo.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/file-manager": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/file-manager", "dataRoute": "/cloudphone/file-manager.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/quan-ly-thiet-bi": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/quan-ly-thiet-bi", "dataRoute": "/cloudphone/quan-ly-thiet-bi.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/social-accounts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/social-accounts", "dataRoute": "/cloudphone/social-accounts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/workflow-builder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/workflow-builder", "dataRoute": "/cloudphone/workflow-builder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/workflow-manager": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/workflow-manager", "dataRoute": "/cloudphone/workflow-manager.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cloudphone/workflow-store": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cloudphone/workflow-store", "dataRoute": "/cloudphone/workflow-store.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/content": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/content", "dataRoute": "/content.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cskh": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cskh", "dataRoute": "/cskh.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cskh/cai-dat": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cskh/cai-dat", "dataRoute": "/cskh/cai-dat.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cskh/general": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cskh/general", "dataRoute": "/cskh/general.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cskh/hoi-thoai": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cskh/hoi-thoai", "dataRoute": "/cskh/hoi-thoai.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/cskh/statistics": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/cskh/statistics", "dataRoute": "/cskh/statistics.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning", "dataRoute": "/e-learning.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/bao-cao": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/bao-cao", "dataRoute": "/e-learning/bao-cao.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/branch-management": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/branch-management", "dataRoute": "/e-learning/branch-management.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/consultant": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/consultant", "dataRoute": "/e-learning/consultant.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/danh-muc": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/danh-muc", "dataRoute": "/e-learning/danh-muc.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/giang-vien": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/giang-vien", "dataRoute": "/e-learning/giang-vien.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/khoa-hoc": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/khoa-hoc", "dataRoute": "/e-learning/khoa-hoc.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer", "dataRoute": "/e-learning/lecturer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/attendance": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/attendance", "dataRoute": "/e-learning/lecturer/attendance.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/enter-grades": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/enter-grades", "dataRoute": "/e-learning/lecturer/enter-grades.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/learning-progress": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/learning-progress", "dataRoute": "/e-learning/lecturer/learning-progress.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/lecture-editor": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/lecture-editor", "dataRoute": "/e-learning/lecturer/lecture-editor.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/lectures": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/lectures", "dataRoute": "/e-learning/lecturer/lectures.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/my-classes": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/my-classes", "dataRoute": "/e-learning/lecturer/my-classes.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/my-schedule": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/my-schedule", "dataRoute": "/e-learning/lecturer/my-schedule.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/profile", "dataRoute": "/e-learning/lecturer/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/room-info": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/room-info", "dataRoute": "/e-learning/lecturer/room-info.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/lecturer/schedule-adjustments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/lecturer/schedule-adjustments", "dataRoute": "/e-learning/lecturer/schedule-adjustments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/parents": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/parents", "dataRoute": "/e-learning/parents.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/sinh-vien": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/sinh-vien", "dataRoute": "/e-learning/sinh-vien.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/student": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/student", "dataRoute": "/e-learning/student.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/thiet-lap": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/thiet-lap", "dataRoute": "/e-learning/thiet-lap.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/thoi-khoa-bieu": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/thoi-khoa-bieu", "dataRoute": "/e-learning/thoi-khoa-bieu.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/e-learning/tong-quan": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/e-learning/tong-quan", "dataRoute": "/e-learning/tong-quan.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education", "dataRoute": "/education.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/change-password": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/change-password", "dataRoute": "/education/change-password.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin", "dataRoute": "/education/dashboard/admin.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/academic-cohorts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/academic-cohorts", "dataRoute": "/education/dashboard/admin/academic-cohorts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/buildings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/buildings", "dataRoute": "/education/dashboard/admin/buildings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/classes": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/classes", "dataRoute": "/education/dashboard/admin/classes.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/contracts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/contracts", "dataRoute": "/education/dashboard/admin/contracts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/course-classes": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/course-classes", "dataRoute": "/education/dashboard/admin/course-classes.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/courses": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/courses", "dataRoute": "/education/dashboard/admin/courses.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/courses/placeholder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/courses/[id]", "dataRoute": "/education/dashboard/admin/courses/placeholder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/degrees": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/degrees", "dataRoute": "/education/dashboard/admin/degrees.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/departments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/departments", "dataRoute": "/education/dashboard/admin/departments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/divisions": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/divisions", "dataRoute": "/education/dashboard/admin/divisions.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/employees": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/employees", "dataRoute": "/education/dashboard/admin/employees.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/lecturers": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/lecturers", "dataRoute": "/education/dashboard/admin/lecturers.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/majors": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/majors", "dataRoute": "/education/dashboard/admin/majors.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/notifications": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/[...feature]", "dataRoute": "/education/dashboard/admin/notifications.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/password-reset-requests": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/password-reset-requests", "dataRoute": "/education/dashboard/admin/password-reset-requests.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/persons": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/persons", "dataRoute": "/education/dashboard/admin/persons.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/positions": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/positions", "dataRoute": "/education/dashboard/admin/positions.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/rbac": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/rbac", "dataRoute": "/education/dashboard/admin/rbac.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/reports": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/[...feature]", "dataRoute": "/education/dashboard/admin/reports.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/rooms": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/rooms", "dataRoute": "/education/dashboard/admin/rooms.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/rooms/placeholder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/rooms/[id]", "dataRoute": "/education/dashboard/admin/rooms/placeholder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/schedule-adjustments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/schedule-adjustments", "dataRoute": "/education/dashboard/admin/schedule-adjustments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/schedules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/schedules", "dataRoute": "/education/dashboard/admin/schedules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/school-years": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/school-years", "dataRoute": "/education/dashboard/admin/school-years.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/semesters": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/semesters", "dataRoute": "/education/dashboard/admin/semesters.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/settings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/[...feature]", "dataRoute": "/education/dashboard/admin/settings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/signin": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/signin", "dataRoute": "/education/dashboard/admin/signin.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/specializations": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/specializations", "dataRoute": "/education/dashboard/admin/specializations.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/staffs": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/staffs", "dataRoute": "/education/dashboard/admin/staffs.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/student-class-assignments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/student-class-assignments", "dataRoute": "/education/dashboard/admin/student-class-assignments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/student-status-catalog": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/student-status-catalog", "dataRoute": "/education/dashboard/admin/student-status-catalog.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/students": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/students", "dataRoute": "/education/dashboard/admin/students.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/time-slots": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/time-slots", "dataRoute": "/education/dashboard/admin/time-slots.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/training-programs": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/training-programs", "dataRoute": "/education/dashboard/admin/training-programs.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/users": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/admin/users", "dataRoute": "/education/dashboard/admin/users.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/branch-management": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/branch-management", "dataRoute": "/education/dashboard/branch-management.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/branch-management/signin": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/branch-management/signin", "dataRoute": "/education/dashboard/branch-management/signin.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/consultant": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/consultant", "dataRoute": "/education/dashboard/consultant.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer", "dataRoute": "/education/dashboard/lecturer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/attendance": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/attendance", "dataRoute": "/education/dashboard/lecturer/attendance.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/enter-grades": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/enter-grades", "dataRoute": "/education/dashboard/lecturer/enter-grades.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/learning-progress": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/learning-progress", "dataRoute": "/education/dashboard/lecturer/learning-progress.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/lecture-editor": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/lecture-editor", "dataRoute": "/education/dashboard/lecturer/lecture-editor.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/lectures": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/lectures", "dataRoute": "/education/dashboard/lecturer/lectures.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/my-classes": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/my-classes", "dataRoute": "/education/dashboard/lecturer/my-classes.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/my-schedule": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/my-schedule", "dataRoute": "/education/dashboard/lecturer/my-schedule.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/profile", "dataRoute": "/education/dashboard/lecturer/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/room-info": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/room-info", "dataRoute": "/education/dashboard/lecturer/room-info.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/lecturer/schedule-adjustments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/lecturer/schedule-adjustments", "dataRoute": "/education/dashboard/lecturer/schedule-adjustments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/parents": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/parents", "dataRoute": "/education/dashboard/parents.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student", "dataRoute": "/education/dashboard/student.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/academic-results": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/academic-results", "dataRoute": "/education/dashboard/student/academic-results.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/documents": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/documents.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/exams": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/exams.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/my-schedule": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/my-schedule", "dataRoute": "/education/dashboard/student/my-schedule.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/notifications": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/notifications.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/profile", "dataRoute": "/education/dashboard/student/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/registrations": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/registrations.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/requests": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/requests.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/tuition": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/dashboard/student/[...feature]", "dataRoute": "/education/dashboard/student/tuition.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/forgot-password": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/forgot-password", "dataRoute": "/education/forgot-password.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/education/profile", "dataRoute": "/education/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/error-404": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/error-404", "dataRoute": "/error-404.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/extension-preview/facebook-ads": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/extension-preview/facebook-ads", "dataRoute": "/extension-preview/facebook-ads.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/assets": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/assets", "dataRoute": "/facebook-ads/assets.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/cai-dat": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/cai-dat", "dataRoute": "/facebook-ads/cai-dat.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/connections": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/connections", "dataRoute": "/facebook-ads/connections.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/create": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/create", "dataRoute": "/facebook-ads/create.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/drafts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/drafts", "dataRoute": "/facebook-ads/drafts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/email-tam-thoi": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/email-tam-thoi", "dataRoute": "/facebook-ads/email-tam-thoi.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/fanpage": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/fanpage", "dataRoute": "/facebook-ads/fanpage.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/guide": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/guide", "dataRoute": "/facebook-ads/guide.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/manager": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/manager", "dataRoute": "/facebook-ads/manager.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/permissions": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/permissions", "dataRoute": "/facebook-ads/permissions.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/policy": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/policy", "dataRoute": "/facebook-ads/policy.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/reports": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/reports", "dataRoute": "/facebook-ads/reports.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/rules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/rules", "dataRoute": "/facebook-ads/rules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/support": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/support", "dataRoute": "/facebook-ads/support.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tai-khoan-bm": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tai-khoan-bm", "dataRoute": "/facebook-ads/tai-khoan-bm.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tai-khoan-qc": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tai-khoan-qc", "dataRoute": "/facebook-ads/tai-khoan-qc.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools", "dataRoute": "/facebook-ads/tools.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/ab-test-tracker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/ab-test-tracker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/account-health": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/account-health.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/ad-copy-fatigue": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/ad-copy-fatigue.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/ad-rotation-checker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/ad-rotation-checker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/ai-ad-copy": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/ai-ad-copy.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/budget-burndown": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/budget-burndown.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/budget-overview": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/budget-overview.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/budget-waste-finder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/budget-waste-finder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/bulk-launcher": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/bulk-launcher.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/campaign-cloner": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/campaign-cloner.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/campaign-health-score": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/campaign-health-score.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/campaign-lifecycle": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/campaign-lifecycle.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/capi-settings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/capi-settings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/cbo-analyzer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/cbo-analyzer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/cost-per-milestone": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/cost-per-milestone.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/cpa-trend-tracker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/cpa-trend-tracker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/creative-analyzer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/creative-analyzer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/creative-refresh-planner": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/creative-refresh-planner.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/cross-account-benchmark": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/cross-account-benchmark.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/cta-performance": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/cta-performance.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/delivery-troubleshooter": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/delivery-troubleshooter.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/funnel-dropoff": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/funnel-dropoff.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/inactive-assets": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/inactive-assets.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/launch-templates": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/launch-templates.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/live-stats": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/live-stats.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/performance-alerts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/performance-alerts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/pixel": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/pixel.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/scheduled-budget-rules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/scheduled-budget-rules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/smart-pause-recommender": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/smart-pause-recommender.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/spend-forecast": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/spend-forecast.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/utm-builder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/utm-builder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/winning-ad-detector": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads/tools/[slug]", "dataRoute": "/facebook-ads/tools/winning-ad-detector.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/cai-dat": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/cai-dat", "dataRoute": "/facebook-ads-v2/cai-dat.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/create": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/create", "dataRoute": "/facebook-ads-v2/create.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/drafts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/drafts", "dataRoute": "/facebook-ads-v2/drafts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/email-tam-thoi": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/email-tam-thoi", "dataRoute": "/facebook-ads-v2/email-tam-thoi.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/fanpage": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/fanpage", "dataRoute": "/facebook-ads-v2/fanpage.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/manager": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/manager", "dataRoute": "/facebook-ads-v2/manager.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/reports": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/reports", "dataRoute": "/facebook-ads-v2/reports.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/rules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/rules", "dataRoute": "/facebook-ads-v2/rules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tai-khoan-bm": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tai-khoan-bm", "dataRoute": "/facebook-ads-v2/tai-khoan-bm.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tai-khoan-qc": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tai-khoan-qc", "dataRoute": "/facebook-ads-v2/tai-khoan-qc.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools", "dataRoute": "/facebook-ads-v2/tools.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/ab-test-tracker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/ab-test-tracker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/account-health": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/account-health.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/ad-copy-fatigue": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/ad-copy-fatigue.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/ad-rotation-checker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/ad-rotation-checker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/ai-ad-copy": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/ai-ad-copy.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/budget-burndown": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/budget-burndown.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/budget-overview": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/budget-overview.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/budget-waste-finder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/budget-waste-finder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/bulk-launcher": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/bulk-launcher.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/campaign-cloner": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/campaign-cloner.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/campaign-health-score": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/campaign-health-score.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/campaign-lifecycle": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/campaign-lifecycle.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/capi-settings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/capi-settings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/cbo-analyzer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/cbo-analyzer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/cost-per-milestone": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/cost-per-milestone.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/cpa-trend-tracker": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/cpa-trend-tracker.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/creative-analyzer": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/creative-analyzer.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/creative-refresh-planner": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/creative-refresh-planner.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/cross-account-benchmark": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/cross-account-benchmark.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/cta-performance": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/cta-performance.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/delivery-troubleshooter": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/delivery-troubleshooter.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/funnel-dropoff": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/funnel-dropoff.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/inactive-assets": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/inactive-assets.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/launch-templates": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/launch-templates.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/live-stats": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/live-stats.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/performance-alerts": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/performance-alerts.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/pixel": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/pixel.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/scheduled-budget-rules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/scheduled-budget-rules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/smart-pause-recommender": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/smart-pause-recommender.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/spend-forecast": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/spend-forecast.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/utm-builder": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/utm-builder.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/winning-ad-detector": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/facebook-ads-v2/tools/[slug]", "dataRoute": "/facebook-ads-v2/tools/winning-ad-detector.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/favicon.ico": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico" }, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/favicon.ico", "dataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/keywords": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/keywords", "dataRoute": "/keywords.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/khach-hang": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/khach-hang", "dataRoute": "/khach-hang.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/kho-ung-dung": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/kho-ung-dung", "dataRoute": "/kho-ung-dung.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ladipage": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/ladipage", "dataRoute": "/ladipage.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/landing-pages": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/landing-pages", "dataRoute": "/landing-pages.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/landing-pages/templates": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/landing-pages/templates", "dataRoute": "/landing-pages/templates.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/local": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/local", "dataRoute": "/local.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit", "dataRoute": "/offerkit.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/campaigns": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/campaigns", "dataRoute": "/offerkit/campaigns.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/campaigns/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/campaigns/new", "dataRoute": "/offerkit/campaigns/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/customers": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/customers", "dataRoute": "/offerkit/customers.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/customers/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/customers/new", "dataRoute": "/offerkit/customers/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/events": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/events", "dataRoute": "/offerkit/events.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/insights": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/insights", "dataRoute": "/offerkit/insights.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/loyalty": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/loyalty", "dataRoute": "/offerkit/loyalty.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/loyalty/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/loyalty/new", "dataRoute": "/offerkit/loyalty/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/orders": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/orders", "dataRoute": "/offerkit/orders.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/redemptions/stack": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/redemptions/stack", "dataRoute": "/offerkit/redemptions/stack.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/referrals": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/referrals", "dataRoute": "/offerkit/referrals.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/referrals/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/referrals/new", "dataRoute": "/offerkit/referrals/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/rewards": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/rewards", "dataRoute": "/offerkit/rewards.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/rewards/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/rewards/new", "dataRoute": "/offerkit/rewards/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/rules": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/rules", "dataRoute": "/offerkit/rules.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/rules/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/rules/new", "dataRoute": "/offerkit/rules/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/segments": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/segments", "dataRoute": "/offerkit/segments.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/segments/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/segments/new", "dataRoute": "/offerkit/segments/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/settings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/settings", "dataRoute": "/offerkit/settings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/settings/api-keys": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/settings/api-keys", "dataRoute": "/offerkit/settings/api-keys.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/settings/audit-log": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/settings/audit-log", "dataRoute": "/offerkit/settings/audit-log.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/vouchers": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/vouchers", "dataRoute": "/offerkit/vouchers.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/vouchers/new": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/vouchers/new", "dataRoute": "/offerkit/vouchers/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/offerkit/webhooks": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/offerkit/webhooks", "dataRoute": "/offerkit/webhooks.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/office": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/office", "dataRoute": "/office.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/otto": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/otto", "dataRoute": "/otto.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/otto/create-project": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/otto/create-project", "dataRoute": "/otto/create-project.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/profile", "dataRoute": "/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/sales-kit": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/sales-kit", "dataRoute": "/sales-kit.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/settings": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/settings", "dataRoute": "/settings.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/signin": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/signin", "dataRoute": "/signin.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/signup": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/signup", "dataRoute": "/signup.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/site-metrics": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/site-metrics", "dataRoute": "/site-metrics.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": { "/education/dashboard/admin/courses/[id]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/education/dashboard/admin/courses/([^/]+?)(?:/)?$", "dataRoute": "/education/dashboard/admin/courses/[id].rsc", "fallback": false, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/education/dashboard/admin/courses/([^/]+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/rooms/[id]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/education/dashboard/admin/rooms/([^/]+?)(?:/)?$", "dataRoute": "/education/dashboard/admin/rooms/[id].rsc", "fallback": false, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/education/dashboard/admin/rooms/([^/]+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/admin/[...feature]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/education/dashboard/admin/(.+?)(?:/)?$", "dataRoute": "/education/dashboard/admin/[...feature].rsc", "fallback": false, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/education/dashboard/admin/(.+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/education/dashboard/student/[...feature]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/education/dashboard/student/(.+?)(?:/)?$", "dataRoute": "/education/dashboard/student/[...feature].rsc", "fallback": false, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/education/dashboard/student/(.+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads/tools/[slug]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/facebook\\-ads/tools/([^/]+?)(?:/)?$", "dataRoute": "/facebook-ads/tools/[slug].rsc", "fallback": null, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/facebook\\-ads/tools/([^/]+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/facebook-ads-v2/tools/[slug]": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "routeRegex": "^/facebook\\-ads\\-v2/tools/([^/]+?)(?:/)?$", "dataRoute": "/facebook-ads-v2/tools/[slug].rsc", "fallback": null, "fallbackRootParams": [], "fallbackRouteParams": [], "dataRouteRegex": "^/facebook\\-ads\\-v2/tools/([^/]+?)\\.rsc$", "prefetchDataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "notFoundRoutes": [], "preview": { "previewModeId": "42b9dedd2905331547c688adae4d4bcc", "previewModeSigningKey": "c2bb65b33e418cf8d1178a0f9cf58f43ff6f1b9e617f78edc2ef158ca039b734", "previewModeEncryptionKey": "443cbee94b590a46611026153217e9eef4749b2d6231913adbf07b001cb8c4c0" } };
var MiddlewareManifest = { "version": 3, "middleware": {}, "functions": {}, "sortedMiddleware": [] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/_global-error/page": "/_global-error", "/api/auth/refresh/route": "/api/auth/refresh", "/api/landing-pages/import-zip/route": "/api/landing-pages/import-zip", "/api/landing-pages/import/route": "/api/landing-pages/import", "/favicon.ico/route": "/favicon.ico", "/(builder)/builder/[pageId]/page": "/builder/[pageId]", "/education/change-password/page": "/education/change-password", "/education/forgot-password/page": "/education/forgot-password", "/education/page": "/education", "/education/profile/page": "/education/profile", "/ladipage/page": "/ladipage", "/education/dashboard/admin/academic-cohorts/page": "/education/dashboard/admin/academic-cohorts", "/education/dashboard/admin/buildings/page": "/education/dashboard/admin/buildings", "/education/dashboard/admin/classes/page": "/education/dashboard/admin/classes", "/education/dashboard/admin/contracts/page": "/education/dashboard/admin/contracts", "/education/dashboard/admin/course-classes/page": "/education/dashboard/admin/course-classes", "/education/dashboard/admin/courses/page": "/education/dashboard/admin/courses", "/education/dashboard/admin/degrees/page": "/education/dashboard/admin/degrees", "/education/dashboard/admin/departments/page": "/education/dashboard/admin/departments", "/education/dashboard/admin/divisions/page": "/education/dashboard/admin/divisions", "/education/dashboard/admin/employees/page": "/education/dashboard/admin/employees", "/education/dashboard/admin/lecturers/page": "/education/dashboard/admin/lecturers", "/education/dashboard/admin/majors/page": "/education/dashboard/admin/majors", "/education/dashboard/admin/page": "/education/dashboard/admin", "/education/dashboard/admin/password-reset-requests/page": "/education/dashboard/admin/password-reset-requests", "/education/dashboard/admin/persons/page": "/education/dashboard/admin/persons", "/education/dashboard/admin/positions/page": "/education/dashboard/admin/positions", "/education/dashboard/admin/rbac/page": "/education/dashboard/admin/rbac", "/education/dashboard/admin/rooms/page": "/education/dashboard/admin/rooms", "/education/dashboard/admin/schedule-adjustments/page": "/education/dashboard/admin/schedule-adjustments", "/education/dashboard/admin/schedules/page": "/education/dashboard/admin/schedules", "/education/dashboard/admin/school-years/page": "/education/dashboard/admin/school-years", "/education/dashboard/admin/semesters/page": "/education/dashboard/admin/semesters", "/education/dashboard/admin/specializations/page": "/education/dashboard/admin/specializations", "/education/dashboard/admin/staffs/page": "/education/dashboard/admin/staffs", "/education/dashboard/admin/student-class-assignments/page": "/education/dashboard/admin/student-class-assignments", "/education/dashboard/admin/student-status-catalog/page": "/education/dashboard/admin/student-status-catalog", "/education/dashboard/admin/students/page": "/education/dashboard/admin/students", "/education/dashboard/admin/time-slots/page": "/education/dashboard/admin/time-slots", "/education/dashboard/admin/training-programs/page": "/education/dashboard/admin/training-programs", "/education/dashboard/admin/users/page": "/education/dashboard/admin/users", "/education/dashboard/branch-management/page": "/education/dashboard/branch-management", "/education/dashboard/consultant/page": "/education/dashboard/consultant", "/education/dashboard/lecturer/attendance/page": "/education/dashboard/lecturer/attendance", "/education/dashboard/lecturer/enter-grades/page": "/education/dashboard/lecturer/enter-grades", "/education/dashboard/lecturer/learning-progress/page": "/education/dashboard/lecturer/learning-progress", "/education/dashboard/lecturer/lecture-editor/page": "/education/dashboard/lecturer/lecture-editor", "/education/dashboard/lecturer/lectures/page": "/education/dashboard/lecturer/lectures", "/education/dashboard/lecturer/my-classes/page": "/education/dashboard/lecturer/my-classes", "/education/dashboard/lecturer/my-schedule/page": "/education/dashboard/lecturer/my-schedule", "/education/dashboard/lecturer/page": "/education/dashboard/lecturer", "/education/dashboard/lecturer/profile/page": "/education/dashboard/lecturer/profile", "/education/dashboard/lecturer/room-info/page": "/education/dashboard/lecturer/room-info", "/education/dashboard/lecturer/schedule-adjustments/page": "/education/dashboard/lecturer/schedule-adjustments", "/education/dashboard/parents/page": "/education/dashboard/parents", "/education/dashboard/student/academic-results/page": "/education/dashboard/student/academic-results", "/education/dashboard/student/my-schedule/page": "/education/dashboard/student/my-schedule", "/education/dashboard/student/page": "/education/dashboard/student", "/education/dashboard/student/profile/page": "/education/dashboard/student/profile", "/(extension-preview)/extension-preview/facebook-ads/page": "/extension-preview/facebook-ads", "/(full-width-pages)/(auth)/signin/page": "/signin", "/(full-width-pages)/(auth)/signup/page": "/signup", "/(full-width-pages)/(error-pages)/error-404/page": "/error-404", "/(full-width-pages)/sales-kit/page": "/sales-kit", "/api/ai-seo/agents/route": "/api/ai-seo/agents", "/api/ai-seo/conversations/[id]/route": "/api/ai-seo/conversations/[id]", "/api/ai-seo/integrations/google/gbp/callback/route": "/api/ai-seo/integrations/google/gbp/callback", "/api/ai-seo/conversations/route": "/api/ai-seo/conversations", "/api/ai-seo/integrations/google/gbp/connect-url/route": "/api/ai-seo/integrations/google/gbp/connect-url", "/api/ai-seo/integrations/google/gsc/callback/route": "/api/ai-seo/integrations/google/gsc/callback", "/api/ai-seo/integrations/google/gsc/connect-url/route": "/api/ai-seo/integrations/google/gsc/connect-url", "/api/ai-seo/jobs/[jobId]/events/route": "/api/ai-seo/jobs/[jobId]/events", "/api/ai-seo/conversations/[id]/messages/route": "/api/ai-seo/conversations/[id]/messages", "/api/ai-seo/jobs/[jobId]/route": "/api/ai-seo/jobs/[jobId]", "/api/ai-seo/projects/[projectId]/agent-status/route": "/api/ai-seo/projects/[projectId]/agent-status", "/api/ai-seo/projects/[projectId]/favorite/route": "/api/ai-seo/projects/[projectId]/favorite", "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/route": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]", "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scores/route": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scores", "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scan/route": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scan", "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/tasks/route": "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/tasks", "/api/ai-seo/projects/[projectId]/route": "/api/ai-seo/projects/[projectId]", "/api/ai-seo/projects/[projectId]/landing-pages/route": "/api/ai-seo/projects/[projectId]/landing-pages", "/api/ai-seo/projects/[projectId]/scan/route": "/api/ai-seo/projects/[projectId]/scan", "/api/ai-seo/runs/[runId]/tool-calls/route": "/api/ai-seo/runs/[runId]/tool-calls", "/api/ai-seo/seo-projects/[seoProjectId]/installation/check/route": "/api/ai-seo/seo-projects/[seoProjectId]/installation/check", "/api/ai-seo/reconcile-published/route": "/api/ai-seo/reconcile-published", "/api/ai-seo/projects/route": "/api/ai-seo/projects", "/api/ai-seo/seo-projects/[seoProjectId]/installation/route": "/api/ai-seo/seo-projects/[seoProjectId]/installation", "/api/ai-seo/seo-projects/[seoProjectId]/route": "/api/ai-seo/seo-projects/[seoProjectId]", "/api/ai-seo/seo-projects/[seoProjectId]/setup/route": "/api/ai-seo/seo-projects/[seoProjectId]/setup", "/api/ai-seo/seo-projects/[seoProjectId]/start-audit/route": "/api/ai-seo/seo-projects/[seoProjectId]/start-audit", "/api/ai-seo/seo-projects/[seoProjectId]/tasks/route": "/api/ai-seo/seo-projects/[seoProjectId]/tasks", "/api/ai-seo/seo-tasks/[taskId]/approve/route": "/api/ai-seo/seo-tasks/[taskId]/approve", "/api/ai-seo/seo-projects/route": "/api/ai-seo/seo-projects", "/api/ai-seo/seo-tasks/[taskId]/deploy/route": "/api/ai-seo/seo-tasks/[taskId]/deploy", "/api/ai-seo/seo-tasks/[taskId]/reject/route": "/api/ai-seo/seo-tasks/[taskId]/reject", "/api/ai-seo/seo-tasks/[taskId]/route": "/api/ai-seo/seo-tasks/[taskId]", "/api/ai-seo/seo-tasks/route": "/api/ai-seo/seo-tasks", "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/publish/route": "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/publish", "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/connect-ai-seo/route": "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/connect-ai-seo", "/api/ai-seo/website-projects/[websiteProjectId]/pages/route": "/api/ai-seo/website-projects/[websiteProjectId]/pages", "/api/ai-seo/website-projects/route": "/api/ai-seo/website-projects", "/api/builder/import-html/route": "/api/builder/import-html", "/api/builder/publish/route": "/api/builder/publish", "/api/builder/pages/[pageId]/route": "/api/builder/pages/[pageId]", "/api/builder/session/route": "/api/builder/session", "/api/builder/upload/route": "/api/builder/upload", "/api/flowise/[...path]/route": "/api/flowise/[...path]", "/api/gads/[...path]/route": "/api/gads/[...path]", "/api/landing-cms/session/route": "/api/landing-cms/session", "/api/landing-pages/[id]/publish/route": "/api/landing-pages/[id]/publish", "/api/landing-pages/[id]/lab-preview/route": "/api/landing-pages/[id]/lab-preview", "/api/landing-pages/domains/[id]/refresh/route": "/api/landing-pages/domains/[id]/refresh", "/api/landing-pages/domains/[id]/route": "/api/landing-pages/domains/[id]", "/api/landing-pages/domains/route": "/api/landing-pages/domains", "/api/landing-pages/form-configs/route": "/api/landing-pages/form-configs", "/api/landing-pages/domains/[id]/routes/route": "/api/landing-pages/domains/[id]/routes", "/api/landing-pages/leads/route": "/api/landing-pages/leads", "/api/landing-pages/tags/[tagId]/route": "/api/landing-pages/tags/[tagId]", "/api/public/landing-pages/sdk-config/route": "/api/public/landing-pages/sdk-config", "/api/landing-pages/route": "/api/landing-pages", "/api/public/landing-templates/list/route": "/api/public/landing-templates/list", "/api/public/landing-templates/sdk-config/route": "/api/public/landing-templates/sdk-config", "/api/landing-pages/tags/route": "/api/landing-pages/tags", "/api/revalidate/landing/route": "/api/revalidate/landing", "/api/templates/[id]/stats/route": "/api/templates/[id]/stats", "/api/templates/detail/route": "/api/templates/detail", "/api/templates/stats/route": "/api/templates/stats", "/api/templates/list/route": "/api/templates/list", "/education/dashboard/admin/(auth)/signin/page": "/education/dashboard/admin/signin", "/education/dashboard/branch-management/(auth)/signin/page": "/education/dashboard/branch-management/signin", "/education/dashboard/admin/courses/[id]/page": "/education/dashboard/admin/courses/[id]", "/education/dashboard/admin/rooms/[id]/page": "/education/dashboard/admin/rooms/[id]", "/p/[slug]/route": "/p/[slug]", "/sdk/builder.js/route": "/sdk/builder.js", "/sdk/landing-template-runtime.js/route": "/sdk/landing-template-runtime.js", "/sdk/landing-template.js/route": "/sdk/landing-template.js", "/sdk/landingpage-runtime.js/route": "/sdk/landingpage-runtime.js", "/sdk/landingpage.js/route": "/sdk/landingpage.js", "/templates/[slug]/route": "/templates/[slug]", "/(admin)/ai-seo/chat/page": "/ai-seo/chat", "/(admin)/ai-seo/history/page": "/ai-seo/history", "/(admin)/ai-seo/page": "/ai-seo", "/(admin)/ai-seo/playbooks/page": "/ai-seo/playbooks", "/(admin)/ai-seo/projects/[projectId]/installation/page": "/ai-seo/projects/[projectId]/installation", "/(admin)/ai-seo/projects/[projectId]/landing-pages/page": "/ai-seo/projects/[projectId]/landing-pages", "/(admin)/ai-seo/projects/[projectId]/page": "/ai-seo/projects/[projectId]", "/(admin)/ai-seo/projects/[projectId]/tasks/page": "/ai-seo/projects/[projectId]/tasks", "/(admin)/ai-seo/projects/create/page": "/ai-seo/projects/create", "/(admin)/ai-seo/projects/page": "/ai-seo/projects", "/(admin)/authority/page": "/authority", "/(admin)/ban-hang/page": "/ban-hang", "/(admin)/bao-cao/page": "/bao-cao", "/(admin)/content/page": "/content", "/(admin)/keywords/page": "/keywords", "/(admin)/khach-hang/page": "/khach-hang", "/(admin)/kho-ung-dung/page": "/kho-ung-dung", "/(admin)/local/page": "/local", "/(admin)/otto/create-project/page": "/otto/create-project", "/(admin)/otto/page": "/otto", "/(admin)/page": "/", "/(admin)/settings/page": "/settings", "/(admin)/site-metrics/page": "/site-metrics", "/(admin)/cloudphone/account-manager/page": "/cloudphone/account-manager", "/(admin)/cloudphone/cua-hang-cho-thue/page": "/cloudphone/cua-hang-cho-thue", "/(admin)/cloudphone/custom-actions/page": "/cloudphone/custom-actions", "/(admin)/cloudphone/dieu-khien-dong-bo/page": "/cloudphone/dieu-khien-dong-bo", "/(admin)/cloudphone/file-manager/page": "/cloudphone/file-manager", "/(admin)/cloudphone/quan-ly-thiet-bi/page": "/cloudphone/quan-ly-thiet-bi", "/(admin)/cloudphone/social-accounts/page": "/cloudphone/social-accounts", "/(admin)/cloudphone/workflow-builder/[id]/page": "/cloudphone/workflow-builder/[id]", "/(admin)/cloudphone/workflow-builder/page": "/cloudphone/workflow-builder", "/(admin)/cloudphone/workflow-manager/page": "/cloudphone/workflow-manager", "/(admin)/cloudphone/workflow-store/page": "/cloudphone/workflow-store", "/(admin)/cskh/cai-dat/page": "/cskh/cai-dat", "/(admin)/cskh/general/page": "/cskh/general", "/(admin)/cskh/hoi-thoai/page": "/cskh/hoi-thoai", "/(admin)/cskh/page": "/cskh", "/(admin)/cskh/statistics/page": "/cskh/statistics", "/(admin)/cskh/thong-ke/page": "/cskh/thong-ke", "/(admin)/e-learning/bao-cao/page": "/e-learning/bao-cao", "/(admin)/e-learning/branch-management/page": "/e-learning/branch-management", "/(admin)/e-learning/consultant/page": "/e-learning/consultant", "/(admin)/e-learning/danh-muc/page": "/e-learning/danh-muc", "/(admin)/e-learning/giang-vien/page": "/e-learning/giang-vien", "/(admin)/e-learning/khoa-hoc/page": "/e-learning/khoa-hoc", "/(admin)/e-learning/lecturer/attendance/page": "/e-learning/lecturer/attendance", "/(admin)/e-learning/lecturer/enter-grades/page": "/e-learning/lecturer/enter-grades", "/(admin)/e-learning/lecturer/learning-progress/page": "/e-learning/lecturer/learning-progress", "/(admin)/e-learning/lecturer/lecture-editor/page": "/e-learning/lecturer/lecture-editor", "/(admin)/e-learning/lecturer/lectures/page": "/e-learning/lecturer/lectures", "/(admin)/e-learning/lecturer/my-classes/page": "/e-learning/lecturer/my-classes", "/(admin)/e-learning/lecturer/my-schedule/page": "/e-learning/lecturer/my-schedule", "/(admin)/e-learning/lecturer/page": "/e-learning/lecturer", "/(admin)/e-learning/lecturer/profile/page": "/e-learning/lecturer/profile", "/(admin)/e-learning/lecturer/room-info/page": "/e-learning/lecturer/room-info", "/(admin)/e-learning/lecturer/schedule-adjustments/page": "/e-learning/lecturer/schedule-adjustments", "/(admin)/e-learning/page": "/e-learning", "/(admin)/e-learning/parents/page": "/e-learning/parents", "/(admin)/e-learning/sinh-vien/page": "/e-learning/sinh-vien", "/(admin)/e-learning/student/[...feature]/page": "/e-learning/student/[...feature]", "/(admin)/e-learning/student/page": "/e-learning/student", "/(admin)/e-learning/thiet-lap/page": "/e-learning/thiet-lap", "/(admin)/e-learning/thoi-khoa-bieu/page": "/e-learning/thoi-khoa-bieu", "/(admin)/e-learning/tong-quan/page": "/e-learning/tong-quan", "/(admin)/facebook-ads-v2/cai-dat/page": "/facebook-ads-v2/cai-dat", "/(admin)/facebook-ads-v2/create/page": "/facebook-ads-v2/create", "/(admin)/facebook-ads-v2/drafts/page": "/facebook-ads-v2/drafts", "/(admin)/facebook-ads-v2/email-tam-thoi/page": "/facebook-ads-v2/email-tam-thoi", "/(admin)/facebook-ads-v2/fanpage/page": "/facebook-ads-v2/fanpage", "/(admin)/facebook-ads-v2/manager/page": "/facebook-ads-v2/manager", "/(admin)/facebook-ads-v2/reports/page": "/facebook-ads-v2/reports", "/(admin)/facebook-ads-v2/rules/page": "/facebook-ads-v2/rules", "/(admin)/facebook-ads-v2/tai-khoan-bm/page": "/facebook-ads-v2/tai-khoan-bm", "/(admin)/facebook-ads-v2/tai-khoan-qc/page": "/facebook-ads-v2/tai-khoan-qc", "/(admin)/facebook-ads-v2/tools/page": "/facebook-ads-v2/tools", "/(admin)/facebook-ads/assets/page": "/facebook-ads/assets", "/(admin)/facebook-ads/cai-dat/page": "/facebook-ads/cai-dat", "/(admin)/facebook-ads/connections/page": "/facebook-ads/connections", "/(admin)/facebook-ads/create/page": "/facebook-ads/create", "/(admin)/facebook-ads/drafts/page": "/facebook-ads/drafts", "/(admin)/facebook-ads/email-tam-thoi/page": "/facebook-ads/email-tam-thoi", "/(admin)/facebook-ads/fanpage/page": "/facebook-ads/fanpage", "/(admin)/facebook-ads/guide/page": "/facebook-ads/guide", "/(admin)/facebook-ads/manager/page": "/facebook-ads/manager", "/(admin)/facebook-ads/permissions/page": "/facebook-ads/permissions", "/(admin)/facebook-ads/policy/page": "/facebook-ads/policy", "/(admin)/facebook-ads/reports/page": "/facebook-ads/reports", "/(admin)/facebook-ads/rules/page": "/facebook-ads/rules", "/(admin)/facebook-ads/support/page": "/facebook-ads/support", "/(admin)/facebook-ads/tai-khoan-bm/page": "/facebook-ads/tai-khoan-bm", "/(admin)/facebook-ads/tai-khoan-qc/page": "/facebook-ads/tai-khoan-qc", "/(admin)/facebook-ads/tools/page": "/facebook-ads/tools", "/(admin)/landing-pages/[pageId]/edit/page": "/landing-pages/[pageId]/edit", "/(admin)/landing-pages/editor/[pageId]/page": "/landing-pages/editor/[pageId]", "/(admin)/landing-pages/page": "/landing-pages", "/(admin)/landing-pages/templates/page": "/landing-pages/templates", "/(admin)/offerkit/campaigns/[id]/page": "/offerkit/campaigns/[id]", "/(admin)/offerkit/campaigns/new/page": "/offerkit/campaigns/new", "/(admin)/offerkit/campaigns/page": "/offerkit/campaigns", "/(admin)/offerkit/customers/[id]/page": "/offerkit/customers/[id]", "/(admin)/offerkit/customers/new/page": "/offerkit/customers/new", "/(admin)/offerkit/customers/page": "/offerkit/customers", "/(admin)/offerkit/events/page": "/offerkit/events", "/(admin)/offerkit/insights/page": "/offerkit/insights", "/(admin)/offerkit/loyalty/[id]/page": "/offerkit/loyalty/[id]", "/(admin)/offerkit/loyalty/members/[id]/page": "/offerkit/loyalty/members/[id]", "/(admin)/offerkit/loyalty/new/page": "/offerkit/loyalty/new", "/(admin)/offerkit/loyalty/page": "/offerkit/loyalty", "/(admin)/offerkit/orders/[id]/page": "/offerkit/orders/[id]", "/(admin)/offerkit/orders/page": "/offerkit/orders", "/(admin)/offerkit/page": "/offerkit", "/(admin)/offerkit/redemptions/stack/page": "/offerkit/redemptions/stack", "/(admin)/offerkit/referrals/[id]/page": "/offerkit/referrals/[id]", "/(admin)/offerkit/referrals/new/page": "/offerkit/referrals/new", "/(admin)/offerkit/referrals/page": "/offerkit/referrals", "/(admin)/offerkit/rewards/[id]/page": "/offerkit/rewards/[id]", "/(admin)/offerkit/rewards/new/page": "/offerkit/rewards/new", "/(admin)/offerkit/rewards/page": "/offerkit/rewards", "/(admin)/offerkit/rules/[id]/page": "/offerkit/rules/[id]", "/(admin)/offerkit/rules/new/page": "/offerkit/rules/new", "/(admin)/offerkit/rules/page": "/offerkit/rules", "/(admin)/offerkit/segments/[id]/page": "/offerkit/segments/[id]", "/(admin)/offerkit/segments/new/page": "/offerkit/segments/new", "/(admin)/offerkit/segments/page": "/offerkit/segments", "/(admin)/offerkit/settings/api-keys/page": "/offerkit/settings/api-keys", "/(admin)/offerkit/settings/page": "/offerkit/settings", "/(admin)/offerkit/vouchers/[code]/page": "/offerkit/vouchers/[code]", "/(admin)/offerkit/vouchers/new/page": "/offerkit/vouchers/new", "/(admin)/offerkit/vouchers/page": "/offerkit/vouchers", "/(admin)/offerkit/webhooks/[id]/page": "/offerkit/webhooks/[id]", "/(admin)/offerkit/webhooks/page": "/offerkit/webhooks", "/(admin)/offerkit/settings/audit-log/page": "/offerkit/settings/audit-log", "/(admin)/(others-pages)/profile/page": "/profile", "/(admin)/automation/page": "/automation", "/(admin)/facebook-ads-v2/tools/[slug]/page": "/facebook-ads-v2/tools/[slug]", "/(admin)/facebook-ads/tools/[slug]/page": "/facebook-ads/tools/[slug]", "/(admin)/office/page": "/office", "/education/dashboard/admin/[...feature]/page": "/education/dashboard/admin/[...feature]", "/education/dashboard/student/[...feature]/page": "/education/dashboard/student/[...feature]" };
var FunctionsConfigManifest = { "version": 1, "functions": { "/api/ai-seo/agents": {}, "/api/ai-seo/conversations": {}, "/api/ai-seo/conversations/[id]": {}, "/api/ai-seo/conversations/[id]/messages": {}, "/api/ai-seo/integrations/google/gbp/callback": {}, "/api/ai-seo/integrations/google/gbp/connect-url": {}, "/api/ai-seo/integrations/google/gsc/callback": {}, "/api/ai-seo/integrations/google/gsc/connect-url": {}, "/api/ai-seo/jobs/[jobId]": {}, "/api/ai-seo/jobs/[jobId]/events": {}, "/api/ai-seo/projects": {}, "/api/ai-seo/projects/[projectId]": {}, "/api/ai-seo/projects/[projectId]/agent-status": {}, "/api/ai-seo/projects/[projectId]/favorite": {}, "/api/ai-seo/projects/[projectId]/landing-pages": {}, "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]": {}, "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scan": {}, "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/scores": {}, "/api/ai-seo/projects/[projectId]/landing-pages/[pageId]/tasks": {}, "/api/ai-seo/projects/[projectId]/scan": {}, "/api/ai-seo/reconcile-published": {}, "/api/ai-seo/runs/[runId]/tool-calls": {}, "/api/ai-seo/seo-projects": {}, "/api/ai-seo/seo-projects/[seoProjectId]": {}, "/api/ai-seo/seo-projects/[seoProjectId]/installation": {}, "/api/ai-seo/seo-projects/[seoProjectId]/installation/check": {}, "/api/ai-seo/seo-projects/[seoProjectId]/setup": {}, "/api/ai-seo/seo-projects/[seoProjectId]/start-audit": {}, "/api/ai-seo/seo-projects/[seoProjectId]/tasks": {}, "/api/ai-seo/seo-tasks": {}, "/api/ai-seo/seo-tasks/[taskId]": {}, "/api/ai-seo/seo-tasks/[taskId]/approve": {}, "/api/ai-seo/seo-tasks/[taskId]/deploy": {}, "/api/ai-seo/seo-tasks/[taskId]/reject": {}, "/api/ai-seo/website-projects": {}, "/api/ai-seo/website-projects/[websiteProjectId]/pages": {}, "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/connect-ai-seo": {}, "/api/ai-seo/website-projects/[websiteProjectId]/pages/[pageId]/publish": {}, "/api/builder/import-html": {}, "/api/builder/pages/[pageId]": {}, "/api/builder/publish": {}, "/api/builder/session": {}, "/api/builder/upload": {}, "/api/landing-cms/session": {}, "/api/landing-pages": {}, "/api/landing-pages/[id]/lab-preview": {}, "/api/landing-pages/[id]/publish": {}, "/api/landing-pages/domains": {}, "/api/landing-pages/domains/[id]": {}, "/api/landing-pages/domains/[id]/refresh": {}, "/api/landing-pages/domains/[id]/routes": {}, "/api/landing-pages/form-configs": {}, "/api/landing-pages/leads": {}, "/api/landing-pages/tags": {}, "/api/landing-pages/tags/[tagId]": {}, "/api/public/landing-pages/sdk-config": {}, "/api/public/landing-templates/list": {}, "/api/public/landing-templates/sdk-config": {}, "/api/revalidate/landing": {}, "/api/templates/[id]/stats": {}, "/api/templates/detail": {}, "/api/templates/list": {}, "/api/templates/stats": {}, "/p/[slug]": {}, "/sdk/builder.js": {}, "/sdk/landing-template-runtime.js": {}, "/sdk/landing-template.js": {}, "/sdk/landingpage-runtime.js": {}, "/sdk/landingpage.js": {}, "/templates/[slug]": {} } };
var PagesManifest = { "/404": "pages/404.html", "/500": "pages/500.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.OPEN_NEXT_BUILD_ID = NextConfig.deploymentId ?? BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;
init_logger();
init_util();
init_util();
init_logger();
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}
__name(isBinaryContentType, "isBinaryContentType");
init_stream();
init_logger();
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
__name(parse, "parse");
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}
__name(acceptLanguage, "acceptLanguage");
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
__name(isLocalizedPath, "isLocalizedPath");
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
__name(getLocaleFromCookie, "getLocaleFromCookie");
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
__name(detectDomainLocale, "detectDomainLocale");
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug2({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
__name(detectLocale, "detectLocale");
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
__name(localizePath, "localizePath");
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    const nextUrl = constructNextUrl(internalEvent.url, `/${detectedLocale}${NextConfig.trailingSlash ? "/" : ""}`);
    const queryString = convertToQueryString(internalEvent.query);
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: `${nextUrl}${queryString}`
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleLocaleRedirect, "handleLocaleRedirect");
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
__name(generateShardId, "generateShardId");
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
__name(generateMessageGroupId, "generateMessageGroupId");
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}
__name(cyrb128, "cyrb128");
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
__name(isExternal, "isExternal");
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
__name(convertFromQueryString, "convertFromQueryString");
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
__name(getUrlParts, "getUrlParts");
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
__name(constructNextUrl, "constructNextUrl");
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
__name(convertToQueryString, "convertToQueryString");
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
__name(getMiddlewareMatch, "getMiddlewareMatch");
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
__name(escapeRegex, "escapeRegex");
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
__name(unescapeRegex, "unescapeRegex");
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream22({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
__name(convertBodyToReadableStream, "convertBodyToReadableStream");
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}
__name(normalizeLocationHeader, "normalizeLocationHeader");
init_logger();
init_stream();
init_logger();
function compareSemver(v1, operator, v2) {
  let versionDiff = 0;
  if (v1 === "latest") {
    versionDiff = 1;
  } else {
    if (/^[^\d]/.test(v1)) {
      v1 = v1.substring(1);
    }
    if (/^[^\d]/.test(v2)) {
      v2 = v2.substring(1);
    }
    const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
    const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);
    if (Number.isNaN(major1) || Number.isNaN(major2)) {
      throw new Error("The major version is required.");
    }
    if (major1 !== major2) {
      versionDiff = major1 - major2;
    } else if (minor1 !== minor2) {
      versionDiff = minor1 - minor2;
    } else if (patch1 !== patch2) {
      versionDiff = patch1 - patch2;
    }
  }
  switch (operator) {
    case "=":
      return versionDiff === 0;
    case ">=":
      return versionDiff >= 0;
    case "<=":
      return versionDiff <= 0;
    case ">":
      return versionDiff > 0;
    case "<":
      return versionDiff < 0;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}
__name(compareSemver, "compareSemver");
async function isStale(key, tags, lastModified) {
  if (!compareSemver(globalThis.nextVersion, ">=", "16.0.0")) {
    return false;
  }
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.isStale?.(tags, lastModified) ?? false;
  }
  return await globalThis.tagCache.isStale?.(key, lastModified) ?? false;
}
__name(isStale, "isStale");
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
__name(hasBeenRevalidated, "hasBeenRevalidated");
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}
__name(getTagsFromValue, "getTagsFromValue");
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified, isStaleFromTagCache = false) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = /* @__PURE__ */ __name((str) => createHash("md5").update(str).digest("hex"), "hash");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  const isSSG = finalRevalidate === CACHE_ONE_YEAR;
  const remainingTtl = Math.max(finalRevalidate - age, 1);
  const isStaleFromTime = !isSSG && remainingTtl === 1;
  const isStale2 = isStaleFromTime || isStaleFromTagCache;
  if (!isSSG || isStaleFromTagCache) {
    const sMaxAge = isStaleFromTagCache ? 1 : remainingTtl;
    debug2("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate,
      isStaleFromTagCache
    });
    if (isStale2) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale2 ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
__name(computeCacheControl, "computeCacheControl");
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {}) && !NextConfig.experimental?.prefetchInlining;
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error2("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
__name(getBodyForAppRouter, "getBodyForAppRouter");
async function generateResult(event, localizedPath, cachedValue, lastModified, isStaleFromTagCache = false) {
  debug2("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = event.headers.rsc === "1";
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified, isStaleFromTagCache);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
__name(generateResult, "generateResult");
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
__name(escapePathDelimiters, "escapePathDelimiters");
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => escapePathDelimiters(decodeURIComponent(segment), true)).join("/");
}
__name(decodePathParams, "decodePathParams");
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug2("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  try {
    localizedPath = decodePathParams(localizedPath) || "/";
  } catch {
    return event;
  }
  const cacheKey = localizedPath === "/" ? "/index" : localizedPath;
  debug2("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath) || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug2("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(cacheKey);
      debug2("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      const tags = getTagsFromValue(cachedData.value);
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(cacheKey, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const _isStale = cachedData.shouldBypassTagCache ? false : await isStale(cacheKey, tags, cachedData.lastModified ?? Date.now());
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified, _isStale);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug2("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}
__name(cacheInterceptor, "cacheInterceptor");
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse2");
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
__name(compile, "compile");
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
__name(tokensToFunction, "tokensToFunction");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}
__name(normalizeRepeatedSlashes, "normalizeRepeatedSlashes");
init_stream();
init_logger();
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return /* @__PURE__ */ __name(function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  }, "matchRoute");
}
__name(routeMatcher, "routeMatcher");
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = /* @__PURE__ */ __name((route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  }), "createRouteDefinition");
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}
__name(getStaticAPIRoutes, "getStaticAPIRoutes");
var routeHasMatcher = /* @__PURE__ */ __name((headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
}, "routeHasMatcher");
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
__name(checkHas, "checkHas");
var getParamsFromSource = /* @__PURE__ */ __name((source) => (value) => {
  debug2("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
}, "getParamsFromSource");
var computeParamHas = /* @__PURE__ */ __name((headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = /* @__PURE__ */ __name((value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  }, "fromSource");
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
}, "computeParamHas");
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
__name(convertMatch, "convertMatch");
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug2(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
__name(getNextConfigHeaders, "getNextConfigHeaders");
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug2("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug2("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug2("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
__name(handleRewrites, "handleRewrites");
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleRepeatedSlashRedirect, "handleRepeatedSlashRedirect");
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !(event.query.__nextDataReq === "1") && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
__name(handleTrailingSlashRedirect, "handleTrailingSlashRedirect");
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
__name(handleRedirects, "handleRedirects");
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      headers: {
        ...internalEvent.headers,
        "x-nextjs-data": "1"
      },
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
__name(fixDataPage, "fixDataPage");
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}
__name(handleFallbackFalse, "handleFallbackFalse");
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
__name(defaultMiddlewareLoader, "defaultMiddlewareLoader");
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(normalizedPath);
  } catch {
  }
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath) || decodedPath !== void 0 && r.test(decodedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}
__name(handleMiddleware, "handleMiddleware");
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
var NEXT_INTERNAL_HEADERS = [
  "x-middleware-rewrite",
  "x-middleware-redirect",
  "x-middleware-set-cookie",
  "x-middleware-skip",
  "x-middleware-override-headers",
  "x-middleware-next",
  "x-now-route-matches",
  "x-matched-path",
  "x-nextjs-data",
  "x-next-resume-state-length"
];
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
__name(applyMiddlewareHeaders, "applyMiddlewareHeaders");
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey.startsWith(INTERNAL_HEADER_PREFIX) || lowerCaseKey.startsWith(MIDDLEWARE_HEADER_PREFIX) || NEXT_INTERNAL_HEADERS.includes(lowerCaseKey)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug2("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug2("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug2("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error2("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
__name(routingHandler, "routingHandler");
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}
__name(isInternalResult, "isInternalResult");
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage2();
var defaultHandler = /* @__PURE__ */ __name(async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug2("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error2("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug2("Middleware response", result);
    return result;
  });
}, "defaultHandler");
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});

// worker.mjs
function startsWithAny(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}
__name(startsWithAny, "startsWithAny");
function getBackend(pathname, env) {
  if (startsWithAny(pathname, [
    "/landing-pages",
    "/templates",
    "/p",
    "/sdk",
    "/ladipage",
    "/api/landing-pages",
    "/api/templates",
    "/api/public/landing-pages",
    "/api/public/landing-templates",
    "/api/revalidate/landing",
    "/api/landing-cms"
  ])) {
    return env.LANDING;
  }
  if (startsWithAny(pathname, [
    "/builder",
    "/api/builder"
  ])) {
    return env.BUILDER;
  }
  if (startsWithAny(pathname, [
    "/ai-seo",
    "/otto",
    "/api/ai-seo",
    "/api/flowise"
  ])) {
    return env.AI;
  }
  if (startsWithAny(pathname, [
    "/education",
    "/e-learning"
  ])) {
    return env.EDUCATION;
  }
  if (startsWithAny(pathname, [
    "/facebook-ads",
    "/facebook-ads-v2",
    "/extension-preview/facebook-ads",
    "/api/gads"
  ])) {
    return env.ADS;
  }
  if (startsWithAny(pathname, [
    "/offerkit",
    "/ban-hang",
    "/sales-kit",
    "/khach-hang"
  ])) {
    return env.COMMERCE;
  }
  if (startsWithAny(pathname, [
    "/cskh"
  ])) {
    return env.CARE;
  }
  if (startsWithAny(pathname, [
    "/office"
  ])) {
    return env.OFFICE;
  }
  if (startsWithAny(pathname, [
    "/cloudphone",
    "/automation"
  ])) {
    return env.CLOUDPHONE;
  }
  if (startsWithAny(pathname, [
    "/authority",
    "/bao-cao",
    "/content",
    "/keywords",
    "/kho-ung-dung",
    "/local",
    "/profile",
    "/settings",
    "/site-metrics"
  ])) {
    return env.MISC;
  }
  return env.CORE;
}
__name(getBackend, "getBackend");
var worker_default = {
  async fetch(request, env, ctx) {
    return runWithCloudflareRequestContext(
      request,
      env,
      ctx,
      async () => {
        const skewResponse = maybeGetSkewProtectionResponse(request);
        if (skewResponse) {
          return skewResponse;
        }
        const initialUrl = new URL(request.url);
        if (initialUrl.pathname.startsWith(
          "/cdn-cgi/image/"
        )) {
          return handleCdnCgiImageRequest(
            initialUrl,
            env
          );
        }
        if (initialUrl.pathname === `${globalThis.__NEXT_BASE_PATH__}/_next/image${globalThis.__TRAILING_SLASH__ ? "/" : ""}`) {
          return handleImageRequest(
            initialUrl,
            request.headers,
            env
          );
        }
        const reqOrResp = await handler2(
          request,
          env,
          ctx
        );
        if (reqOrResp instanceof Response) {
          return reqOrResp;
        }
        const routedUrl = new URL(reqOrResp.url);
        const backend = getBackend(
          routedUrl.pathname,
          env
        );
        return backend.fetch(reqOrResp);
      }
    );
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
