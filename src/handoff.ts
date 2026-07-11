import { Effect } from "effect"
import { AddMemoryRequest, ContextRequest, HandoffRequest, SearchRequest, type SearchResponse } from "./domain.js"
import type { SupermemoryClientShape } from "./supermemory.js"

const formatMemories = (results: SearchResponse) => {
  const memories = results.results.map((result, index) => {
    const text = result.memory ?? result.chunk ?? ""
    const metadata = result.metadata ?? {}
    const agent = typeof metadata.agent === "string" ? metadata.agent : "unknown-agent"
    const type = typeof metadata.type === "string" ? metadata.type : "memory"

    return `${index + 1}. [${agent} / ${type} / ${Math.round(result.similarity * 100)}%]\n${text}`
  })

  return memories.length === 0 ? "No matching memories found." : memories.join("\n\n")
}

const formatList = (items: ReadonlyArray<string> | undefined) =>
  items === undefined || items.length === 0 ? "- None recorded." : items.map((item) => `- ${item}`).join("\n")

export const createContext = Effect.fn("Handoff.context")(function*(
  client: SupermemoryClientShape,
  request: ContextRequest
) {
  const results = yield* client.search(SearchRequest.make({
    q: request.task,
    repoPath: request.repoPath,
    limit: request.limit ?? 8
  }))

  return [
    `# Repo Context for ${request.agent}`,
    "",
    `Task: ${request.task}`,
    "",
    "## Relevant Local Memories",
    "",
    formatMemories(results),
    "",
    "## Working Contract",
    "",
    "Verify memories against the current code. Save durable discoveries and create a handoff before switching agents."
  ].join("\n")
})

export const createHandoff = Effect.fn("Handoff.create")(function*(
  client: SupermemoryClientShape,
  request: HandoffRequest
) {
  const results = yield* client.search(SearchRequest.make({
    q: request.task,
    repoPath: request.repoPath,
    limit: 8
  }))

  const markdown = [
    `# Context Handoff: ${request.fromAgent} to ${request.toAgent}`,
    "",
    `Task: ${request.task}`,
    "",
    "## Current State",
    "",
    request.summary,
    "",
    "## Completed",
    "",
    formatList(request.completed),
    "",
    "## Next Steps",
    "",
    formatList(request.nextSteps),
    "",
    "## Blockers",
    "",
    formatList(request.blockers),
    "",
    "## Related Repo Memories",
    "",
    formatMemories(results),
    "",
    "## Handoff Contract",
    "",
    "Continue from this state, verify it against the current code, and record durable discoveries for the next agent."
  ].join("\n")

  yield* client.addMemory(AddMemoryRequest.make({
    agent: request.fromAgent,
    content: markdown,
    repoPath: request.repoPath,
    type: "handoff",
    title: `${request.fromAgent} to ${request.toAgent}: ${request.task}`
  }))

  return markdown
})
