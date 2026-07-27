/**
 * Tải source (index.html + assets) của các repo bedimcode về public/templates/bedimcode/<repo>/.
 *
 * Chạy:  pnpm fetch:bedimcode            → chỉ tải các repo testBatch
 *        pnpm fetch:bedimcode --all       → tải toàn bộ manifest
 *        pnpm fetch:bedimcode --force      → tải lại kể cả repo đã có
 *        pnpm fetch:bedimcode <repo> ...   → tải các repo chỉ định
 *
 * Tôn trọng rate limit: đặt GITHUB_TOKEN trong env nếu cần.
 * Idempotent: bỏ qua repo đã có index.html trừ khi --force.
 */
import * as fs from "fs";
import * as path from "path";
import { BEDIMCODE_REPOS, GITHUB_OWNER, type BedimcodeRepoMeta } from "./bedimcode-repos";

const PUBLIC_ROOT = path.resolve(process.cwd(), "public/templates/bedimcode");
const CANDIDATE_BRANCHES = ["main", "master"];
const THUMBNAIL_HINTS = ["preview.png", "preview.jpg", "preview.jpeg", "preview.webp"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ladipage-bedimcode-fetch",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function resolveBranchTree(
  repo: string,
): Promise<{ branch: string; tree: TreeEntry[] } | null> {
  for (const branch of CANDIDATE_BRANCHES) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/git/trees/${branch}?recursive=1`;
    const res = await fetch(url, { headers: githubHeaders() });
    if (res.status === 404) continue;
    if (!res.ok) {
      console.warn(`[fetch] ${repo}: tree ${branch} lỗi HTTP ${res.status}`);
      continue;
    }
    const data = (await res.json()) as { tree?: TreeEntry[]; truncated?: boolean };
    if (data.truncated) {
      console.warn(`[fetch] ${repo}: cây thư mục bị cắt bớt (repo quá lớn), tải phần lấy được.`);
    }
    if (Array.isArray(data.tree)) {
      return { branch, tree: data.tree };
    }
  }
  return null;
}

function shouldDownload(entryPath: string): boolean {
  const lower = entryPath.toLowerCase();
  if (lower === "index.html") return true;
  if (lower.startsWith("assets/")) return true;
  // ảnh preview ở gốc repo dùng làm thumbnail
  if (THUMBNAIL_HINTS.includes(lower)) return true;
  return false;
}

async function downloadBlob(
  repo: string,
  branch: string,
  entryPath: string,
  destDir: string,
): Promise<boolean> {
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/${branch}/${entryPath}`;
  const res = await fetch(rawUrl, { headers: { "User-Agent": "ladipage-bedimcode-fetch" } });
  if (!res.ok) {
    console.warn(`[fetch] ${repo}/${entryPath}: HTTP ${res.status}, bỏ qua.`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const destPath = path.join(destDir, entryPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
  return true;
}

function pickThumbnail(destDir: string): string | null {
  // 1. preview.* ở gốc
  for (const hint of THUMBNAIL_HINTS) {
    if (fs.existsSync(path.join(destDir, hint))) return hint;
  }
  // 2. ảnh đầu tiên trong assets/img (hoặc assets/images)
  for (const imgDir of ["assets/img", "assets/images", "assets/imgs"]) {
    const abs = path.join(destDir, imgDir);
    if (!fs.existsSync(abs)) continue;
    const files = fs
      .readdirSync(abs)
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .sort();
    if (files.length > 0) return `${imgDir}/${files[0]}`;
  }
  return null;
}

async function fetchRepo(meta: BedimcodeRepoMeta, force: boolean): Promise<void> {
  const destDir = path.join(PUBLIC_ROOT, meta.repo);
  const indexPath = path.join(destDir, "index.html");

  if (!force && fs.existsSync(indexPath)) {
    console.log(`[fetch] ${meta.repo}: đã có, bỏ qua (dùng --force để tải lại).`);
    return;
  }

  const resolved = await resolveBranchTree(meta.repo);
  if (!resolved) {
    console.error(`[fetch] ❌ ${meta.repo}: không tìm thấy branch main/master.`);
    return;
  }

  const { branch, tree } = resolved;
  const targets = tree.filter((e) => e.type === "blob" && shouldDownload(e.path));
  const hasIndex = targets.some((e) => e.path.toLowerCase() === "index.html");

  if (!hasIndex) {
    console.error(`[fetch] ❌ ${meta.repo}: không có index.html ở gốc, bỏ qua.`);
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });

  let ok = 0;
  for (const entry of targets) {
    const done = await downloadBlob(meta.repo, branch, entry.path, destDir);
    if (done) ok++;
  }

  const thumbnail = pickThumbnail(destDir);
  console.log(
    `[fetch] ✅ ${meta.repo}: branch=${branch}, files=${ok}/${targets.length}, thumbnail=${thumbnail ?? "(none)"}`,
  );
}

function selectRepos(): { list: BedimcodeRepoMeta[]; force: boolean } {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const all = args.includes("--all");
  const explicit = args.filter((a) => !a.startsWith("--"));

  if (explicit.length > 0) {
    const list = BEDIMCODE_REPOS.filter((r) => explicit.includes(r.repo));
    const missing = explicit.filter((r) => !BEDIMCODE_REPOS.some((m) => m.repo === r));
    if (missing.length > 0) {
      console.warn(`[fetch] Không có trong manifest, bỏ qua: ${missing.join(", ")}`);
    }
    return { list, force };
  }

  if (all) return { list: BEDIMCODE_REPOS, force };
  return { list: BEDIMCODE_REPOS.filter((r) => r.testBatch), force };
}

async function main() {
  const { list, force } = selectRepos();
  if (list.length === 0) {
    console.error("[fetch] Không có repo nào để tải.");
    process.exit(1);
  }

  console.log(`[fetch] Bắt đầu tải ${list.length} repo về ${PUBLIC_ROOT}`);
  fs.mkdirSync(PUBLIC_ROOT, { recursive: true });

  for (const meta of list) {
    try {
      await fetchRepo(meta, force);
    } catch (err) {
      console.error(`[fetch] ❌ ${meta.repo}: lỗi ngoại lệ`, err instanceof Error ? err.message : err);
    }
  }

  console.log("[fetch] Hoàn tất.");
}

void main();
