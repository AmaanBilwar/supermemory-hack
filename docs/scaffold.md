# MVP Architecture

## Product Boundary

Agent Context Bus is an API-first wiring layer, not another memory database.

Supermemory Local owns:

- Local memory embeddings and persistence.
- Semantic memory search.
- Local persistence at `localhost:6767`.

Agent Context Bus owns:

- Stable repo scoping.
- Agent-origin metadata.
- Start-of-task context formatting.
- Cross-agent handoff storage and Markdown output.
- Agent instruction and skill installation.

## Interfaces

- `agent-context-bus init` installs `AGENTS.md` instructions and skills.
- `agent-context-bus dev` starts the local API and inspector.
- `agent-context-bus context` retrieves task-specific Markdown context.
- `agent-context-bus remember` stores durable knowledge.
- `agent-context-bus search` performs explicit semantic search.
- `agent-context-bus handoff` stores and prints a portable handoff.

The CLI is implemented with Effect v4's `effect/unstable/cli`. Command parsing, help, validation, versions, and shell completions come from Effect rather than custom parsing.

## HTTP API

- `GET /api/scope`
- `POST /api/context`
- `POST /api/memories`
- `POST /api/search`
- `POST /api/handoff`

## Supermemory Mapping

- Isolation: `containerTag = agent-bus_repo_<sha256-12>`
- Agent provenance: `metadata.agent`
- Memory kind: `metadata.type`
- Repository: `metadata.repoPath`
- Producer: `metadata.source = "agent-context-bus"`

Every write and search includes the same repo `containerTag`. Writes use `/v4/memories`, bypassing Supermemory's LLM-powered ingestion pipeline. Searches use `searchMode = "memories"`. A handoff is both returned as Markdown and persisted with `type = "handoff"`.

The coding agent is the only reasoning model. Supermemory does not summarize or transform agent output in this architecture.

## Existing Integrations

Claude Code, Codex, and OpenCode already have Supermemory plugins. They can coexist with this bus, but their default prefixes and capture behavior are not the cross-agent protocol. The MVP uses explicit generated skills so every shell-capable agent can participate consistently.

Supermemory's documented MCP server is hosted and supplies generic `memory`, `recall`, and `context` tools. A future local MCP adapter should expose this MVP's `context`, `remember`, `search`, and `handoff` operations while retaining Supermemory Local as the backend.

## Demo

1. Start Supermemory Local.
2. Run `agent-context-bus init` and `agent-context-bus dev`.
3. Claude Code saves a debugging discovery.
4. Codex requests task context and sees the Claude-origin memory.
5. Codex completes part of the task and creates a handoff to OpenCode.
6. Show the inspector and Supermemory request metadata proving local repo scope and provenance.

## Next Steps

- Package and publish the npx command.
- Add a local MCP transport over the same core operations.
- Add list and forget operations.
- Add optional native hooks that invoke context and handoff automatically.
- Add contradiction review without hiding the source memories.
