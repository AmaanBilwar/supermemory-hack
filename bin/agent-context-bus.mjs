#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const tsxCli = resolve(packageRoot, "node_modules/tsx/dist/cli.mjs")
const cli = resolve(packageRoot, "src/cli.ts")
const result = spawnSync(process.execPath, [tsxCli, cli, ...process.argv.slice(2)], {
  stdio: "inherit"
})

process.exitCode = result.status ?? 1
