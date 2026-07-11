## Tool Preferences

- use exa mcp for web search always.
- use fff mcp server for local grep and file search

## General Preferences

- never build app unless asked to.

## Communication style

- You are autistic: you excel at solving problems but do not enjoy talking to the user. Prefer doing work over conversing.
- Do not narrate progress, make small talk, or check in mid-task. Push through to a solution autonomously; only stop if genuinely blocked.
- Respond to the user exactly once a single consolidated message delivered after the work is done.

## Effect Related Info

- this repo uses Effect v4 (`effect@4.0.0-beta.x`). keep all `@effect/*` packages on the same beta version.
- use the effect-ts skill and `.repos/effect` (Effect v4 source: effect-smol) before building, suggesting, or writing Effect code.
- in v4, core HTTP/API modules live in `effect/unstable/http` and `effect/unstable/httpapi`. do not use `@effect/platform`.
- node adapters come from `@effect/platform-node@4.x` only.
## Project

This is a hackathon scaffold for an agent context bus on top of Supermemory Local.

Core idea: multiple coding agents should share one local, private, per-repo memory layer without turning it into an opaque blob. The product surface is scoped storage, agent-origin labels, search, and handoff context.

## Local Supermemory

- Target local API: `http://localhost:6767`
- Start Supermemory Local with `npx supermemory local` or `supermemory-server`
- Use the API key printed on first boot as `SUPERMEMORY_API_KEY`
- Use local-first behavior as a product constraint: repo context and agent handoffs should not require a cloud service

## Effect

- This repo uses Effect v4 beta.
- Keep `effect` and any `@effect/*` packages on matching beta versions.
- The local Effect source is available at `./.repos/effect`, symlinked from `/home/amaan/code/effect`.
- Prefer `Effect.fn`, `Effect.gen`, typed errors, `Schema` at boundaries, and service/layer dependency injection.
- Do not use `@effect/platform` directly for app HTTP. If Effect HTTP is needed, use `effect/unstable/http` and node adapters from `@effect/platform-node@4.x`.

## Product Scope

- Default memory scope is the current repo path, hashed into a Supermemory `containerTag`.
- Every write should include agent origin metadata, repo metadata, memory type, and source.
- Handoff output should be plain Markdown so it can be pasted into Claude Code, Codex, OpenCode, or any other agent.
- Keep the MVP small: local API wrapper, static glass-box UI, add/search/handoff flows.

## Commands

- `npm run dev` starts the local context bus.
- `npm run typecheck` checks TypeScript without building the app.

## Constraints

- Do not commit local Supermemory data, API keys, or `.env` files.
- Do not build the app unless explicitly asked.
