# Account console preview surface in the editor (live Phase Two backing)

## Context

The editor previews the login theme (static mock `kcContext` in an iframe) and the email theme (server-rendered jsx-email HTML). The account console is not previewable anywhere: it is a live SPA that authenticates with keycloak-js, fetches the account REST API, loads i18n from Keycloak, and mounts its own react-router. Today the only way to see it is `keycloakify start-keycloak`.

Decision (user): add an **Account** surface backed by the **real account console on the existing Phase Two Keycloak instance**, framed in an iframe. Per-user isolation comes from the client: the deployed theme carries an origin-gated `postMessage` hook that applies branding overrides only inside the viewer's own iframe. The server theme stays shared and static (it is only the defaults). Hosting facts: the editor's OIDC issuer **is** that realm and both sit on the same root domain, so users are already logged in and cookies work inside the frame. Headers (frame-ancestors) are not yet confirmed, so step 0 is a spike.

Why this is cheap: the console consumes only six theme vars (primary, base, radius, font, logo, dark logo), all already on `LoginThemeConfig`. No new config model, no manifest `__version` bump. `applyThemePreset` is an exported plain function; the console's `ThemeProvider` exposes `setTheme`; its i18n already listens for a `languageChanged` window `CustomEvent` (`src/account/i18n/i18n.ts:33`); the built `theme.properties` reads every var as `${env.NAME:default}`.

Not in scope: mocks, fixtures, fake keycloak, Storybook stories for account.

## Verified facts that shape the design

| Fact | Where | Consequence |
|---|---|---|
| Realm-level theme = shared by all users; iframe gives zero isolation | Keycloak model | Overrides must be applied client-side, per iframe |
| `theme.properties` entries are `${env.SHADCN_THEME_X:default}` | `dist_keycloak/.../account/theme.properties` | Preview origin can be a Keycloak env var, or a baked default, without touching theme code |
| `KcAccountUi.tsx:63` applies presets from `kcContext.properties`; `root/useBrand.ts` reads logos from `kcContext.properties` | owned files | Both must read from an override store instead |
| `ThemeProvider` (`src/components/ThemeProvider.tsx`) reads `localStorage["isDarkMode"]` first, exposes `setTheme` | | Bridge calls `setTheme(scheme)`; must be mounted inside `ThemeProvider` |
| `i18n.ts:33` listens for `window` `languageChanged` CustomEvent → `i18n.changeLanguage` | sync-extensions file, untouched | Bridge dispatches the event; `environment.locale` stays stale (only affects `formatDate` in-session), acceptable |
| `Root.tsx` `Layout` has react-router context | owned | Bridge uses `useNavigate` for page switching |
| Editor has `user.accountConsoleUrl` from oidc-spa (`src/oidc.ts:27`) | | Console base URL = `origin + pathname` of that URL (verify it is `/realms/{realm}/account/`) |
| Blob URLs are origin-bound | browser | Uploaded logos cross as data URLs (same trick as `email/preview/preview-iframe.tsx:22-32`) |
| Editor `/preview` route and BroadcastChannel are same-origin only | `use-preview-channel.ts` | Account uses cross-origin `postMessage` to the iframe's `contentWindow`; no new editor preview route |
| Keycloak default headers: `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'` | realm → Security defenses → Headers | Must allow the editor origins (dev `http://localhost:3000` + prod) |
| Sync-extensions files are gitignored (`src/.gitignore`); `i18n.ts`, `api/*`, `environment.ts`, `routes.tsx` must not be edited | | Plan touches only owned + new files |

## Step 0: spike (gate for everything else)

1. In the Phase Two admin console → realm → Realm settings → Security defenses → Headers: clear `X-Frame-Options`; set `Content-Security-Policy` to `frame-src 'self'; frame-ancestors 'self' http://localhost:3000 https://<editor-host>; object-src 'none';`.
2. On the local editor dev server, render a bare `<iframe src="https://<kc-host>/realms/<realm>/account/">` (throwaway route or the browser devtools). Confirm: it renders, the user is already signed in (no login page inside the frame), and console pages navigate.
3. Confirm the custom JAR deploy path on Phase Two and whether server env vars can be set (decides how the preview origin is delivered, see 1.4).

