import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const script = String.raw`
(function () {
  var queue = window.__EasyManagerLandingQueue = window.__EasyManagerLandingQueue || [];
  var mounted = window.__EasyManagerLandingMounted = window.__EasyManagerLandingMounted || {};

  function buildConfigUrl(item) {
    var params = new URLSearchParams();
    if (item.pageId) params.set("pageId", item.pageId);
    if (item.slug) params.set("slug", item.slug);
    params.set("domain", window.location.hostname);
    params.set("href", window.location.href);
    return "/api/public/landing-pages/sdk-config?" + params.toString();
  }

  function findTarget(item) {
    if (item.target) {
      var target = document.querySelector(item.target);
      if (target) return target;
    }
    var container = document.createElement("div");
    item.script.parentNode.insertBefore(container, item.script.nextSibling);
    return container;
  }

  function mount(item) {
    var identity = item.pageId || item.slug;
    if (!identity || mounted[identity]) return;
    mounted[identity] = true;

    fetch(buildConfigUrl(item), { credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("Landing page config not found");
        return res.json();
      })
      .then(function (config) {
        var target = findTarget(item);
        var iframe = document.createElement("iframe");
        iframe.src = config.renderUrl;
        iframe.title = config.name || "Landing page";
        iframe.loading = "lazy";
        iframe.style.width = "100%";
        iframe.style.minHeight = (config.minHeight || 480) + "px";
        iframe.style.border = "0";
        iframe.style.display = "block";
        iframe.setAttribute("data-easy-manager-page-id", config.id);
        iframe.setAttribute("data-easy-manager-slug", config.slug);
        target.appendChild(iframe);

        window.addEventListener("message", function (event) {
          var message = event.data;
          if (!message || message.type !== "EM_PUBLIC_PAGE_RESIZE") return;
          if (message.pageId !== config.id && message.slug !== config.slug) return;
          if (typeof message.height === "number" && message.height > 0) {
            iframe.style.height = message.height + "px";
          }
        });

        window.dispatchEvent(new CustomEvent("easy-manager:landing-mounted", {
          detail: { id: config.id, slug: config.slug, iframe: iframe }
        }));
      })
      .catch(function (error) {
        mounted[identity] = false;
        console.error("[EasyManager Landing SDK]", error);
      });
  }

  while (queue.length) mount(queue.shift());
  queue.push = function () {
    Array.prototype.push.apply(this, arguments);
    for (var i = 0; i < arguments.length; i++) mount(arguments[i]);
    return this.length;
  };
})();`;

  return new NextResponse(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
