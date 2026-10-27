// FAZ_4 4.6 — yayın botu için minimal GitHub REST istemcisi (fine-grained PAT: yalnız bu repo, Contents + Pull requests yazma).
// Token yalnız Authorization başlığında; hata metinlerine, log'a, audit'e ASLA girmez.
// Bot main'e DOĞRUDAN yazmaz: her yayın ayrı dal + PR; merge insan işidir.

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body?: string }) => Promise<{
  ok: boolean; status: number; json(): Promise<unknown>;
}>;

export interface GitHubConfig {
  token: string;
  /** "sahip/repo" */
  repo: string;
  /** PR hedef dalı */
  base: string;
}

export class GitHubError extends Error {
  status: number;
  op: string;
  constructor(status: number, op: string) {
    super(`github_${op}_${status}`); // token / gövde içermez
    this.status = status;
    this.op = op;
  }
}

const API = "https://api.github.com";
export const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const BRANCH_RE = /^[A-Za-z0-9._\/-]{1,100}$/;

function b64utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function githubClient(cfg: GitHubConfig, fetchImpl: FetchLike = fetch as unknown as FetchLike) {
  if (!REPO_RE.test(cfg.repo) || !BRANCH_RE.test(cfg.base)) throw new Error("github_config_invalid");
  const headers = {
    authorization: `Bearer ${cfg.token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "bdimexport-publisher",
    "content-type": "application/json",
  };
  async function call<T>(op: string, method: string, path: string, body?: unknown, okStatuses: number[] = []): Promise<{ status: number; data: T | null }> {
    const r = await fetchImpl(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!r.ok && !okStatuses.includes(r.status)) throw new GitHubError(r.status, op);
    return { status: r.status, data: r.ok ? ((await r.json()) as T) : null };
  }
  const repo = `/repos/${cfg.repo}`;
  const enc = (p: string) => p.split("/").map(encodeURIComponent).join("/");
  return {
    async baseSha(): Promise<string> {
      const r = await call<{ object: { sha: string } }>("base_ref", "GET", `${repo}/git/ref/heads/${enc(cfg.base)}`);
      return r.data!.object.sha;
    },
    /** dosya hedef dalda (varsayılan: base) var mı? (404 = yok) */
    async exists(path: string, ref: string = cfg.base): Promise<boolean> {
      const r = await call("exists", "GET", `${repo}/contents/${enc(path)}?ref=${encodeURIComponent(ref)}`, undefined, [404]);
      return r.status !== 404;
    },
    async createBranch(branch: string, sha: string): Promise<void> {
      if (!BRANCH_RE.test(branch)) throw new Error("github_branch_invalid");
      await call("create_branch", "POST", `${repo}/git/refs`, { ref: `refs/heads/${branch}`, sha });
    },
    async putFile(branch: string, path: string, content: string, message: string): Promise<void> {
      await call("put_file", "PUT", `${repo}/contents/${enc(path)}`, { message, content: b64utf8(content), branch });
    },
    async openPr(branch: string, title: string, body: string): Promise<{ number: number; url: string }> {
      const r = await call<{ number: number; html_url: string }>("open_pr", "POST", `${repo}/pulls`, { title, head: branch, base: cfg.base, body, maintainer_can_modify: true });
      return { number: r.data!.number, url: r.data!.html_url };
    },
    async pr(number: number): Promise<{ state: "open" | "closed"; merged: boolean }> {
      const r = await call<{ state: "open" | "closed"; merged: boolean }>("get_pr", "GET", `${repo}/pulls/${number}`);
      return { state: r.data!.state, merged: !!r.data!.merged };
    },
    async closePr(number: number): Promise<void> {
      await call("close_pr", "PATCH", `${repo}/pulls/${number}`, { state: "closed" });
    },
  };
}
export type GitHubClient = ReturnType<typeof githubClient>;
