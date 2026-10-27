// FAZ_4 4.6 — env → GitHub istemcisi. Token yoksa null (yayın hattı DRY-RUN'a düşer; hata değil).
import { githubClient, type FetchLike, type GitHubClient } from "./github";

export interface PublishEnv {
  GITHUB_PUBLISH_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BASE_BRANCH?: string;
}

export function githubFromEnv(env: PublishEnv, fetchImpl?: FetchLike): GitHubClient | null {
  const token = env.GITHUB_PUBLISH_TOKEN?.trim();
  if (!token) return null;
  return githubClient({ token, repo: env.GITHUB_REPO?.trim() || "batu64/bdimexport", base: env.GITHUB_BASE_BRANCH?.trim() || "main" }, fetchImpl);
}