If (2) fails on cookies or framing, stop and revisit (the mock-backed alternative from the earlier plan reuses parts 1.1-1.2 unchanged).

## Part 1: theme package (`packages/shadcn-theme`)

### 1.1 New env var
`src/kc-env.ts`: add `SHADCN_THEME_PREVIEW_ORIGINS: string` with default `''` (space-separated list of allowed editor origins). Regenerate `kc.gen.tsx` (`pnpm -F @kc-studio/shadcn-theme exec keycloakify update-kc-gen`). Empty = hook disabled, which is what every customer export gets.

### 1.2 Protocol module (side-effect free, shared by both sides)
`src/account/preview/protocol.ts`:

```ts
export const ACCOUNT_PREVIEW_MESSAGE = { ready: "kc-account-preview:ready", state: "kc-account-preview:state" } as const;
export type AccountPreviewState = {
    properties: Partial<Record<"SHADCN_THEME_PRIMARY"|"SHADCN_THEME_BASE"|"SHADCN_THEME_RADIUS"|"SHADCN_THEME_FONT"|"SHADCN_THEME_LOGO_URL"|"SHADCN_THEME_LOGO_DARK_URL", string>>;
    colorScheme?: "light" | "dark";
    locale?: string;
    path?: string;            // console-relative: "", "account-security/signing-in", ...
};
export type AccountPreviewMessage = { type: "kc-account-preview:ready" } | { type: "kc-account-preview:state"; state: AccountPreviewState };
export function parseAccountPreviewMessage(data: unknown): AccountPreviewMessage | undefined; // manual validation, allow-list the six property keys, drop everything else
export const ACCOUNT_PREVIEW_PAGES = [{ path: "", label: "Personal info" }, { path: "account-security/signing-in", ... }, ...] // mirrors assets/content.ts
```

Export it: `package.json` `"./account-preview": "./src/account/preview/protocol.ts"`.

### 1.3 Override store + bridge (owned prod files; no-ops when the env var is empty)
- `src/account/preview/overrides.ts`: tiny external store, `setAccountPreviewProperties(partial)`, `useAccountPreviewProperties(fallback)` via `useSyncExternalStore` (returns `fallback` merged with overrides).
- `src/account/preview/PreviewBridge.tsx`: renders nothing. On mount, if `kcContext.properties.SHADCN_THEME_PREVIEW_ORIGINS` is empty → return. Else:
  - `const target = window.opener ?? window.parent; if (target === window) return;`
  - `target.postMessage({ type: ready }, "*")` is NOT acceptable; post `ready` once to **each** allowed origin (`for (origin of origins) target.postMessage(readyMsg, origin)`, browsers drop mismatches silently).
  - `window.addEventListener("message", e => { if (!origins.includes(e.origin)) return; const msg = parseAccountPreviewMessage(e.data); ... })`.
  - On `state`: `setAccountPreviewProperties(state.properties)`; `applyThemePreset(merged)` (imperative, from `#/login/theme/applyThemePreset`); `if (state.colorScheme) setTheme(state.colorScheme)` (`useTheme()`); `if (state.locale) window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: state.locale } }))`; `if (state.path !== undefined) navigate(basename + state.path)` (basename = `new URL(environment.baseUrl).pathname`).
  - Security note in the file: origin-gated, cosmetic-only payload, no tokens or API calls involved.
- Wire-up:
  - `src/account/KcAccountUi.tsx`: `useApplyThemePresetFromProperties(useAccountPreviewProperties(kcContext.properties))`. Also **remove the duplicated `<QueryClientProvider>`** (lines 71-79).
  - `src/account/root/useBrand.ts`: read `SHADCN_THEME_LOGO_URL`/`_DARK_URL` from `useAccountPreviewProperties(kcContext.properties)`.
  - `src/account/root/Root.tsx` `Layout`: render `<PreviewBridge />` (inside `ThemeProvider` and the router, so `useTheme` + `useNavigate` work).

