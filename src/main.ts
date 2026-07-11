import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import { Effect, Layer } from "effect"
import { ConfigLive } from "./config.js"
import { startServer } from "./server.js"
import { SupermemoryLive } from "./supermemory.js"

const AppLive = Layer.merge(ConfigLive, Layer.provide(SupermemoryLive, ConfigLive))

NodeRuntime.runMain(Effect.provide(startServer, AppLive))
