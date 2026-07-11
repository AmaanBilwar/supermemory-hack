# Scaffold Notes

## Product Shape

This scaffold implements the smallest demoable version of the shared-agent memory bus:

- `POST /api/memories` stores a memory as a Supermemory document with repo and agent metadata.
- `POST /api/search` searches the current repo container with hybrid search.
- `GET /api/handoff` turns search results into a pasteable Markdown handoff for the next agent.
- `GET /api/scope` shows the current repo scope and derived Supermemory container tag.

## Supermemory Mapping

- Isolation boundary: `containerTag`
- Current convention: `agent-bus_repo_<sha256-12>`
- Agent label: `metadata.agent`
- Memory type: `metadata.type`
- Repo path: `metadata.repoPath`
- Source: `metadata.source = "agent-context-bus"`

This avoids requiring Supermemory plugin internals to agree on scoping. The bus can coexist with Claude Code, Codex, and OpenCode plugins while offering a shared explicit layer.

## Hackathon Demo Path

1. Start Supermemory Local on `localhost:6767`.
2. Start this app on `localhost:8787`.
3. Add a memory as `claude-code` about a real debugging discovery.
4. Search or generate handoff as `codex`.
5. Show the UI proving the memory is local, repo-scoped, and agent-labeled.

## Next Build Steps

- Add plugin-specific importers for Claude/Codex/OpenCode logs.
- Add pin/forget actions against Supermemory memory IDs.
- Add contradiction review by grouping memories with similar topics but conflicting claims.
- Add a tiny CLI wrapper: `agent-bus remember`, `agent-bus search`, `agent-bus handoff`.
