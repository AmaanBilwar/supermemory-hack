# Agent Context Bus

Local, repo-scoped context and handoffs for coding agents, powered by Supermemory Local and Effect v4.

Coding agents produce distilled memories and Markdown handoffs. Supermemory supplies local embeddings, storage, and semantic search. Agent Context Bus supplies the missing cross-agent protocol: consistent repo scope, agent provenance, task context, and durable Markdown handoffs.

## Product Flow

```text
Claude Code / Codex / OpenCode / any shell-capable agent
                         |
              agent-context-bus CLI
                         |
              localhost:8787 API
                         |
          Supermemory Local localhost:6767
```

The web page at `localhost:8787` is only a glass-box inspector. The CLI and local API are the product interface used by agents.

## Quickstart

1. Install Supermemory Local:

```bash
npx supermemory local
```

The installer currently asks for an LLM even though this project does not use Supermemory's LLM extraction. Choose **Skip for now**. After installation, start the binary in embedding-only mode:

```bash
OPENAI_API_KEY=unused \
OPENAI_BASE_URL=http://127.0.0.1:9/v1 \
OPENAI_MODEL=unused \
supermemory-server
```

These placeholder values bypass Supermemory Local's global provider check. Agent Context Bus writes directly to `/v4/memories`, so the unreachable provider is never called. The only model downloaded is Supermemory's 106 MB local embedding model on first boot.

2. Configure this repo:

```bash
npm install
npm run context-bus -- init
```

`init` creates:

- A managed Agent Context Bus section in `AGENTS.md`.
- A standard skill at `.agents/skills/agent-context-bus/SKILL.md`.
- A Claude-compatible skill at `.claude/skills/agent-context-bus/SKILL.md`.
- Local scope information at `.agent-context-bus.json`.

3. Start the bus:

```bash
npm run dev
```

For an installed or published package, the intended interface is:

```bash
npx agent-context-bus init
npx agent-context-bus dev
```

## Agent Commands

Before substantial work:

```bash
agent-context-bus context \
  --agent claude-code \
  --task "fix concurrent auth token refresh"
```

Save a durable discovery:

```bash
agent-context-bus remember \
  --agent claude-code \
  --type error-solution \
  --content "refresh() needs a single-flight guard because callers race"
```

Search explicitly:

```bash
agent-context-bus search --query "how does token refresh work?"
```

Hand work to another agent:

```bash
agent-context-bus handoff \
  --from claude-code \
  --to codex \
  --task "fix concurrent auth token refresh" \
  --summary "Root cause confirmed in refresh(); implementation remains" \
  --completed "Added a failing concurrency test" \
  --next "Implement a shared in-flight promise" \
  --blocker "None"
```

The coding agent has already performed the reasoning. The handoff is stored directly as a memory and printed as portable Markdown; no second LLM processes it.

## Local API

### Task Context

```bash
curl -X POST http://localhost:8787/api/context \
  -H 'Content-Type: application/json' \
  -d '{"agent":"codex","task":"fix concurrent auth token refresh"}'
```

### Remember

```bash
curl -X POST http://localhost:8787/api/memories \
  -H 'Content-Type: application/json' \
  -d '{
    "agent":"claude-code",
    "type":"error-solution",
    "content":"refresh() callers race without a single-flight guard"
  }'
```

### Search

```bash
curl -X POST http://localhost:8787/api/search \
  -H 'Content-Type: application/json' \
  -d '{"q":"auth token refresh","limit":5}'
```

### Handoff

```bash
curl -X POST http://localhost:8787/api/handoff \
  -H 'Content-Type: application/json' \
  -d '{
    "fromAgent":"claude-code",
    "toAgent":"codex",
    "task":"fix concurrent auth token refresh",
    "summary":"Root cause confirmed; implementation remains",
    "completed":["Added a failing concurrency test"],
    "nextSteps":["Implement a shared in-flight promise"],
    "blockers":[]
  }'
```

## Scope and Provenance

The absolute repo path is normalized and SHA-256 hashed into a stable tag:

```text
agent-bus_repo_<12 hex characters>
```

Every direct memory includes flat Supermemory metadata:

- `agent`
- `type`
- `repoPath`
- `source: agent-context-bus`
- `title`

This means agents share repo memory without losing who produced each fact.

## Existing Supermemory Technology

This project deliberately does not rebuild Supermemory's embedding, storage, or search layer. It uses:

- Write: `POST http://localhost:6767/v4/memories`
- Search: `POST http://localhost:6767/v4/search`
- Search mode: `memories`
- Scope: `containerTag` in the request body
- Local auth: Supermemory automatically authenticates localhost requests; the bus uses `SUPERMEMORY_API_KEY=local` as a harmless placeholder

`/v4/memories` bypasses document ingestion, contextual chunking, summarization, and memory extraction. This is intentional: Claude Code, Codex, or OpenCode is the intelligence layer.

Supermemory's hosted MCP already exposes generic `memory`, `recall`, and `context` capabilities. This MVP stays local-first and adds the repo-scoped handoff protocol. A local MCP adapter can later expose the same core operations without changing the handoff model.

## Development

```bash
npm run typecheck
npm run context-bus -- --help
```

The project uses aligned `effect@4.0.0-beta.97` and `@effect/platform-node@4.0.0-beta.97`. The CLI uses Effect v4's built-in `effect/unstable/cli` command and flag parser rather than custom argument parsing. Local Effect v4 source is available through `.repos/effect`.

## References

- https://supermemory.ai/docs/self-hosting/quickstart
- https://supermemory.ai/docs/add-memories
- https://supermemory.ai/docs/search
- https://supermemory.ai/docs/supermemory-mcp/mcp
- https://supermemory.ai/docs/integrations/claude-code
- https://supermemory.ai/docs/integrations/codex
- https://supermemory.ai/docs/integrations/opencode
