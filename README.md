# Agent Context Bus

Local, private handoff memory for coding agents, built on Supermemory Local at `localhost:6767`.

## Pitch

One brain, many agents. Claude Code, Codex, OpenCode, and other coding agents can write to the same repo-scoped memory space, search it, and generate Markdown handoffs without leaking codebase context to a cloud memory service.

## MVP

- Repo-scoped `containerTag` derived from the current working directory.
- Agent-origin metadata on every memory.
- Add, search, and handoff API routes.
- Static glass-box UI for quick demo use.
- Effect services/layers for config, Supermemory API access, and HTTP runtime.

## Setup

1. Start Supermemory Local:

```bash
npx supermemory local
```

2. Copy env vars:

```bash
cp .env.example .env
```

3. Set `SUPERMEMORY_API_KEY` to the local key printed by Supermemory.

4. Install dependencies:

```bash
npm install
```

5. Start the context bus:

```bash
npm run dev
```

Open `http://localhost:8787`.

## API

### Add Memory

```bash
curl -X POST http://localhost:8787/api/memories \
  -H 'Content-Type: application/json' \
  -d '{
    "agent": "claude-code",
    "type": "error-solution",
    "content": "Auth token bug comes from concurrent refresh() calls racing.",
    "repoPath": "/home/amaan/code/supermem-hack"
  }'
```

### Search

```bash
curl -X POST http://localhost:8787/api/search \
  -H 'Content-Type: application/json' \
  -d '{"q":"auth token bug", "limit": 5}'
```

### Handoff

```bash
curl 'http://localhost:8787/api/handoff?q=auth%20token%20bug&toAgent=codex'
```

## Supermemory Docs Used

- Self-hosting quickstart: https://supermemory.ai/docs/self-hosting/quickstart
- Add memories: https://supermemory.ai/docs/add-memories
- Search: https://supermemory.ai/docs/search
- Claude Code plugin: https://supermemory.ai/docs/integrations/claude-code
- Codex plugin: https://supermemory.ai/docs/integrations/codex
- OpenCode plugin: https://supermemory.ai/docs/integrations/opencode

## Why This Is Localhost:6767-Native

The value is not just persistent memory. It is safe shared context across local coding agents, scoped by repo, inspectable by the developer, and portable as plain Markdown handoffs.
