/**
 * Asking yes/no, in two environments that need different renderers.
 *
 * Run normally — `npx auth-client setup` — the terminal is ours, and
 * @clack/prompts gives a properly nice prompt: arrow keys, a highlighted
 * default, Ctrl+C handling, correct cursor bookkeeping.
 *
 * Run from inside `npm install`, it is not ours. npm repaints the cursor's
 * line about 40 times a second while a lifecycle script runs — measured at 320
 * redraws over 8 seconds — as `\r`, the progress bar, then
 * clear-to-end-of-line. Anything on that line is erased, and that includes a
 * clack frame: rendered under npm, the message is wiped and only its `◆`
 * gutter survives.
 *
 * So there is a second, deliberately primitive renderer for that case. It
 * prints the question and leaves the cursor on the NEXT line. npm only ever
 * writes at column 0 of the cursor's line and never moves vertically, so its
 * bar is confined to that one throwaway line while the question sits untouched
 * above it. The answer is a single unechoed keypress, so nothing of ours is
 * ever on npm's line; afterwards the cursor steps back up and rewrites the
 * question with the answer.
 *
 * Both return `true` / `false` / `null`, where null means *unanswered* — no
 * terminal, or the user cancelled. Callers treat that differently from a "no":
 * an unanswered step stays pending so the next run resumes at it.
 *
 * Neither renderer gives up on its own. The prompt waits for as long as it
 * takes; Ctrl+C is how you leave it.
 */

import { confirm as clackConfirm, isCancel } from '@clack/prompts'

/**
 * Is npm's progress bar going to repaint the cursor's line while we prompt?
 *
 * `--no-progress` (or `progress=false`) sets npm_config_progress in a script's
 * environment; without it the bar is live. With the bar off there is nothing to
 * fight, so the good-looking renderer can be used even during an install.
 */
export function npmBarActive() {
  if ('npm_config_progress' in process.env && process.env.npm_config_progress !== 'true') return false
  return true
}

/**
 * Set when the user cancels (Ctrl+C / Esc). Once they have said "not now",
 * the remaining questions are not worth asking.
 *
 * There is deliberately no time limit on an answer: a prompt that gives up on
 * its own is worse than one that waits, and Ctrl+C is always available.
 */
let abandoned = false
export const wasAbandoned = () => abandoned

const dim = (s) => `\x1b[2m${s}\x1b[0m`
const cyan = (s) => `\x1b[36m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`

/** The npm-install renderer: question on its own line, unechoed keypress. */
async function keypressConfirm(question, def) {
  const { stdin, stdout } = process
  const hint = dim(def ? '(Y/n)' : '(y/N)')
  stdout.write(`\n  ${question} ${hint}\n`)

  const key = await new Promise((resolve) => {
    const onData = (chunk) => {
      stdin.off('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
      resolve(chunk.toString('utf8'))
    }
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
  })

  // Reclaim the question's line from whatever npm has drawn over it since.
  const restate = (answer) => stdout.write(`\x1b[1A\r\x1b[2K  ${question} ${answer}\n\r\x1b[2K`)

  if (key === '\x03' || key === '\x04' || key === '\x1b') {
    abandoned = true
    restate(yellow('cancelled'))
    return null
  }

  const yes = /^[\r\n]/.test(key) ? def : /^y/i.test(key)
  restate(cyan(yes ? 'yes' : 'no'))
  return yes
}

/** The normal renderer. */
async function fancyConfirm(question, def) {
  const answer = await clackConfirm({ message: question, initialValue: def })
  if (isCancel(answer)) {
    abandoned = true
    return null
  }
  return answer
}

/**
 * @param {string} question
 * @param {{ def?: boolean, plain?: boolean, auto?: boolean }} options
 *   `plain` selects the npm-install renderer; `auto` answers yes without asking.
 * @returns {Promise<boolean|null>}
 */
export async function confirm(question, { def = true, plain = false, auto = false } = {}) {
  if (auto) return true

  const { stdin, stdout } = process
  if (!stdin.isTTY || !stdout.isTTY) {
    console.log(`  ${yellow('·')} not a terminal — skipping "${question}"`)
    return null
  }
  if (abandoned) return null

  return plain ? keypressConfirm(question, def) : fancyConfirm(question, def)
}
