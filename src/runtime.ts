import { Layer } from "effect"
import { ConfigLive } from "./config.js"
import { SupermemoryLive } from "./supermemory.js"

export const AppLive = Layer.merge(ConfigLive, Layer.provide(SupermemoryLive, ConfigLive))
