import { Context, Effect, Layer, Schema } from "effect"
import { AppConfig } from "./config.js"
import {
  AddMemoryRequest,
  CreateMemoriesResponse,
  SearchRequest,
  SearchResponse,
  StoredMemory,
  SupermemoryError
} from "./domain.js"
import { makeRepoScope } from "./scope.js"

interface CreateMemoriesBody {
  readonly containerTag: string
  readonly memories: ReadonlyArray<{
    readonly content: string
    readonly isStatic: boolean
    readonly metadata: Record<string, string | number | boolean>
  }>
}

interface SearchBody {
  readonly q: string
  readonly containerTag: string
  readonly searchMode: "memories"
  readonly limit: number
  readonly filters?: {
    readonly AND: ReadonlyArray<{ readonly key: string; readonly value: string }>
  }
}

export interface SupermemoryClientShape {
  readonly addMemory: (request: AddMemoryRequest) => Effect.Effect<StoredMemory, SupermemoryError, never>
  readonly search: (request: SearchRequest) => Effect.Effect<SearchResponse, SupermemoryError, never>
}

export class SupermemoryClient extends Context.Service<SupermemoryClient, SupermemoryClientShape>()("SupermemoryClient") {}

const parseJson = (response: Response) =>
  Effect.tryPromise({
    try: async () => {
      const parsed: unknown = await response.json()
      return parsed
    },
    catch: (error) => SupermemoryError.make({ status: response.status, message: String(error) })
  })

const decodeCreatedMemories = Schema.decodeUnknownEffect(CreateMemoriesResponse)
const decodeSearch = Schema.decodeUnknownEffect(SearchResponse)

const requestJson = Effect.fn("Supermemory.requestJson")(function*(
  config: { readonly supermemoryApiKey: string; readonly supermemoryApiUrl: string },
  path: string,
  body: CreateMemoriesBody | SearchBody
) {
  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(`${config.supermemoryApiUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.supermemoryApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }),
    catch: (error) => SupermemoryError.make({ status: 0, message: String(error) })
  })

  if (!response.ok) {
    const message = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (error) => SupermemoryError.make({ status: response.status, message: String(error) })
    })

    return yield* Effect.fail(SupermemoryError.make({ status: response.status, message }))
  }

  return yield* parseJson(response)
})

export const SupermemoryLive = Layer.effect(
  SupermemoryClient,
  Effect.gen(function*() {
    const config = yield* AppConfig

    const addMemory = Effect.fn("Supermemory.addMemory")(function*(request: AddMemoryRequest) {
      const scope = makeRepoScope(request.repoPath ?? config.defaultRepoPath)
      const type = request.type ?? "conversation"
      const title = request.title ?? `${request.agent} ${type}`
      const customId = request.customId ?? `${scope.containerTag}:${request.agent}:${type}:${Date.now()}`

      const body: CreateMemoriesBody = {
        containerTag: scope.containerTag,
        memories: [{
          content: `# ${title}\n\n${request.content}`,
          isStatic: type === "architecture" || type === "project-config" || type === "preference",
          metadata: {
            agent: request.agent,
            type,
            repoPath: scope.repoPath,
            source: "agent-context-bus",
            title,
            customId
          }
        }]
      }

      const json = yield* requestJson(config, "/v4/memories", body)
      const decoded = yield* decodeCreatedMemories(json).pipe(
        Effect.mapError((error) => SupermemoryError.make({ status: 502, message: String(error) }))
      )
      const created = decoded.memories[0]

      if (created === undefined) {
        return yield* Effect.fail(SupermemoryError.make({ status: 502, message: "Supermemory created no memories" }))
      }

      return {
        id: created.id,
        status: "stored",
        containerTag: scope.containerTag
      }
    })

    const search = Effect.fn("Supermemory.search")(function*(request: SearchRequest) {
      const scope = makeRepoScope(request.repoPath ?? config.defaultRepoPath)
      const limit = request.limit ?? 8
      const body: SearchBody = {
        q: request.q,
        containerTag: scope.containerTag,
        searchMode: "memories",
        limit
      }

      const filteredBody: SearchBody = request.agent === undefined
        ? body
        : {
            ...body,
            filters: {
              AND: [{ key: "agent", value: request.agent }]
            }
          }

      const json = yield* requestJson(config, "/v4/search", filteredBody)

      return yield* decodeSearch(json).pipe(
        Effect.mapError((error) => SupermemoryError.make({ status: 502, message: String(error) }))
      )
    })

    return { addMemory, search }
  })
)
