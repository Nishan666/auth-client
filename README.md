# @7edge/auth-client

Plug-and-play frontend authentication. Install it, call `login()` / `logout()` —
no Redux, no required UI, no backend wiring beyond a base URL.

**Everything exports from one entry point.**

```js
import {
  createAuthClient,                       // headless client
  AuthProvider, useAuth,                  // React bindings
  AuthFlow, SignIn, SignUp, OtpVerify,    // prebuilt screens
  ChangePassword, DeleteAccount,
  Button, FormField, PasswordField,       // primitives
  decodeJWT, applyTheme,                  // utilities
} from '@7edge/auth-client'
```

| Import path | What it gives you | Needs React? |
|---|---|---|
| `@7edge/auth-client` | **Everything** — client, hooks, screens | Yes |
| `@7edge/auth-client/core` | Headless client only, zero React in the graph | No |
| `@7edge/auth-client/react` | `AuthProvider` + `useAuth` (back-compat alias) | Yes |
| `@7edge/auth-client/ui` | Screens + primitives (back-compat alias) | Yes |
| `@7edge/auth-client/style.css` | Precompiled stylesheet | – |

The root entry pulls in React, so a Node script or non-React host should import
`@7edge/auth-client/core` instead.

## Contents

- [Getting started](#getting-started) — empty folder to working auth flow
- [What to test](#what-to-test)
- [API reference](#api-reference) — client, React, screens, theming, tokens
- [Backend contract](#backend-contract)
- [Pointing at the real API](#pointing-at-the-real-api)
- [Troubleshooting](#troubleshooting)
- [Maintaining](#maintaining) — releases, the two-repo model
- [Changelog](#changelog)

---

## Getting started

Wiring the library into a fresh app takes about two minutes. **Requires**
Node 18+, npm, and a reachable authentication API — the library talks to a real
backend and has no offline mode.

### 1. Create a Vite + React app

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```

### 2. Install the auth package

```bash
npm install github:Nishan666/auth-client --no-progress
```

That is the whole setup. The `--no-progress` is worth typing: npm otherwise
repaints the terminal line ~40 times a second for the whole install, and that
churn scrolls underneath the questions. Plain
`npm install github:Nishan666/auth-client` works identically — the questions
are just sharing the screen with npm's progress bar. The install scaffolds `src/auth/`, then asks about the
two things that touch files you own — on your actual terminal, as part of the
install:

```
  @7edge/auth-client v0.2.0

  VITE_API_BASE_URL tells the library which API to call.
  Append the auth block to your existing .env? (Y/n) y
  ✓ appended the auth block to your existing .env

  This REPLACES src/main.jsx and src/App.jsx (originals saved as .bak).
  Wire them up now? (y/N) y
  ✓ wired src/main.jsx
  ✓ wired src/App.jsx

  ╭────────────────────────────────────────────────────────────────────────╮
  │ @7edge/auth-client v0.2.0  ready                                       │
  ├────────────────────────────────────────────────────────────────────────┤
  │ What changed                                                           │
  │   ✓ src/auth/ — 19 files: screens, components, validation              │
  │   ✓ .env — auth block appended, your other keys untouched              │
  │   ✓ src/main.jsx — imports the stylesheet                              │
  │   ✓ src/App.jsx — home page: session panel, account actions            │
  │                                                                        │
  │ Next                                                                   │
  │   1  set VITE_API_BASE_URL in .env — it ships as a placeholder         │
  │   2  npm run dev                                                       │
  │                                                                        │
  │ Undo                                                                   │
  │   npx auth-client undo restores main.jsx + App.jsx from .bak           │
  │   · src/main.jsx.bak — your original, kept until you delete it         │
  │   · src/App.jsx.bak — your original, kept until you delete it          │
  │   npx auth-client status what is done and what is left                 │
  │   src/auth/ is yours — editing or deleting it breaks nothing upstream  │
  ╰────────────────────────────────────────────────────────────────────────╯
```

<details>
<summary>How it manages to ask from inside <code>npm install</code></summary>

Two problems, and the second one decides the design.

**Reaching the terminal.** npm runs lifecycle scripts with piped stdio:
`process.stdin` is not a terminal and stdout is hidden unless you pass
`--foreground-scripts`. So the hook opens `/dev/tty` — the controlling
terminal, still there regardless — and runs the prompt in a *child process*
with those file descriptors as its stdio. The child part matters: reading
`/dev/tty` through a stream in the hook's own process gives readline no
terminal control (`isTTY` undefined, no raw mode) and it silently never
receives the keystrokes, which go to npm instead.

**npm owns the cursor's line.** While a lifecycle script runs, npm repaints its
progress bar onto that line about 40 times a second — measured at **320
redraws in 8 seconds** — each one a `\r`, the bar, then clear-to-end-of-line.
Anything on that line is erased. This cannot be switched off from inside a
hook: `--foreground-scripts` does not stop it (318 redraws), `spawnSync` does
not block it, and `process.ppid` is the shell npm spawned rather than npm
itself, so there is nothing to signal.

That rules out a normal prompt library here. Rendered under npm,
`@clack/prompts` reads the answer correctly but its message is wiped — only the
`◆` gutter survives, because the message shares the repainted line.

So there are two renderers, and the *live state of the bar* picks one — not
merely "am I in an install":

| Condition | Renderer |
|---|---|
| Bar off — `npx auth-client setup`, or `npm install --no-progress` | `@clack/prompts`: arrow keys, highlighted default, proper cancel handling |
| Bar live — a plain `npm install` | a deliberately primitive one: the question is printed and the cursor left on the **next** line, so npm's bar is confined to that throwaway line while the question sits untouched above it. The answer is a single **unechoed** keypress, so nothing of ours is ever on npm's line. Afterwards the cursor steps back up and rewrites the question with the answer. |

```
  Append the auth block to your existing .env? (Y/n)
  Append the auth block to your existing .env? yes
```

That is why `--no-progress` is the documented command: with the bar off there
is nothing to fight, so you get the good prompt during the install itself.

Without the flag, the bar still churns on its own line while you decide — that
part is npm's and no package can take it back. In that mode a single keypress
means `y` and `n` act immediately, Enter takes the default, and there is nothing
to backspace.

Either way, Ctrl+C at a question changes nothing and leaves the remaining
steps pending for `npx auth-client setup`.

</details>

Every way this can fail degrades to *not asking*, never to a stuck install:

| Situation | What happens |
|---|---|
| No terminal — CI, Docker build, output piped | no prompt; the outstanding steps go in `src/auth/NEXT-STEPS.txt` |
| `CI=1` or `AUTH_CLIENT_NO_PROMPT=1` | no prompt |
| A terminal, but nobody answers | it waits. There is no time limit on an answer — Ctrl+C leaves everything untouched and the steps pending |
| `--ignore-scripts` | nothing runs at all; use `npx auth-client setup` |

Your `.env` is appended to, never replaced. `main.jsx` and `App.jsx` are copied
to `.bak` before being written, and `npx auth-client undo` puts them back.

### 3. If you skipped a step, or want to change your mind

`npx auth-client setup` is the same flow the install runs, and it **resumes**.
Every answer is recorded in `src/auth/.auth-client.json` as it is given, so
quitting at the `.env` question and coming back picks up exactly there:

```bash
npx auth-client status
```
```
  ✓ src/auth/ scaffold         done
  ✓ .env (VITE_API_BASE_URL)   done
  ○ src/main.jsx + App.jsx     pending

  Resume with npx auth-client setup
```

A step you *declined* is remembered and not asked again; `setup --all`
re-offers it. A step you never answered stays pending. The record is a
convenience, not the source of truth — delete it and state is re-derived from
the files themselves, so nothing already done runs twice.

> **Resume with `setup`, not by reinstalling.** npm only runs install hooks
> when it actually installs something. A second
> `npm install github:Nishan666/auth-client` prints `up to date` and runs
> nothing — not even with `--force`.

Each step also runs on its own:

```bash
npx auth-client env      # just the .env step
npx auth-client wire     # just the main.jsx + App.jsx step
npx auth-client undo     # restore main.jsx + App.jsx from their .bak files
npx auth-client init     # re-scaffold src/auth/  (--force to overwrite)
npx auth-client setup -y # answer yes to everything, no prompts
```

Nothing outside the above is touched. In full, a clean git tree shows exactly:

```
M  package.json        the dependency entry (npm's own doing)
M  package-lock.json   ditto
?? src/auth/           the scaffold, plus the progress record
M  .env                the auth block appended
M  src/main.jsx        wired
M  src/App.jsx         wired
?? src/main.jsx.bak    your originals — delete them once you are happy,
?? src/App.jsx.bak     nothing but `undo` reads them
```

No `.gitignore` edits, no extra dependencies, no scripts added to your
`package.json`.

### 4. Run

```bash
npm run dev
```

Open the URL it prints. You should see the sign-in screen, and after signing
in, the generated home page. Set `VITE_API_BASE_URL` in `.env` to your API
first — it ships as a `REPLACE-ME` placeholder, and Vite only reads `.env` at
startup, so restart after changing it.

---

---

## What to test

| Flow | Steps | Expected |
|---|---|---|
| Sign in | a confirmed account's email + password | lands on the dashboard — no OTP step |
| Wrong password | any wrong password | `Incorrect email/phone or password` |
| Wrong OTP | any incorrect code on sign-up or reset | `Incorrect code. N attempts remaining.` |
| Validation | submit an empty form | inline errors, no network call |
| Sign up | **Create one** → fill in → the emailed OTP | account confirmed, then sign in |
| Forgot password | **Forgot password?** → OTP → new password | can sign in with the new one |
| Persistence | reload the page while signed in | still signed in |
| Cross-tab logout | open a second tab, log out in one | the other tab signs out too |
| Phone identifier | switch to the **Phone** tab | `+11234567890` works the same |

**Customising a screen** — the point of the scaffold:

```bash
# edit any screen; it is your file
$EDITOR src/auth/screens/SignIn.jsx

# re-installing does NOT overwrite your changes
npm install github:Nishan666/auth-client
```

**Token behaviour** — open DevTools → Application → Local Storage. One key,
`auth_tokens`, holds the whole bundle:

```jsonc
{ "id_token": "…", "refresh_token": "…" }
```

The platform API issues an `idToken` and a `refreshToken` only — no
`accessToken`, `expires_in` or `session_token` — so `accessToken` on state reads
`null`. The store normalises camelCase, snake_case and nested `data.*` inputs
alike, and preserves any extra fields a deployment adds, so a richer bundle
needs no code change.

Refreshes replace the bundle atomically. Logging out clears the key.

---

---

## API reference

### 1. Headless — just call the methods

```js
import { createAuthClient } from '@7edge/auth-client/core'

const auth = createAuthClient({ baseURL: 'https://api.example.com/api' })

// Sign-in is one step — it returns the session, no OTP.
const { error, data } = await auth.login({ email, password })

// verifyOtp is for confirming a new sign-up, not for signing in.
await auth.verifyOtp({ identifier: email, otp: '123456' })

auth.getState()            // { isAuthenticated, user, idToken, accessToken, isLoading, error }
auth.subscribe(console.log) // returns an unsubscribe fn

await auth.logout()
```

Every method resolves to `{ error: false, data }` or
`{ error: true, message, status, code }` — **no try/catch required**.

#### Config

```js
createAuthClient({
  baseURL: 'https://api.example.com/api',   // required
  storage: myAdapter,         // { getItem, setItem, removeItem }; defaults to
                              // localStorage, falls back to memory for SSR
  storageKeys: { TOKENS: 'myapp_tokens', USER: 'myapp_user' },
  endpoints: { SIGN_IN: '/v2/auth/login' },   // override individual routes
  headers: { 'X-Tenant': 'acme' },            // sent on every request
  expirySkewSeconds: 30,      // refresh this long before `exp`
  crossTab: true,             // BroadcastChannel coordination
  onForceLogout: () => {},    // refresh failed — the session is gone
  onAuthStateChange: (state) => {},
})
```

#### Full method list

| Session | Tokens | State / lifecycle |
|---|---|---|
| `signUp` | `refreshToken()` | `getState` |
| `signIn` / `login` | `getTokens` | `subscribe` |
| `verifyOtp` | `getIdToken` | `clearError` |
| `resendOtp` | `getAccessToken` | `connect` / `disconnect` |
| `forgotPassword` | `getRefreshToken` | `destroy` |
| `verifyResetOtp` | `getValidToken` | |
| `resetPassword` | `expiresIn` | |
| `changePassword` | | |
| `deleteAccount` | | |
| `signOut` / `logout` | | |

> `refreshToken` is the **method**. The refresh token *value* is deliberately
> kept off React state — read it with `getRefreshToken()`.

### 2. React

```jsx
import { AuthProvider, useAuth } from '@7edge/auth-client'

function Root() {
  return (
    <AuthProvider config={{ baseURL: 'https://api.example.com/api' }}>
      <App />
    </AuthProvider>
  )
}

function App() {
  const { isAuthenticated, user, login, logout } = useAuth()
  if (!isAuthenticated) return <button onClick={() => login({ email, password })}>Sign in</button>
  return <button onClick={logout}>Log out, {user.name}</button>
}
```

Pass `<AuthProvider client={auth}>` instead of `config` to share an instance with
non-React code.

### 3. Prebuilt screens

```jsx
import { AuthProvider, useAuth, AuthFlow } from '@7edge/auth-client'
import '@7edge/auth-client/style.css'

function App() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <AuthFlow />
}
```

`<AuthFlow>` covers the whole pre-auth journey: sign in, sign up, OTP, forgot /
reset password. `ChangePassword` and `DeleteAccount` belong to an
already-authenticated area, so you render them yourself:

```jsx
<ChangePassword onSuccess={() => navigate('/settings')} onCancel={() => navigate('/settings')} />
<DeleteAccount onDeleted={() => navigate('/')} onCancel={() => navigate('/settings')} />
```

#### Styling

Neutral and minimal by design — a white card on a slate page, near-black
actions, system fonts, no gradients — so it drops into a host app without
fighting its brand.

`style.css` is precompiled; **you do not need Tailwind installed.** Tailwind's
Preflight is *disabled* and replaced by a reset scoped to `.ac-root`, so
importing it will not restyle your app.

Colours are CSS custom properties, overridable without a rebuild:

```css
.my-app { --ac-accent: 0 124 178; }   /* RGB channels, not hex */
```

```jsx
<AuthProvider theme={{ accent: '#007CB2', radius: '0.25rem' }} config={...}>
```

Tokens: `bg`, `surface`, `border`, `border-strong`, `fg`, `muted`, `subtle`,
`accent`, `accent-fg`, `accent-hover`, `danger`, `success` (+ `-surface`,
`-border` variants).

##### Editing the scaffolded components

`src/auth/components/` are your files, and their markup, structure, props and
copy are freely editable. Their **class names** come with one caveat worth
knowing before you reach for it.

Those classes are Tailwind utilities, and `style.css` ships *precompiled* —
it contains only the utilities the library itself uses. So:

| Edit | Result |
|---|---|
| Change markup, props, layout structure, copy | works |
| Swap to another class the library already uses (`bg-ac-danger`) | works |
| Add your own plain CSS and use that class | works |
| Add a **new** Tailwind utility (`bg-purple-600`) | **silently does nothing** |

The last row is the trap: nothing errors, the element just renders unstyled.
Two ways round it —

```css
/* src/auth/home.css — your file, plain CSS, always works */
.my-brand-button { background: rgb(147 51 234); }
```

...then use `my-brand-button` in `components/Button.jsx`. Or install Tailwind
in your project, at which point every utility is available and the precompiled
stylesheet becomes redundant.

For recolouring rather than restructuring, the CSS custom properties above are
the better tool — they need neither.

### 4. No offline mode

`baseURL` is required and every call goes to your API. There is no in-memory
fallback — `createAuthClient` throws if `baseURL` is missing rather than
silently sending requests to the current origin.

For local development against a backend that is not ready, run a stub that
implements the twelve routes below. `scripts/test-server.mjs` in this repo is
exactly that, and it is what the verification suite runs against.

### 5. Token handling

Modelled on the ORDO host app (`src/helpers/tokenManager.js`), so both agree on
the contract the real API will use.

- **One bundle, one key.** Persisted as a single JSON blob under `auth_tokens`,
  so a refresh swaps it atomically — no window where a new `id_token` sits
  beside a stale `refresh_token`. The deployed API returns `idToken` and
  `refreshToken` only; camelCase, snake_case and nested `data.*` inputs are all
  normalised, and unknown fields are preserved, so a deployment that adds
  `accessToken` or `expires_in` needs no code change.
- **Proactive refresh.** Requests check `exp` first and renew inside a 30s skew,
  so the request goes out valid instead of 401-ing and being retried.
- **Single-flight lock.** Concurrent callers queue behind one refresh — verified:
  8 parallel `refreshToken()` calls produce exactly **1** network round-trip and
  all receive the same new token.
- **401 retry.** A 401 that slips through (server-side revocation, clock skew)
  triggers one refresh with `bypassExpiryCheck`, then replays the request. The
  refresh endpoint and S3 pre-signed URLs are excluded — the latter reject
  requests carrying both AWS query auth and an `Authorization` header.
- **Cross-tab.** Every refresh and logout is broadcast on the `auth`
  BroadcastChannel (`token_refreshed` / `logout` / `login` / `need_refresh`),
  with `localStorage` sentinel keys as a fallback. Sibling tabs adopt the new
  bundle instead of racing their own refresh.
- **Rotation.** Refresh tokens are single-use; the previous one is revoked.

---

## Backend contract

`POST` under `baseURL` (override via `endpoints`):

`/auth/signup` · `/auth/signin` · `/auth/verify-otp` · `/auth/resend-otp` ·
`/auth/forgot-password` · `/auth/verify-reset-otp` · `/auth/reset-password` ·
`/auth/change-password` · `/auth/delete-account` · `/auth/tokens` (issue),
`/auth/refresh` · `/auth/logout`

TOTP is not implemented — sign-in/sign-up complete via email/phone OTP only.

---

## Pointing at the real API

Edit `.env` — **no code changes**:

```ini
VITE_API_BASE_URL=https://the-real-api/api
```

Restart the dev server (Vite reads `.env` at startup).

The API must expose these routes, all `POST` under the base URL:

`/auth/signup` · `/auth/signin` · `/auth/verify-otp` · `/auth/resend-otp` ·
`/auth/forgot-password` · `/auth/verify-reset-otp` · `/auth/reset-password` ·
`/auth/change-password` · `/auth/delete-account` · `/auth/tokens` ·
`/auth/refresh` · `/auth/logout`

`Authorization: Bearer <id_token>` is attached automatically to authenticated
calls. `/auth/refresh` is excluded by design and carries the refresh token in the
body instead.

Using a different bundler? Edit `src/auth/config.js`:
Create React App `process.env.REACT_APP_…`, Next.js `process.env.NEXT_PUBLIC_…`.

---

---

## Troubleshooting

**`src/auth/` was not created.** Install scripts are disabled in your
environment. Run `npx auth-client init`.

**The install did not ask me anything.** There was no terminal to ask on — CI,
a Docker build, output piped to a file — or `CI` / `AUTH_CLIENT_NO_PROMPT` is
set, or install scripts are disabled. Check `src/auth/NEXT-STEPS.txt`, then run
`npx auth-client setup`.

**The install asked, but the question was unreadable or my keys did nothing.**
Two separate bugs during 0.2.0's development, both fixed: the prompt ran in the
hook's own process (so npm got the keystrokes), and it shared a line with npm's
progress bar (so it was repainted over 40 times a second). If you still see
either, set `AUTH_CLIENT_NO_PROMPT=1` and use `npx auth-client setup` — and
please report your terminal and npm version.

**The question expects a single keypress during `npm install`.** `y` or `n`
act immediately, Enter takes the default shown in `(Y/n)`. Deliberate — see
*How it manages to ask from inside npm install*. `npx auth-client setup` uses a
normal arrow-key prompt instead.

**npm's progress bar keeps scrolling under the question.** Expected, and not
fixable from a package: npm repaints that line ~40 times a second for the whole
install. The question itself is on its own line and stays readable; just press
`y` or `n`.

**Re-installing does not resume.** npm only runs install hooks when it actually
installs something; a second `npm install github:Nishan666/auth-client` prints
`up to date` and runs nothing, `--force` included. Use
`npx auth-client setup` — it reads the same progress record and picks up where
you stopped. `npx auth-client status` shows what is outstanding.

**It asked about a step I already declined.** It should not — a declined step
is recorded. If `src/auth/.auth-client.json` was deleted, state is re-derived
from the files, and a decline is indistinguishable from never having asked.
Harmless: answer no again, or delete the file to start the questions over.

**I edited a scaffolded component and the styling vanished.** You most likely
added a Tailwind class the precompiled `style.css` does not contain. See
[Editing the scaffolded components](#editing-the-scaffolded-components) —
plain CSS in `src/auth/home.css` always works.

**I want my original `main.jsx` / `App.jsx` back.** `npx auth-client undo`
restores them from the `.bak` files `wire` wrote. If you have since deleted the
backups, copy the two files from the Getting started section.

**`setup` says "not a terminal — skipping".** You are piping it or running it
in CI, where it cannot ask. Pass `--yes` to accept every step, or run the
individual `env` / `wire` commands, which never prompt.

**Screens look unstyled.** `import '@7edge/auth-client/style.css'` is missing
from `src/main.jsx` — `npx auth-client wire` adds it.

**`useAuth() must be used within an <AuthProvider>`.** The component calling
`useAuth()` is outside the provider — the provider has to wrap it, so it cannot
call `useAuth()` itself. That is why `Root` is a separate component above.

**`Cannot find package 'react'`.** Only in a non-React host. Import
`@7edge/auth-client/core` instead — it has no React in its dependency graph.

**Library changes not showing up after reinstalling the same version.** Vite
caches pre-bundled dependencies:

```bash
rm -rf node_modules/@7edge node_modules/.vite package-lock.json
npm install
npm run dev -- --force
```

Also check nothing else is holding the port — Vite silently falls back to the
next one and you end up looking at a stale server.

---

---

## Maintaining

### Two repositories

| Repo | Contains | Who touches it |
|---|---|---|
| `AuthPlatform/auth-client` | `src/`, `bin/`, `templates/`, `scripts/`, configs, docs | maintainers — the source of truth |
| `Nishan666/auth-client` | `package.json`, `dist/`, the three `.md` files | generated; consumers install from it |

#### Why the split

**npm cannot install a package from a subdirectory of a repo.** The library used
to live at `AuthPlatform/auth-client`, which made `npm i github:…` impossible.
Verified against a repo mirroring that layout:

| Command | Result |
|---|---|
| `npm i git+…/AuthPlatform` | installs `authplatform-root` — the monorepo root, not the library |
| `npm i git+…/AuthPlatform#path:/auth-client` | **silently wrong**: reports `added 28 packages`, exits 0, installs the repo root with no `dist/`. Fails at runtime, not install time |
| `npm i git+…/AuthPlatform::auth-client` | `npm error code 128` |

With the package at a repository **root**, `npm i github:owner/repo` just works.
Consumers also get no source, no build tooling and no dev dependencies.

#### Releasing

```bash
npm run build              # js + css + templates + bin
npm run lint
npm run verify             # 28 assertions against dist/, not src/
npm run build:dist-repo    # assembles the published repo; commits nothing

cd /home/user/auth-client
git add -A && git status --short      # review
git commit -m "release @7edge/auth-client@0.2.0"
git push
git tag v0.2.0 && git push --tags     # so consumers can pin
```

`build:dist-repo` wipes everything except `.git` before copying, so deletions
propagate instead of leaving orphans.

Two things it does to the generated `package.json` that matter:

- **Strips `prepare`.** The published repo has no `src/` to build from, and npm
  runs `prepare` for git dependencies — leaving it in would fail every install.
- **Sets an explicit `files` allowlist.** Without it npm falls back to
  `.gitignore` and warns `No .npmignore file found` on every consumer's install.

`bin/` is copied to `dist/bin/`, so the whole artifact lives under `dist/`. That
is why `bin/scaffold.mjs` locates its templates by looking for them rather than
assuming a path depth — it runs from `bin/` in the source tree and `dist/bin/`
in the published repo.

#### Retargeting the GitHub owner

```bash
npm run set-repo -- <owner>/<repo>
```

Rewrites `package.json` and every install command in the docs. Run it in the
source repo, then `build:dist-repo` so the published manifest picks it up.

#### Generated vs committed

| Path | |
|---|---|
| `templates/` | **source** — hand-edit these |
| `dist/templates/` | generated from `templates/` (verbatim) + `src/ui/` (imports rewritten) |
| `dist/bin/` | copied from `bin/` |

The ejected screens are derived from `src/ui/` at build time, so what a team
ejects cannot drift from what the library ships. Never hand-edit anything under
`dist/`.

---

### Private repo access

Only relevant if the published repo is made private. **[untested — no GitHub
credentials in this environment]**

```bash
git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
```

That rewrite matters: npm **rewrites git URLs to SSH in the lockfile** — after
`npm i github:owner/repo`, `package-lock.json` recorded
`git+ssh://git@github.com/owner/repo.git#<sha>`. Later installs then need an SSH
key, a common CI break. Avoid putting a token directly in the dependency URL — it
lands in the lockfile in plain text.

---

### Publishing to an npm registry (later)

Not the current delivery path. When it is wanted:

- **`auth-client` is taken on the public npm registry** (an unrelated package,
  latest `0.4.11`), which is why this is scoped `@7edge/auth-client`.
- GitHub Packages requires the scope to match the repo owner — it would need
  `@Nishan666/auth-client`, or the repo moved to a `7edge` org.
- Azure Artifacts `_password` must be **base64 of the PAT**. Do **not** set
  `always-auth=true`; npm 11 rejects it ("Unknown project config") and sends
  credentials without it.

Both credential styles were verified against a registry that 401s without auth:
`_authToken` (Bearer) and `username`/`_password` (Basic) each installed
successfully; no credentials correctly failed `E401`.

Publishing would need `prepublishOnly` (lint + build) added back, and the
`files` allowlist to include `dist` and the docs.

---

## Changelog

### 0.2.0

#### Breaking

- **Renamed to `@7edge/auth-client`.** `auth-client` is taken on the public npm
  registry by an unrelated package (latest `0.4.11`), so it could never be
  published under that name. Scoping is also required by GitHub Packages and
  Azure Artifacts.
- **Token storage moved to a single key.** Tokens now live as one JSON bundle
  under `auth_tokens` instead of one key per token. A refresh now swaps the bundle atomically.
  `DEFAULT_STORAGE_KEYS` is `{ TOKENS, USER }`; `ID_TOKEN` / `REFRESH_TOKEN` are
  gone. **Existing sessions will not migrate — users are signed out once.**
- **`refreshToken` is no longer on state.** It was both a state field (the token
  string) and a method (renew the session), and the method silently shadowed the
  value. `refreshToken` is now unambiguously the method; read the value with
  `getRefreshToken()`. State exposes `idToken` and `accessToken` only.
- **`AuthProvider` no longer destroys the client on unmount.** It now pairs
  `connect()` / `disconnect()`, which is safe across StrictMode's
  mount → cleanup → remount. The old cleanup permanently closed the
  BroadcastChannel on the first simulated unmount.
- **`REFRESH` endpoint is `/auth/refresh`**, not `/auth/tokens`. `/auth/tokens`
  remains for `fetchTokens`. This matches the backend contract; the routes are
  now asserted in the verification suite.
- **Tailwind Preflight is no longer bundled** in `style.css`. It reset the host
  app's styles. A reset scoped to `.ac-root` replaces it.
- `ui/style.css` is now emitted at `dist/style.css`. Both
  `@7edge/auth-client/style.css` and `@7edge/auth-client/ui/style.css` resolve to it.

#### Added

- **Single entry point.** Everything — client, React bindings, screens,
  primitives, utilities — exports from `@7edge/auth-client`. The `/react` and
  `/ui` subpaths remain as aliases; `/core` is new and carries no React import,
  for Node and non-React hosts.
- **ORDO-aligned token lifecycle**, matching `easyid-facility-web-application`'s
  `src/helpers/tokenManager.js`:
  - proactive refresh inside a configurable expiry skew (default 30s)
  - a single-flight refresh lock — N concurrent 401s produce one refresh
  - cross-tab coordination over the `auth` BroadcastChannel
    (`token_refreshed` / `logout` / `login` / `need_refresh`) with
    `localStorage` sentinel fallback
  - `decodeJWT`, `isExpired`, `secondsUntilExpiry`
  - request interceptor skips the refresh endpoint and S3 pre-signed URLs
- Config: `endpoints`, `headers`, `expirySkewSeconds`, `crossTab`,
  `onAuthStateChange`.
- Client: `getTokens`, `getIdToken`, `getAccessToken`, `getRefreshToken`,
  `getValidToken`, `expiresIn`, `connect`, `disconnect`, `destroy`.
- Theming via CSS custom properties + `applyTheme()` / `resetTheme()` and an
  `AuthProvider theme` prop.
- `Alert` component, shared `validation.js`, and `inputClassName`.
- **`npx auth-client` CLI** — `setup` (interactive), plus `init`, `env`,
  `wire` and `undo` as individual steps, with `--yes`, `--force` and `--dir`.
  The ejected screens are generated *from* `src/ui/` at build time, so they
  cannot drift from what the library ships.
- **Scaffolding on install, scoped to `src/auth/`.** A `postinstall` hook
  writes the auth folder — the package's own territory — and nothing else
  without consent. It never overwrites existing files and never fails an
  install.
- **The install asks, in the same flow.** `npm install` scaffolds `src/auth/`
  and then prompts about `.env` and app wiring on the controlling terminal —
  no second command. Two things make that work: the prompt runs in a child
  process with `/dev/tty` as its stdio, so the child's `process.stdin` is a
  real TTY; and the question is printed with the cursor parked on the next
  line, with the answer read as an unechoed keypress, so npm's progress bar —
  which repaints the current line ~40 times a second — has a line of its own
  to scribble on. With the bar off — `--no-progress`, or `npx auth-client
  setup` — `@clack/prompts` is used instead, which is nicer but gets its
  message erased under npm; so the renderer follows whether the bar is
  actually live. It only asks where someone can answer: no terminal, `CI=1` or
  `AUTH_CLIENT_NO_PROMPT=1` skips the questions. Where it asks, it waits —
  there is no deadline on an answer, nothing changes without a yes, and Ctrl+C
  leaves the steps pending.
- **A closing summary.** `setup` ends with what changed, what to do next, and
  how to undo it — including which `.bak` files are waiting.
- **A fully ejected `src/auth/`.** The screens' primitives
  (`components/`), the field rules (`validation.js`) and the UI constants are
  now local files too, so `useAuth` is the only thing a generated file imports
  from the package. Restyling or restructuring no longer needs a fork. Note
  that `style.css` is precompiled: a brand-new Tailwind utility will not exist
  in it — use plain CSS or install Tailwind. See *Editing the scaffolded
  components*.
- **No config file in the project.** `authConfig` and `API_BASE_URL` moved
  into the package, at `@7edge/auth-client/config`. It ships unbundled, because
  Vite substitutes `import.meta.env` at build time and bundling it would bake
  in an empty string instead of reading the consumer's `.env`. A missing or
  placeholder base URL now throws from `createAuthClient` with the fix in the
  message.
- **Resumable setup.** Each answer is recorded in
  `src/auth/.auth-client.json` as it is given, so an interrupted run continues
  from the step it stopped on. A declined step is not re-asked (`setup --all`
  re-offers it); an unanswered one is. The file is a convenience — delete it
  and state is re-derived from the files themselves. `npx auth-client status`
  prints what is outstanding.
- **A real home page from `wire`.** `src/App.jsx` now generates a working
  signed-in view: a Session panel with the live idToken countdown, decoded JWT
  claims and a Force refresh button, plus Change password / Delete account.
  Styled by `src/auth/home.css`, which builds on the library's theme variables.
- **Moved to its own repository**, with the package at the root. npm cannot
  install from a subdirectory of a repo, which made `npm i github:…` impossible
  while the library lived inside the AuthPlatform monorepo.
- `scripts/verify-package.mjs` — 66 assertions run against `dist/`, not `src/`,
  covering the backend route contract, the install/setup contract (`.env` is
  appended never replaced, `undo` restores byte for byte) and the resume logic
  (an interrupted step is offered again, a completed one never is).

#### Changed

- **Restyled to a neutral, minimal palette** — white card on slate, near-black
  actions, system fonts, no gradients.
- Accessibility: label/input association via `useId`, `aria-invalid`,
  `aria-describedby`, `role="alert"` on errors, arrow-key navigation between OTP
  digits, `autocomplete="one-time-code"`.
- Errors carry a machine-readable `code`, and network failures are distinguished
  from HTTP errors.
- `deleteAccount` no longer clears the session when the request fails — a
  wrong-password rejection used to sign the user out.

#### Fixed

- The user object was persisted *inside* the token bundle as well as under its
  own key, and was carried forward stale through every refresh.
- A partial refresh response (new `id_token`, no new `refresh_token`) dropped the
  refresh token; the bundle now merges.
- The scoped CSS reset used `.ac-root button` (specificity 0,1,1), which
  outranked utility classes like `.bg-ac-accent` (0,1,0) and stripped the styling
  off every button. Now wrapped in `:where()` for zero specificity.
