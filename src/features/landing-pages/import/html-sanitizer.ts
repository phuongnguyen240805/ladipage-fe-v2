export type SanitizeHtmlOptions = {
  preserveScripts?: boolean;
  removeOpenDesignScripts?: boolean;
  allowIframes?: boolean;
};

function isOpenDesignScript(el: Element): boolean {
  return Array.from(el.attributes).some((attr) => {
    const name = attr.name.toLowerCase();
    return (
      name.startsWith("data-od") ||
      name === "data-od-sandbox-shim" ||
      name === "data-od-tweaks-bridge" ||
      name === "data-od-snapshot-bridge" ||
      name === "data-od-srcdoc-transport-activation"
    );
  });
}

function isDangerousUrl(value: string): boolean {
  return /^\s*javascript:/i.test(value) || /^\s*vbscript:/i.test(value);
}

export function sanitizeHtml(
  html: string,
  options: SanitizeHtmlOptions = {},
): string {
  if (typeof window === "undefined") {
    return fallbackRegexSanitize(html, options);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (doc.head) sanitizeElement(doc.head, options);
    if (doc.body) sanitizeElement(doc.body, options);

    return `<!doctype html>\n${doc.documentElement.outerHTML}`;
  } catch (err) {
    console.error("DOMParser sanitize failed, using regex fallback:", err);
    return fallbackRegexSanitize(html, options);
  }
}

export function sanitizeElement(
  root: HTMLElement,
  options: SanitizeHtmlOptions = {},
): void {
  const {
    preserveScripts = false,
    removeOpenDesignScripts = true,
    allowIframes = true,
  } = options;

  const scripts = Array.from(root.querySelectorAll("script"));

  for (const script of scripts) {
    if (removeOpenDesignScripts && isOpenDesignScript(script)) {
      script.remove();
      continue;
    }

    if (!preserveScripts) {
      script.remove();
      continue;
    }

    const src = script.getAttribute("src");
    if (src && isDangerousUrl(src)) {
      script.remove();
      continue;
    }

    // Giữ script chính của landing page trong preserve mode.
    // Script sẽ chạy trong iframe sandbox, không chạy trực tiếp trong editor.
  }

  const blockedEmbeds = Array.from(root.querySelectorAll("embed, object"));
  for (const el of blockedEmbeds) {
    el.remove();
  }

  const allElements = Array.from(root.querySelectorAll("*")) as HTMLElement[];
  allElements.push(root);

  for (const el of allElements) {
    const tagName = el.tagName.toLowerCase();

    if (tagName === "iframe") {
      if (!allowIframes) {
        el.remove();
        continue;
      }

      el.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-forms allow-popups",
      );
    }

    const attrsToRemove: string[] = [];

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      const name = attr.name.toLowerCase();
      const value = attr.value || "";

      if (!preserveScripts && name.startsWith("on")) {
        attrsToRemove.push(attr.name);
        continue;
      }

      if (
        !preserveScripts &&
        ["href", "src", "xlink:href", "formaction", "action"].includes(name) &&
        isDangerousUrl(value)
      ) {
        attrsToRemove.push(attr.name);
        continue;
      }

      if (!preserveScripts && name === "style" && /url\(\s*['"]?\s*(javascript:|vbscript:)/i.test(value)) {
        attrsToRemove.push(attr.name);
      }
    }

    for (const attr of attrsToRemove) {
      el.removeAttribute(attr);
    }
  }
}

function fallbackRegexSanitize(
  html: string,
  options: SanitizeHtmlOptions = {},
): string {
  let cleaned = html;

  const {
    preserveScripts = false,
    removeOpenDesignScripts = true,
  } = options;

  if (removeOpenDesignScripts) {
      cleaned = cleaned.replace(
        /<script\b[^>]*(data-od[-\w]*)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
        "",
      );
  }

  if (!preserveScripts) {
    cleaned = cleaned.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  }

  cleaned = cleaned.replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, "");
  cleaned = cleaned.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "");

  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "");

  cleaned = cleaned.replace(/href\s*=\s*(['"])\s*javascript:.*?\1/gi, 'href="#"');
  cleaned = cleaned.replace(/src\s*=\s*(['"])\s*javascript:.*?\1/gi, 'src=""');
  cleaned = cleaned.replace(/action\s*=\s*(['"])\s*javascript:.*?\1/gi, 'action=""');

  return cleaned;
}

export default sanitizeHtml;