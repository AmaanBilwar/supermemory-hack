import { Context, Effect, Layer } from "effect"
import { ConfigError } from "./domain.js"

export interface AppConfigShape {
  readonly supermemoryApiKey: string
  readonly supermemoryApiUrl: string
  readonly port: number
  readonly defaultRepoPath: string
}

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()("AppConfig") {}

const readEnv = Effect.fn("Config.readEnv")(function*(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback

  if (value === undefined || value.length === 0) {
    return yield* Effect.fail(ConfigError.make({ message: `Missing required env var: ${name}` }))
  }

  return value
})

export const ConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function*() {
    const supermemoryApiKey = yield* readEnv("SUPERMEMORY_API_KEY", "local")
    const supermemoryApiUrl = yield* readEnv("SUPERMEMORY_API_URL", "http://localhost:6767")
    const rawPort = yield* readEnv("PORT", "8787")
    const port = Number.parseInt(rawPort, 10)

    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      return yield* Effect.fail(ConfigError.make({ message: `Invalid PORT: ${rawPort}` }))
    }

    return {
      supermemoryApiKey,
      supermemoryApiUrl,
      port,
      defaultRepoPath: process.cwd()
    }
  })
)
