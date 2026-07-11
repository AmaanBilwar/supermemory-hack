import { createHash } from "node:crypto"
import { resolve } from "node:path"
import type { RepoScope } from "./domain.js"

export const makeRepoScope = (repoPath: string): RepoScope => {
  const normalized = resolve(repoPath)
  const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 12)

  return {
    repoPath: normalized,
    containerTag: `agent-bus_repo_${hash}`
  }
}
