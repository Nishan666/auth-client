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

## Install

```bash
npm install github:sonal-7edge/auth-client
```

That is it — **no second command**. A postinstall hook scaffolds into your
project automatically:

```
src/auth/
  config.js      reads VITE_API_BASE_URL / VITE_AUTH_USE_MOCK from .env
  index.js       one import site for your app
  AuthFlow.jsx   the pre-auth journey
  screens/       SignIn, SignUp, OtpVerify, ForgotPassword,
                 ResetPassword, ChangePassword, DeleteAccount
.env             created, or appended if you already have one
```

Those screens are **yours** — edit them directly, no forking. Reinstalling never
overwrites them, and an existing `VITE_API_BASE_URL` is left alone.

If your environment disables install scripts (`npm ci --ignore-scripts`, some CI
setups), run the manual equivalent:

```bash
npx auth-client init          # --force to re-scaffold, --dir to relocate
```

## 1. Headless — just call the methods

```js
import { createAuthClient } from '@7edge/auth-client/core'

const auth = createAuthClient({ baseURL: 'https://api.example.com/api' })

// Sign-in is two steps: credentials, then the OTP that completes it.
const started = await auth.login({ email, password })
if (!started.error) {
  await auth.verifyOtp({ identifier: email, otp: '123456' })
}

auth.getState()            // { isAuthenticated, user, idToken, accessToken, isLoading, error }
auth.subscribe(console.log) // returns an unsubscribe fn

await auth.logout()
```

Every method resolves to `{ error: false, data }` or
`{ error: true, message, status, code }` — **no try/catch required**.

### Config

```js
createAuthClient({
  baseURL: 'https://api.example.com/api',
  useMock: false,             // in-memory backend, no network (see §4)
  mockOptions: { tokenTTLSeconds: 300, latency: 500, otp: '123456' },
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

### Full method list

| Session | Tokens | State / lifecycle |
|---|---|---|
| `signUp` | `refreshToken()` | `getState` |
| `signIn` / `login` | `fetchTokens` | `subscribe` |
| `verifyOtp` | `getTokens` | `connect` / `disconnect` |
| `resendOtp` | `getIdToken` | `destroy` |
| `forgotPassword` | `getAccessToken` | |
| `verifyResetOtp` | `getRefreshToken` | |
| `resetPassword` | `getValidToken` | |
| `changePassword` | `expiresIn` | |
| `deleteAccount` | | |
| `signOut` / `logout` | | |

> `refreshToken` is the **method**. The refresh token *value* is deliberately
> kept off React state — read it with `getRefreshToken()`.

## 2. React

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

## 3. Prebuilt screens

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

### Styling

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

## 4. Mock mode

```js
createAuthClient({ useMock: true })
```

An in-memory backend that mirrors the real API shape with **no network**. It is
not a stub: it issues structurally valid JWTs with live `exp` claims in the same
snake_case bundle the platform returns, so proactive refresh, the single-flight
lock and the 401 retry are all genuinely exercised. Switching to a real
`baseURL` changes no client-side code.

It also enforces real rules: password length, duplicate accounts, OTP expiry and
a 5-attempt lockout, single-use reset tokens, refresh-token rotation, and
session revocation on logout / password change / account deletion.

Seeded account: **`jane@example.com` / `Password123!`**, OTP **`123456`**.

## 5. Token handling

Modelled on the ORDO host app (`src/helpers/tokenManager.js`), so both agree on
the contract the real API will use.

- **One bundle, one key.** `{ id_token, access_token, refresh_token,
  session_token, expires_in, token_type }` persisted as a single JSON blob under
  `auth_tokens`, so a refresh swaps it atomically — no window where a new
  `id_token` sits beside a stale `refresh_token`. camelCase, nested `data.*` and
  snake_case inputs are all normalised on the way in.
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

## Backend contract

`POST` under `baseURL` (override via `endpoints`):

`/auth/signup` · `/auth/signin` · `/auth/verify-otp` · `/auth/resend-otp` ·
`/auth/forgot-password` · `/auth/verify-reset-otp` · `/auth/reset-password` ·
`/auth/change-password` · `/auth/delete-account` · `/auth/tokens` (issue),
`/auth/refresh` · `/auth/logout`

TOTP is not implemented — sign-in/sign-up complete via email/phone OTP only.

## Development

```bash
npm install
npm run build                      # vite (4 entries, esm+cjs) + tailwind
npm run lint
node scripts/verify-package.mjs    # 28 assertions against dist/, not src/
```

### Quick start in a fresh app

```bash
npm create vite@latest my-app -- --template react
cd my-app && npm install
npm install github:sonal-7edge/auth-client   # scaffolds src/auth/ + .env
npm run dev
```

Then import `'@7edge/auth-client/style.css'` in `main.jsx` and wrap your app in
`<AuthProvider config={authConfig}>`. Full walkthrough in [INSTALL.md](./INSTALL.md).
