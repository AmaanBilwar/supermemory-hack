export const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agent Context Bus</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #09090b; color: #f4f4f5; }
      body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 20% 0%, #1f2937 0, transparent 30rem), #09090b; }
      main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
      header { display: grid; gap: 12px; margin-bottom: 32px; }
      h1 { font-size: clamp(36px, 7vw, 76px); line-height: .9; letter-spacing: -0.06em; margin: 0; }
      p { color: #a1a1aa; max-width: 720px; font-size: 18px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .card { border: 1px solid #27272a; border-radius: 24px; padding: 20px; background: color-mix(in oklab, #18181b 82%, transparent); box-shadow: 0 20px 80px rgb(0 0 0 / 0.25); }
      label { display: block; color: #d4d4d8; font-size: 13px; margin: 12px 0 6px; }
      input, select, textarea, button { width: 100%; box-sizing: border-box; border-radius: 14px; border: 1px solid #3f3f46; background: #0f0f12; color: #fafafa; padding: 12px 14px; font: inherit; }
      textarea { min-height: 132px; resize: vertical; }
      button { margin-top: 14px; border: 0; background: #f4f4f5; color: #09090b; font-weight: 700; cursor: pointer; }
      pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #050507; border: 1px solid #27272a; border-radius: 18px; padding: 16px; min-height: 120px; }
      .pill { display: inline-flex; gap: 8px; border: 1px solid #3f3f46; border-radius: 999px; padding: 8px 12px; color: #d4d4d8; font-size: 13px; }
      @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } main { padding-top: 28px; } }
    </style>
  </head>
  <body>
    <main>
      <header>
        <span class="pill">localhost:8787 → localhost:6767</span>
        <h1>One local brain for coding agents.</h1>
        <p>Store discoveries from Claude Code, Codex, OpenCode, or manual notes into a repo-scoped Supermemory container. Search it and generate handoffs without leaving your machine.</p>
      </header>
      <section class="grid">
        <form class="card" id="add-form">
          <h2>Add Memory</h2>
          <label>Agent</label>
          <select name="agent"><option>claude-code</option><option>codex</option><option>opencode</option><option>opencode-agent</option><option>manual</option></select>
          <label>Type</label>
          <select name="type"><option>error-solution</option><option>architecture</option><option>project-config</option><option>learned-pattern</option><option>preference</option><option>conversation</option><option>handoff</option></select>
          <label>Title</label>
          <input name="title" placeholder="Auth refresh race" />
          <label>Content</label>
          <textarea name="content" placeholder="What should future agents know?"></textarea>
          <button>Add to local memory</button>
        </form>
        <form class="card" id="search-form">
          <h2>Search / Handoff</h2>
          <label>Current agent</label>
          <input name="fromAgent" value="manual" />
          <label>Query</label>
          <input name="q" placeholder="auth token bug" />
          <label>Target agent for handoff</label>
          <select name="toAgent"><option>codex</option><option>claude-code</option><option>opencode</option><option>manual</option></select>
          <label>Current state</label>
          <textarea name="summary" placeholder="What was discovered and what remains?"></textarea>
          <button name="mode" value="search">Search</button>
          <button name="mode" value="context">Get task context</button>
          <button name="mode" value="handoff">Generate handoff</button>
        </form>
      </section>
      <section class="card" style="margin-top:16px">
        <h2>Output</h2>
        <pre id="output">Loading scope…</pre>
      </section>
    </main>
    <script>
      const output = document.querySelector('#output')
      const show = (value) => { output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2) }
      fetch('/api/scope').then((r) => r.json()).then(show).catch((error) => show(String(error)))
      document.querySelector('#add-form').addEventListener('submit', async (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const body = Object.fromEntries(form.entries())
        const response = await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        show(await response.json())
      })
      document.querySelector('#search-form').addEventListener('submit', async (event) => {
        event.preventDefault()
        const submitter = event.submitter
        const form = new FormData(event.currentTarget)
        const mode = submitter ? submitter.value : 'search'
        if (mode === 'handoff') {
          const response = await fetch('/api/handoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromAgent: form.get('fromAgent'),
              toAgent: form.get('toAgent'),
              task: form.get('q'),
              summary: form.get('summary')
            })
          })
          show(await response.text())
        } else if (mode === 'context') {
          const response = await fetch('/api/context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent: form.get('fromAgent'), task: form.get('q') })
          })
          show(await response.text())
        } else {
          const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: form.get('q') }) })
          show(await response.json())
        }
      })
    </script>
  </body>
</html>`
