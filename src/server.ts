import { Effect, Schema } from "effect"
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { AppConfig, type AppConfigShape } from "./config.js"
import { AddMemoryRequest, ApiError, SearchRequest } from "./domain.js"
import { createHandoff } from "./handoff.js"
import { makeRepoScope } from "./scope.js"
import { indexHtml } from "./static.js"
import { SupermemoryClient, type SupermemoryClientShape } from "./supermemory.js"

const decodeAddMemory = Schema.decodeUnknownEffect(AddMemoryRequest)
const decodeSearch = Schema.decodeUnknownEffect(SearchRequest)

const readBody = (request: IncomingMessage) =>
  Effect.callback<string, ApiError>((resume) => {
    let body = ""

    request.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8")
    })

    request.on("end", () => resume(Effect.succeed(body)))
    request.on("error", (error: Error) => resume(Effect.fail(ApiError.make({ status: 400, message: error.message }))))
  })

const parseBody = (request: IncomingMessage) =>
  Effect.gen(function*() {
    const body = yield* readBody(request)
    const parsed: unknown = yield* Effect.try({
      try: () => body.length === 0 ? {} : JSON.parse(body),
      catch: (error) => ApiError.make({ status: 400, message: String(error) })
    })
    return parsed
  })

const sendJson = (response: ServerResponse, status: number, body: unknown) =>
  Effect.sync(() => {
    response.writeHead(status, { "Content-Type": "application/json" })
    response.end(JSON.stringify(body, null, 2))
  })

const sendText = (response: ServerResponse, status: number, body: string, contentType = "text/plain") =>
  Effect.sync(() => {
    response.writeHead(status, { "Content-Type": contentType })
    response.end(body)
  })

const handleRequest = (
  config: AppConfigShape,
  client: SupermemoryClientShape,
  request: IncomingMessage,
  response: ServerResponse
) =>
  Effect.gen(function*() {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`)

    if (request.method === "GET" && requestUrl.pathname === "/") {
      return yield* sendText(response, 200, indexHtml, "text/html; charset=utf-8")
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/scope") {
      return yield* sendJson(response, 200, makeRepoScope(config.defaultRepoPath))
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/memories") {
      const body = yield* parseBody(request)
      const decoded = yield* decodeAddMemory(body).pipe(
        Effect.mapError((error) => ApiError.make({ status: 400, message: String(error) }))
      )
      const stored = yield* client.addMemory(decoded).pipe(
        Effect.mapError((error) => ApiError.make({ status: error.status || 502, message: error.message }))
      )
      return yield* sendJson(response, 201, stored)
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/search") {
      const body = yield* parseBody(request)
      const decoded = yield* decodeSearch(body).pipe(
        Effect.mapError((error) => ApiError.make({ status: 400, message: String(error) }))
      )
      const results = yield* client.search(decoded).pipe(
        Effect.mapError((error) => ApiError.make({ status: error.status || 502, message: error.message }))
      )
      return yield* sendJson(response, 200, results)
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/handoff") {
      const q = requestUrl.searchParams.get("q") ?? "latest project context"
      const toAgent = requestUrl.searchParams.get("toAgent") ?? "next-agent"
      const handoff = yield* createHandoff(client, SearchRequest.make({ q, limit: 8 }), toAgent).pipe(
        Effect.mapError((error) => ApiError.make({ status: error.status || 502, message: error.message }))
      )
      return yield* sendText(response, 200, handoff, "text/markdown; charset=utf-8")
    }

    return yield* sendJson(response, 404, { error: "Not found" })
  }).pipe(
    Effect.catch((error) => sendJson(response, error.status, { error: error.message }))
  )

export const startServer = Effect.gen(function*() {
  const config = yield* AppConfig
  const client = yield* SupermemoryClient

  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    Effect.runFork(handleRequest(config, client, request, response))
  })

  yield* Effect.scoped(
    Effect.acquireRelease(
      Effect.callback<void>((resume) => {
        server.listen(config.port, () => resume(Effect.void))
      }).pipe(Effect.tap(() => Effect.logInfo(`Agent Context Bus listening on http://localhost:${config.port}`))),
      () => Effect.sync(() => server.close())
    ).pipe(Effect.flatMap(() => Effect.never))
  )
})
