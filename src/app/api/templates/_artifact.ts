import { readFile } from "node:fs/promises";
import path from "node:path";

export function isTemplateArtifactPath(assetPath: string): boolean {
  const normalized = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  return normalized.startsWith("template-artifacts/") && !normalized.includes("..");
}

export function resolveArtifactRequestUrls(origin: string, assetPath: string): string[] {
  const urls: string[] = [];
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim().replace(/\/+$/, "");
  const relative = assetPath.replace(/^\/+/, "");

  if (cdnBase) {
    urls.push(`${cdnBase}/${relative}`);
  }

  if (/^https?:\/\//i.test(assetPath)) {
    urls.push(assetPath);
  } else if (origin) {
    urls.push(new URL(`/${relative}`, origin).toString());
  }

  return [...new Set(urls)];
}

export async function readLocalTemplateArtifact(assetPath: string): Promise<unknown | null> {
  if (!isTemplateArtifactPath(assetPath)) return null;

  const relative = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const candidates = [
    path.join(process.cwd(), "public", relative),
    path.join(process.cwd(), relative),
  ];

  for (const filePath of candidates) {
    try {
      const text = await readFile(filePath, "utf8");
      return JSON.parse(text) as unknown;
    } catch {
      /* Worker runtimes and missing files fall through to HTTP fetch. */
    }
  }

  return null;
}

export async function fetchRemoteTemplateArtifact(
  origin: string,
  assetPath: string,
): Promise<{ data: unknown | null; failures: string[] }> {
  const failures: string[] = [];

  for (const url of resolveArtifactRequestUrls(origin, assetPath)) {
    try {
      const response = await fetch(url, { cache: "force-cache" });
      if (response.ok) {
        return { data: await response.json(), failures };
      }
      failures.push(`${response.status} ${url}`);
    } catch (error) {
      failures.push(`${error instanceof Error ? error.message : String(error)} ${url}`);
    }
  }

  return { data: null, failures };
}
