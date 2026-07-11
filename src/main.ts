import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import { Effect } from "effect"
import { AppLive } from "./runtime.js"
import { startServer } from "./server.js"

try {
  process.loadEnvFile()
} catch {
  // Environment variables may already be provided by the caller.
}

NodeRuntime.runMain(Effect.provide(startServer, AppLive))
