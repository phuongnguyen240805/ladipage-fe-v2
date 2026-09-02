import {
  handleCdnCgiImageRequest,
  handleImageRequest
} from "../.open-next/cloudflare/images.js";

import {
  runWithCloudflareRequestContext
} from "../.open-next/cloudflare/init.js";

import {
  maybeGetSkewProtectionResponse
} from "../.open-next/cloudflare/skew-protection.js";

import {
  handler as middlewareHandler
} from "../.open-next/middleware/handler.mjs";


function startsWithAny(pathname, prefixes) {
  return prefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(prefix + "/")
  );
}


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


export default {

  async fetch(request, env, ctx) {

    return runWithCloudflareRequestContext(
      request,
      env,
      ctx,
      async () => {

        const skewResponse =
          maybeGetSkewProtectionResponse(request);

        if (skewResponse) {
          return skewResponse;
        }

        const initialUrl = new URL(request.url);

        if (
          initialUrl.pathname.startsWith(
            "/cdn-cgi/image/"
          )
        ) {
          return handleCdnCgiImageRequest(
            initialUrl,
            env
          );
        }

        if (
          initialUrl.pathname ===
          `${globalThis.__NEXT_BASE_PATH__}/_next/image${
            globalThis.__TRAILING_SLASH__ ? "/" : ""
          }`
        ) {
          return handleImageRequest(
            initialUrl,
            request.headers,
            env
          );
        }

        /*
         * Middleware phai chay TRUOC routing.
         * Quan trong cho auth + free subdomain rewrite.
         */
        const reqOrResp =
          await middlewareHandler(
            request,
            env,
            ctx
          );

        if (reqOrResp instanceof Response) {
          return reqOrResp;
        }

        const routedUrl =
          new URL(reqOrResp.url);

        const backend =
          getBackend(
            routedUrl.pathname,
            env
          );

        return backend.fetch(reqOrResp);
      }
    );
  }
};