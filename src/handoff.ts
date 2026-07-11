import { Effect } from "effect"
import { SearchRequest } from "./domain.js"
import type { SupermemoryClientShape } from "./supermemory.js"

export const createHandoff = Effect.fn("Handoff.create")(function*(
  client: SupermemoryClientShape,
  request: SearchRequest,
  toAgent: string
) {
  const results = yield* client.search(request)

  const memories = results.results.map((result, index) => {
    const text = result.memory ?? result.chunk ?? ""
    const metadata = result.metadata ?? {}
    const agent = typeof metadata.agent === "string" ? metadata.agent : "unknown-agent"
    const type = typeof metadata.type === "string" ? metadata.type : "memory"

    return `${index + 1}. [${agent} / ${type} / ${Math.round(result.similarity * 100)}%]\n${text}`
  })

  return [
    `# Context Handoff for ${toAgent}`,
    "",
    `Query: ${request.q}`,
    "",
    "## Relevant Local Memories",
    "",
    memories.length === 0 ? "No matching memories found." : memories.join("\n\n"),
    "",
    "## Instructions",
    "",
    "Use this as repo-local context from other agents. Verify against the code before editing."
  ].join("\n")
})