### 1.4 Delivering the preview origins to the Phase Two deployment
Preferred: set `SHADCN_THEME_PREVIEW_ORIGINS="http://localhost:3000 https://<editor-host>"` as a server env var on the instance (the `${env.…}` lookup picks it up, no rebuild). Fallback if Phase Two cannot set env vars: `packages/shadcn-theme/scripts/bake-preview-origins.mjs` that rewrites the default in `account/theme.properties` inside the built JAR (`fflate`, same approach as the editor's `jar-customizer.ts` property rewrite). Deploy that JAR and select the theme for the realm's account theme.

## Part 2: editor app (`apps/editor`)

### 2.1 Surface model and shared lookups
- `src/features/editor/shared/model/surface.ts`: `Surface = 'login' | 'email' | 'account'`; add `{ value: 'account', to: '/editor/account', label: 'Account', icon: UserRound }`. `header/surface-switch.tsx` picks it up.
- `src/features/editor/shared/components/language-select.tsx:15`: replace the ternary with `const slices = { login, email, account: login } satisfies Record<Surface, …>`.
- `state/editor-context.tsx`: **no new slice**. Account reuses `login.config`, `login.viewport`, `login.previewColorScheme`, `login.assets`. Selected `path` is local state in the account preview component.
- No changes to `routes/preview.tsx`, `__root.tsx`, or the BroadcastChannel.

### 2.2 Console URL
`src/features/editor/account/model/console-url.ts`: `getAccountConsoleBaseUrl(user)` = `new URL(user.accountConsoleUrl)` → `origin + pathname` (strip referrer query). Origin of that URL is the `targetOrigin` for every `postMessage` and the filter for incoming messages. `/editor` is already gated by `enforceLogin`, so `useOidc()` has the user.

### 2.3 Transport hook (parent side)
`src/features/editor/account/hooks/use-account-preview-bridge.ts`:
- Input: `{ targetOrigin, state: AccountPreviewState }`; returns `{ ref, status: "loading" | "ready" | "timeout", register(win: Window) }`.
- Listens for `message` with `event.origin === targetOrigin` and `type === ready` → marks that source window ready and immediately posts current `state` to `event.source` with `targetOrigin`.
- Re-posts `state` to every ready window on change (`useEffect` on the serialized state).
- Tracks the iframe `contentWindow` and any window from "open in new tab" (`window.open(baseUrl + path)`; the bridge posts `ready` to `window.opener`, so the same handler covers it).
- `timeout` after ~8 s without `ready` → the iframe shows a hint: "The account console did not answer. Check that the realm allows framing from this origin and that the deployed theme has preview origins configured."

State assembly: `properties` = the six keys from `themeConfigToProperties(login.config)`, with uploaded `logoUrl`/`logoDarkUrl` `File`s converted to data URLs (`FileReader.readAsDataURL`, same as `email/preview/preview-iframe.tsx`), `colorScheme` = `login.previewColorScheme`, `locale` = `login.config.locale`, `path` = selected page.

### 2.4 Account preview UI (`src/features/editor/account/`)
- `preview/preview-iframe.tsx`: `<iframe src={baseUrl + initialPath} title="Account console preview">` (no `sandbox`; cross-origin, Keycloak needs its own scripts/cookies), width from `login.viewport`, spinner overlay until `ready`, timeout hint. Page changes go through the bridge (`path`), not by changing `src`, so the console does not reload.
- `preview/preview-toolbar.tsx`: `AccountPageSelect` over `ACCOUNT_PREVIEW_PAGES` (from `@kc-studio/shadcn-theme/account-preview`), `<LanguageSelect surface="account" />`, viewport toggle, scheme toggle, open-in-new-tab, reset. Extract `ViewportToggle`, `PreviewThemeToggle`, `PreviewInNewTab` (takes `onOpen`), `ResetButton` from `login/preview/preview-toolbar.tsx` into `shared/components/preview-toolbar-controls.tsx`.
- `sidebar/index.tsx`: Tabs Branding | Assets rendering `<BrandingPanel sections={["appearance"]} />` and `<AssetsPanel keys={["logoUrl","logoDarkUrl"]} />`. Small note under the tabs: "This is your real account on <realm>. Branding changes are only visible to you."
- `src/routes/editor.account.tsx`: `<EditorSurface Preview={AccountPreviewIframe} Sidebar={AccountThemeSidebar} />` (copy of `editor.login.tsx`).

### 2.5 Sidebar reuse
- `login/sidebar/branding-panel.tsx`: add `sections?: ReadonlyArray<"appearance" | "layout">` (default both) around the two `<Section>` blocks (lines 397-413); `ShuffleButton` gets `includeLayout` so account shuffles appearance only. `ThemeNameField` stays.
- `login/sidebar/assets-panel.tsx`: add `keys?: ReadonlyArray<ThemeAssetKey>`; when set, filter `assetDefinitions` and skip the favicon card.

## Part 3: tests (Vitest, `src/features/editor/account/tests/`)
- `protocol.test.ts` (imports from `@kc-studio/shadcn-theme/account-preview`): `parseAccountPreviewMessage` accepts ready/state, rejects unknown types, strips property keys outside the allow-list, rejects non-string values, tolerates missing optional fields.
- `console-url.test.ts`: `getAccountConsoleBaseUrl` strips query/hash and keeps `/realms/x/account/`.
- `surface.test.ts`: `SURFACES` contains `account` → `/editor/account`.
- `pages.test.ts`: every `ACCOUNT_PREVIEW_PAGES.path` exists in `packages/shadcn-theme/src/account/assets/content.ts` (import the content array).

## Ordered steps
0. Spike (headers, framing, JAR deploy path).
1. Theme: `kc-env.ts` var + regenerate `kc.gen.tsx`; `preview/protocol.ts` + export; `preview/overrides.ts`; `PreviewBridge.tsx`; wire `KcAccountUi.tsx` (and drop the duplicate provider), `useBrand.ts`, `Root.tsx`. `pnpm -F @kc-studio/shadcn-theme build`.
2. Editor: surface union + icon, language-select lookup, console-url helper, bridge hook.
3. Editor: account iframe/toolbar, shared toolbar controls extraction, sidebar props, `AccountThemeSidebar`, `editor.account.tsx`.
4. Tests.
5. Build JAR (`pnpm theme:build-keycloak-theme`), deliver preview origins (env var or bake script), deploy to Phase Two, select as the realm's account theme.

## Verification
- Local first, before deploying: run `keycloakify start-keycloak` with `SHADCN_THEME_PREVIEW_ORIGINS=http://localhost:3000` and point a temporary `OIDC_ISSUER_URI` at it, or skip straight to Phase Two after the spike.
- `pnpm editor:dev` → `/editor/account`: console renders signed-in; all nine pages reachable via the page select and the console's own nav; primary/base/radius/font apply instantly; logo URL and uploaded logo update the brand; light/dark toggles; locale changes strings in place; open-in-new-tab opens the console and receives state; reset restores defaults. Sign out inside the frame is real; confirm the notice is visible.
- Isolation: open the console directly (no editor) in another tab or another user: default branding, no leakage.
- Security: a message from a foreign origin (devtools on another page) is ignored; the deployed customer export (env var empty) posts nothing and listens for nothing (check the Network/console).
- `pnpm -F @kc-studio/editor test`, `pnpm -F @kc-studio/editor lint`, `pnpm -F @kc-studio/editor build`, `pnpm -F @kc-studio/shadcn-theme build`, `pnpm theme:build-keycloak-theme`.

## Risks and gotchas
- **Headers unconfirmed** on Phase Two: the spike decides. Both `X-Frame-Options` and CSP `frame-ancestors` must allow the editor origins; list dev and prod.
- Keycloak-js inside the iframe runs `onLoad: "login-required"`; with the SSO cookie it redirects and comes back silently. If the session is missing, the login page shows inside the frame; acceptable, but the timeout hint should mention it.
- The console's `ThemeProvider` persists `isDarkMode` to the Keycloak origin's localStorage, so a scheme chosen in the editor sticks for the user's later direct visits. Either accept it or have the bridge restore the previous value on `pagehide`.
- Locale via the `languageChanged` event does not update `environment.locale`; dates formatted with it keep the original locale until reload. Acceptable for a preview.
- Mutations are real (sessions, consents, linked accounts). The sidebar note covers it.
- Data URLs for logos: keep an upper size bound (e.g. 1 MB) before posting.
- `user.accountConsoleUrl` shape from oidc-spa must be verified once (`origin + pathname` assumption).
- Do not edit gitignored sync-extensions files (`i18n.ts`, `api/*`, `environment.ts`, `routes.tsx`).
