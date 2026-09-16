#!/usr/bin/env node
/**
 * Runs after `npm install @7edge/auth-client`.
 *
 *   1. scaffolds src/auth/ — mandatory, additive, no question asked
 *   2. hands over to `auth-client setup` for the steps that need consent
 *
 * Step 2 has to work from inside `npm install`, and npm makes that awkward:
 * lifecycle scripts get piped stdio, so `process.stdin` is not a terminal and
 * anything on stdout is hidden. The way through is the controlling terminal,
 * /dev/tty, which is still the user's real terminal.
 *
 * Crucially the prompt runs in a CHILD process with those fds as its stdio,
 * not in this one. Two reasons:
 *
 *   · the child's `process.stdin` is then a genuine tty.ReadStream — isTTY
 *     true, raw mode available — so readline behaves normally. Reading
 *     /dev/tty through an fs stream in *this* process does not: readline gets
 *     no terminal control and never sees the keystrokes.
 *   · spawnSync blocks this process, and with it npm's event loop, so npm's
 *     progress bar cannot redraw over the question while it is on screen.
 *
 * Rules this hook holds itself to:
 *  - It NEVER fails the install. Any error is swallowed, exit code is 0.
 *  - It never overwrites; existing files are left alone, backups come first.
 *  - It never blocks forever: the prompt is killed after PROMPT_TIMEOUT_MS and
 *    unanswered steps stay pending for `npx auth-client setup` to resume.
 *  - It does nothing when there is no consuming project, and never prompts in
 *    CI or when there is no terminal.
 */

import { existsSync, writeFileSync, openSync, closeSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scaffoldAuth, recordStep, stepStatus, clearNote, TEMPLATES, ENV_KEY, pkg } from './scaffold.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const project = process.env.INIT_CWD
const tag = `[${pkg.name}]`

/** Generous — someone is reading two questions — but not unbounded. */
const PROMPT_TIMEOUT_MS = 120_000

function stop(reason) {
  if (process.env.AUTH_CLIENT_DEBUG) console.log(`${tag} skipped: ${reason}`)
  process.exit(0)
}

/** Environments where prompting is impossible or unwelcome. */
function promptingDisabled() {
  if (process.env.AUTH_CLIENT_NO_PROMPT) return 'AUTH_CLIENT_NO_PROMPT is set'
  if (process.env.CI) return 'CI is set'
  return null
}

/**
 * Runs `auth-client setup` against the controlling terminal.
 * @returns {boolean} whether it got to ask anything at all
 */
function runSetup() {
  if (promptingDisabled()) return false

  let fdIn
  let fdOut
  try {
    fdIn = openSync('/dev/tty', 'r')
    fdOut = openSync('/dev/tty', 'w')
  } catch {
    return false // no controlling terminal: CI, a Docker build, piped output
  }

  try {
    const result = spawnSync(
      process.execPath,
      [join(HERE, 'auth-client.mjs'), 'setup', '--from-install'],
      { stdio: [fdIn, fdOut, fdOut], timeout: PROMPT_TIMEOUT_MS, env: { ...process.env, INIT_CWD: project } }
    )
    return result.status === 0
  } finally {
    closeSync(fdIn)
    closeSync(fdOut)
  }
}

/**
 * npm hides postinstall output, and there may be no terminal to write to, so
 * whatever is left is also recorded in the project as a file. Rewritten every
 * install so it always describes the *current* remaining work, and removed
 * once there is none.
 */
function writeNote(status) {
  const pending = ['env', 'wire'].filter((step) => status[step] === 'pending')
  if (!pending.length) {
    clearNote({ project })
    return
  }

  const describe = {
    env: `  · .env         add ${ENV_KEY}                  — npx auth-client env`,
    wire: '  · app wiring   replace src/main.jsx + App.jsx  — npx auth-client wire',
  }

  writeFileSync(join(project, 'src', 'auth', 'NEXT-STEPS.txt'), [
    `${pkg.name} v${pkg.version}`,
    '',
    'src/auth/ is in place. Still to do:',
    '',
    ...pending.map((step) => describe[step]),
    '',
    'Run this to be walked through what is left:',
    '',
    '    npx auth-client setup',
    '',
    'It asks before each step and prints the manual equivalent if you decline.',
    'Undo the app wiring at any time with:  npx auth-client undo',
    '',
    'Delete this file once you are set up.',
    '',
  ].join('\n'))
}

try {
  if (!project) stop('no INIT_CWD (not a user-initiated install)')
  if (resolve(project) === resolve(join(TEMPLATES, '../..'))) stop('installing our own dependencies')
  if (project.split(sep).includes('node_modules')) stop('transitive install')
  if (!existsSync(join(project, 'package.json'))) stop('no package.json in INIT_CWD')
  if (!existsSync(TEMPLATES)) stop('build output not found')

  // ── step 1 ───────────────────────────────────────────────────────────────
  scaffoldAuth({ project })
  recordStep({ project, step: 'auth', status: 'done' })

  const before = stepStatus({ project })
  const outstanding = ['env', 'wire'].some((step) => before[step] === 'pending')

  // ── steps 2 and 3, on the user's terminal ────────────────────────────────
  const asked = outstanding ? runSetup() : false

  if (!asked) {
    console.log(`\n${tag} scaffolded src/auth/`)
    if (outstanding) {
      const why = promptingDisabled() ?? 'no terminal attached'
      console.log(`${tag} ${why} — run: npx auth-client setup\n`)
    } else {
      console.log(`${tag} setup complete\n`)
    }
  }

  writeNote(stepStatus({ project }))
  process.exit(0)
} catch (error) {
  console.log(`\n${tag} could not finish automatically (${error.message}).`)
  console.log(`${tag} run: npx auth-client setup\n`)
  process.exit(0)
}
