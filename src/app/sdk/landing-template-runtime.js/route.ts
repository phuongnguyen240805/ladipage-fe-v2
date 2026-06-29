import { NextResponse } from "next/server";

export const runtime = "nodejs";

const script = `
(function () {
  var queueName = "__EasyManagerTemplateQueue";
  var processed = {};
  var activeIframes = {};

  function resolveMount(config) {
    if (config.target) {
      var target = document.querySelector(config.target);
      if (target) return target;
    }

    var fallback = document.createElement("div");
    if (config.script && config.script.parentNode) {
      config.script.parentNode.insertBefore(fallback, config.script.nextSibling);
    } else {
      document.body.appendChild(fallback);
    }
    return fallback;
  }

  function buildQuery(config) {
    var params = new URLSearchParams();
    if (config.templateId) params.set("templateId", config.templateId);
    if (config.slug) params.set("slug", config.slug);
    return params.toString();
  }

  function createTemplateIframe(config, item) {
    var iframe = document.createElement("iframe");
    iframe.src = item.renderUrl || item.previewUrl + "?embed=1";
    iframe.title = item.name || "Landing template preview";
    iframe.loading = "lazy";
    iframe.style.width = "100%";
    iframe.style.minHeight = String(item.minHeight || 720) + "px";
    iframe.style.height = String(item.minHeight || 720) + "px";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.dataset.templateId = item.id || "";
    iframe.dataset.templateSlug = item.slug || "";
    activeIframes[(item.id || "") + ":" + (item.slug || "")] = iframe;
    return iframe;
  }

  async function mountSingle(config) {
    var mount = resolveMount(config);
    var query = buildQuery(config);
    if (!query) {
      mount.textContent = "Missing template id or slug.";
      return;
    }

    var response = await fetch("/api/public/landing-templates/sdk-config?" + query);
    if (!response.ok) {
      mount.textContent = "Template not found.";
      return;
    }

    var item = await response.json();
    mount.replaceChildren(createTemplateIframe(config, item));
  }

  function createGalleryCard(item) {
    var card = document.createElement("article");
    card.style.border = "1px solid #e5e7eb";
    card.style.borderRadius = "8px";
    card.style.overflow = "hidden";
    card.style.background = "#fff";
    card.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.08)";

    var thumbnail = document.createElement("div");
    thumbnail.style.aspectRatio = "4 / 3";
    thumbnail.style.background = "#f1f5f9";
    thumbnail.style.backgroundSize = "cover";
    thumbnail.style.backgroundPosition = "center";
    if (item.thumbnailUrl) thumbnail.style.backgroundImage = "url(" + JSON.stringify(item.thumbnailUrl).slice(1, -1) + ")";

    var body = document.createElement("div");
    body.style.padding = "12px";

    var name = document.createElement("h3");
    name.textContent = item.name;
    name.style.margin = "0 0 4px";
    name.style.fontSize = "14px";
    name.style.lineHeight = "1.35";
    name.style.color = "#0f172a";

    var category = document.createElement("p");
    category.textContent = item.category || "Template";
    category.style.margin = "0 0 12px";
    category.style.fontSize = "12px";
    category.style.color = "#64748b";

    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "Preview";
    button.style.height = "36px";
    button.style.width = "100%";
    button.style.border = "0";
    button.style.borderRadius = "6px";
    button.style.background = "#0f172a";
    button.style.color = "#fff";
    button.style.fontWeight = "700";
    button.style.cursor = "pointer";
    button.addEventListener("click", function () {
      openPreview(item);
    });

    body.appendChild(name);
    body.appendChild(category);
    body.appendChild(button);
    card.appendChild(thumbnail);
    card.appendChild(body);
    return card;
  }

  function openPreview(item) {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(15, 23, 42, 0.72)";
    overlay.style.padding = "24px";
    overlay.style.overflow = "auto";

    var frameWrap = document.createElement("div");
    frameWrap.style.maxWidth = "1120px";
    frameWrap.style.margin = "0 auto";
    frameWrap.style.background = "#fff";
    frameWrap.style.borderRadius = "8px";
    frameWrap.style.overflow = "hidden";

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "Close";
    close.style.display = "block";
    close.style.marginLeft = "auto";
    close.style.padding = "10px 14px";
    close.style.border = "0";
    close.style.background = "#0f172a";
    close.style.color = "#fff";
    close.style.cursor = "pointer";
    close.addEventListener("click", function () {
      overlay.remove();
    });

    frameWrap.appendChild(close);
    frameWrap.appendChild(createTemplateIframe({}, {
      id: item.id,
      slug: item.slug,
      name: item.name,
      previewUrl: item.previewUrl,
      minHeight: 720
    }));
    overlay.appendChild(frameWrap);
    document.body.appendChild(overlay);
  }

  async function mountGallery(config) {
    var mount = resolveMount(config);
    var params = new URLSearchParams();
    if (config.category) params.set("category", config.category);

    var response = await fetch("/api/public/landing-templates/list?" + params.toString());
    if (!response.ok) {
      mount.textContent = "Template gallery not available.";
      return;
    }

    var payload = await response.json();
    var grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
    grid.style.gap = "16px";

    (payload.items || []).forEach(function (item) {
      grid.appendChild(createGalleryCard(item));
    });

    mount.replaceChildren(grid);
  }

  function processQueue() {
    var queue = window[queueName] || [];
    while (queue.length) {
      var config = queue.shift();
      var key = [config.mode, config.templateId, config.slug, config.category, config.target].join(":");
      if (processed[key]) continue;
      processed[key] = true;

      if (config.mode === "gallery") {
        mountGallery(config).catch(function (error) {
          console.error("[EasyManagerTemplateRuntime] gallery failed", error);
        });
      } else {
        mountSingle(config).catch(function (error) {
          console.error("[EasyManagerTemplateRuntime] single failed", error);
        });
      }
    }
  }

  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "EM_TEMPLATE_RESIZE") return;
    var iframe = activeIframes[(data.templateId || "") + ":" + (data.slug || "")];
    if (!iframe || typeof data.height !== "number") return;
    iframe.style.height = Math.max(320, data.height) + "px";
  });

  window.EasyManagerTemplateRuntime = { processQueue: processQueue };
  processQueue();
})();
`;

export async function GET() {
  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
