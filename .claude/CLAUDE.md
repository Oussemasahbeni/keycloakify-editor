# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **pnpm workspace monorepo** containing two related projects:

- **`packages/shadcn-theme`** (`@keycloakify-editor/shadcn-theme`) — a Keycloak login theme built with React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and Keycloakify v11. Produces a `.jar` deployed to Keycloak's `providers/` directory. This is the published package and the original project.
- **`apps/editor`** (`@keycloakify-editor/app`) — a TanStack Start web app: a visual editor that renders the real theme live in an iframe so users can tweak layout/colors/fonts and preview every login page.
- **`packages/spartan-theme`** — empty placeholder, nothing implemented yet.

The editor consumes the theme as a workspace dependency (`workspace:*`) and renders it through the theme's package `exports` (see **Public exports** below).

## Monorepo Layout & Commands

Workspace globs (`pnpm-workspace.yaml`): `apps/*`, `packages/*`. Shared dependency versions are pinned via pnpm `catalog:` (React 19, Tailwind 4, Vite, TypeScript). Package manager: pnpm 12.

Both packages use `#/` imports defined by `package.json` `imports` (Node subpath imports, shadcn "package imports" style) — not tsconfig `paths`, which would leak across packages when the editor type-checks theme source. `#/components/*` → `*.tsx`, `#/lib/*` and `#/hooks/*` → `*.ts` are imported **without** an extension; everything else goes through `#/*` → `./src/*` and **must** include it (`#/login/i18n.ts`, `#/features/.../index.ts`). Don't use `@/`.

Root scripts (`package.json`) delegate to a package with `pnpm -F`:

```bash
pnpm theme:dev                   # Vite dev server for the theme (UI dev)
pnpm theme:storybook             # Storybook on port 6006 (primary theme dev workflow)
pnpm theme:build-storybook       # Build static Storybook
pnpm theme:build-keycloak-theme  # Full build → outputs .jar in packages/shadcn-theme/dist_keycloak/
pnpm theme:prepare               # prepare-publish script
pnpm editor:dev                  # Editor dev server (port 3000)
pnpm fmt                         # oxfmt (write) across the whole repo (fmt:check to verify)
pnpm typecheck                   # tsc across both packages (CI gate)
```

To run any package-local script directly: `pnpm -F @keycloakify-editor/shadcn-theme <script>` or `pnpm -F @keycloakify-editor/app <script>`.

## Theme Package (`packages/shadcn-theme/`)

All paths below are relative to `packages/shadcn-theme/`. **Storybook is the primary development and visual-testing environment for the theme — there are no unit tests here.**

Package-local scripts:

```bash
pnpm dev                   # Vite dev server (uses mock kcContext)
pnpm storybook             # Storybook on port 6006
pnpm build                 # tsc check + Vite build
pnpm build-keycloak-theme  # Full build → .jar in dist_keycloak/
pnpm build-storybook       # Static Storybook → storybook-static/
pnpm lint                  # Oxlint (.oxlintrc.json)
pnpm fmt                   # oxfmt (write)
pnpm emails:preview        # Preview email templates
pnpm emails:check          # Validate email templates
```

After adding Keycloak env vars or pages, regenerate the auto-generated file:

```bash
pnpm -F @keycloakify-editor/shadcn-theme exec keycloakify update-kc-gen
```

`postinstall` automatically runs `keycloakify sync-extensions` — no manual step after `pnpm install`.

### Public exports (the contract the editor depends on)

`package.json` `exports` expose a small typed surface that `apps/editor` imports. **Moving or renaming any of these files breaks the editor:**

| Subpath     | Target                     | Provides                                                                                                                                                                                                                                                                          |
| ----------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./preview` | `src/login/preview.tsx`    | `KcPage`, `getKcContextMock`, `KcContext`                                                                                                                                                                                                                                         |
| `./theme`   | `src/login/theme/index.ts` | Option arrays + types: `primaryPresetOptions`, `basePaletteOptions`, `radiusPresetOptions`, `fontFamilyOptions`, `layoutOptions` and `PrimaryPreset`/`BasePalette`/`RadiusPreset`/`FontFamily`/`Layout` , `basePalettes`, `primaryPresets` (OKLCH values), and `KC_ENV_DEFAULTS` + `KcEnvName` (re-exported from `src/kc-env.ts`). The field→env-name maps (`THEME_PROPERTY_KEYS`, `EMAIL_PROPERTY_KEYS`) are editor-owned: `apps/editor/src/features/editor/shared/model/property-keys.ts` |
| `./email`           | `src/email/index.ts`             | Email theme helpers: `resolveEmailTheme`, email theme types, `emailTemplateIds` / template metadata |
| `./email-preview`   | `src/email/preview.tsx`          | `renderEmailPreview` (server-side HTML render used by the editor's email surface)                   |
| `./account-preview` | `src/account/preview/index.ts`   | `AccountPreviewUi`, `KcAccountUiLoader`, `applyThemePreset`, `setBrandOverrides`, `setPreviewKeycloak` |

### Architecture

**Entry points:**

- `src/main.tsx` — browser dev entry (mock `kcContext`)
- `src/main-kc.tsx` — production Keycloak entry (reads `window.kcContext`)
- `src/main-kc.dev.tsx` — Keycloak dev entry with HMR
- `src/kc.gen.tsx` — **auto-generated** by `keycloakify update-kc-gen` (exports `KcEnvName`, `ThemeName`, `KcPage`, `kcEnvDefaults`). Do not edit.

**Login theme (`src/login/`)** — provider tree in `KcPage.tsx`:

```
KcContextProvider → I18nProvider → KcClsxProvider (doUseDefaultCss: false) → ThemeProvider → PageIndex
```

- **Page routing** (`pages/PageIndex.tsx`): switch on `kcContext.pageId` (e.g. `"login.ftl"`) to lazy-loaded pages. Each page is `pages/{page-name}/` with an `index.ts` barrel, `Page.tsx`, optional `Page.stories.tsx`. Each `Page.tsx` calls `assert(kcContext.pageId === "...")` then renders `<Template>`.
- **Template system** (`components/Template/`): `Template.tsx` reads `kcContext.properties.SHADCN_THEME_LAYOUT` and renders one of `layouts/`: `TwoColumnLayout`, `CenteredCardLayout`, `ImageAsideLayout`. `theme/useApplyThemePreset.ts` writes CSS custom properties to `:root` at runtime from `SHADCN_THEME_PRIMARY`/`_BASE`/`_RADIUS`/`_FONT` (using the resolvers in `theme/ThemeUtils.ts`). OKLCH tokens live in `theme/Presets.ts`, split into `basePalettes` (neutral surfaces) and `primaryPresets` (primary accent), layered together; their value types are in `theme/ThemeTypes.ts`. **Every `SHADCN_*` env var and its default is declared once in `src/kc-env.ts`** (`KC_ENV_DEFAULTS`): `vite.config.ts` passes the derived `kcEnvironmentVariables` to Keycloakify, which regenerates `kc.gen.tsx` from it on every Vite start/build; the login theme, email theme and editor read defaults from the same object. Never hand-edit `kc.gen.tsx` or duplicate a default elsewhere.
- **Context extension** (`KcContext.ts`): adds `properties: Record<KcEnvName, string>` (typed env vars), `darkMode?: boolean`, `client.baseUrl`.
- **i18n** (`i18n.ts`): `i18nBuilder` from `@keycloakify/login-ui/i18n`, custom keys across 30 locales. Add keys via `.withCustomTranslations({...})`.
- **Asset URLs** (`src/lib/resolveAssetUrl.ts`): handles the `%BASE_URL%/filename` pattern for self-hosted assets in `public/`.
- **Style injection** (`styleLevelCustomization.tsx`): sets `doUseDefaultCss: false`, wraps children in `ThemeProvider` (dark/light/system), imports `./index.css` (Tailwind entry).
- **Password-confirm toggle** (`components/UserProfileFormFields/DO_MAKE_USER_CONFIRM_PASSWORD.ts`): single boolean controlling whether registration requires re-entering the password.

**Email templates (`src/email/`)** — `jsx-email`, compiled during `build-keycloak-theme` via the `keycloakify-emails` Vite plugin's `postBuild` hook. Email i18n is a **separate system** from login i18n: `src/email/i18n.ts` uses `i18next`/`react-i18next` with JSON in `src/email/locales/{locale}/translation.json`.

**Shared components** (`src/components/`): shadcn/ui components + `ThemeProvider`.

**Storybook** (`.storybook/`): `preview.ts` injects a global decorator mirroring all Keycloak env vars as toolbar controls. Stories take `kcContext` as a prop, mocked via `src/login/mocks/getKcContextMock.ts`.

### Environment variables (`SHADCN_THEME_*`)

Valid values (defaults declared in `src/kc-env.ts`; the full list is `KC_ENV_DEFAULTS`):

| Var                           | Valid values                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHADCN_THEME_LAYOUT`         | `two-column` (default) · `centered-card` · `image-aside`                                                                                                                           |
| `SHADCN_THEME_PRIMARY`        | `neutral` · `amber` · `blue` · `cyan` · `emerald` · `fuchsia` · `green` · `indigo` · `lime` · `orange` · `pink` · `purple` · `red` · `rose` · `sky` · `teal` · `violet` · `yellow` |
| `SHADCN_THEME_BASE`           | `neutral` · `stone` · `zinc` · `mauve` · `olive` · `mist` · `taupe`                                                                                                                |
| `SHADCN_THEME_RADIUS`         | `default` · `none` · `small` · `medium` · `large`                                                                                                                                  |
| `SHADCN_THEME_FONT`           | `inter` · `geist` (default) · `manrope` · `figtree` · `source-sans-3` · `ibm-plex-sans` · `lora` · `playfair-display` · `jetbrains-mono`                                           |
| `SHADCN_THEME_LOGO_URL` | URL or `%BASE_URL%/filename` for light-mode logo                                                                                                                                   |
| `SHADCN_THEME_LOGO_DARK_URL`  | URL or `%BASE_URL%/filename` for dark-mode logo (optional; falls back to `SHADCN_THEME_LOGO_URL`)                                                                                  |
| `SHADCN_THEME_ASIDE_IMAGE_URL` | URL or `%BASE_URL%/filename` for aside image (image-aside layout)                                                                                                                  |
| `SHADCN_THEME_SHOW_PLACEHOLDER`    | `true` (default) · `false`                                                                                                                                                         |

### Adding a new page

1. Create `src/login/pages/{page-name}/Page.tsx` with `assert(kcContext.pageId === "...")` and a `<Template>` wrapper.
2. Create `src/login/pages/{page-name}/index.ts` re-exporting the page.
3. Add a lazy import + `case` to `PageIndex.tsx`.
4. Optionally add `Page.stories.tsx`.
5. To surface it in the editor preview, also add an entry to `apps/editor/src/features/editor/login/stories/pages.ts`.

### Adding a new env var

1. Add it (with its default) to `KC_ENV_DEFAULTS` in `src/kc-env.ts` — the single source; `vite.config.ts` derives `kcEnvironmentVariables` from it.
2. Start Vite or run `pnpm -F @keycloakify-editor/shadcn-theme exec keycloakify update-kc-gen` to regenerate `src/kc.gen.tsx`.
3. Access it via `kcContext.properties.YOUR_VAR_NAME` (typed automatically). If the editor should control it, add it to `apps/editor/src/features/editor/shared/model/property-keys.ts` and `theme-config.ts`.

### Adding an email translation key

Add the key/value to `src/email/locales/{locale}/translation.json` for each locale, then reference it via the `i18next` `t()` from `src/email/i18n.ts`.

## Editor App (`apps/editor/`)

A TanStack Start app (Nitro server adapter) with React 19 + React Compiler, file-based routing, Drizzle ORM (Neon), and OIDC via `oidc-spa`. Unlike the theme, **this app has automated tests (Vitest)**. All paths below are relative to `apps/editor/`.

Package-local scripts:

```bash
pnpm dev          # Vite dev server, port 3000
pnpm build        # Vite/Nitro build → self-contained Node server in .output/
pnpm test         # Vitest (run mode)
pnpm typecheck    # tsc --noEmit
pnpm lint         # Oxlint (.oxlintrc.json; @tanstack/eslint-plugin-query via jsPlugins)
pnpm fmt          # oxfmt (write)
pnpm db:generate  # drizzle-kit generate (also db:migrate / db:push / db:pull / db:studio)
```

> Ignore `apps/editor/README.md` — it is generic TanStack-starter boilerplate and references things this app does not actually use (`src/env.mjs`, Paraglide i18n, `src/routes/demo/`). Trust the code.

### Structure

- `src/routes/` — file-based routes: `__root.tsx`, `index.tsx` (landing), `editor.tsx` (the editor layout), `editor.login.tsx` / `editor.email.tsx` / `editor.account.tsx` (the three surfaces), `preview.login.tsx` (`ssr: false`; the isolated document loaded into the login preview iframe), `preview.account.$.tsx` (`ssr: false`; the account console rendered from source, splat so its inner react-router paths still match).
- `src/features/editor/` — one folder per editor **surface** plus shared code:
    - `login/`, `email/`, `account/` — each has `sidebar/` (the controls) and `preview/` (`preview-iframe.tsx` hosts that surface's preview, plus toolbars); `login/` also has `hooks/use-preview-channel.ts` and `stories/` (the **preview catalog**: `pages.ts` defines ~40 login pages with named scenarios whose `overrides` are deep-merged over the base mock; helpers in `helpers.ts`; `types.ts` defines `PageId`); `account/hooks/use-account-preview-channel.ts`.
    - `header/` — `editor-header`, `surface-switch`, `export-button` (calls the `generateJar` server fn), `import-button` (`parseThemeJar`), `sign-in-dialog`, `user-menu`.
    - `shared/model/` — `theme-config.ts` (`ThemeConfig`/`LoginThemeConfig`/`EmailThemeConfig`, zod schemas, `defaultLoginThemeConfig` built from the theme's `KC_ENV_DEFAULTS`, and `themeConfigToProperties`/`emailConfigToProperties`), `property-keys.ts`, `assets.ts`, `viewport.ts`, `preview-color-scheme.ts`, `surface.ts`; `shared/validation/` (zod schema + `getXError` per concern); `shared/parse-theme-jar.ts` (JAR import).
    - `server/` — server functions and pure helpers: `generate-jar.ts` (export; requires login), `jar-customizer.ts` (pure JAR rewrite, unit-tested), `favicon.ts`, `template-jar.ts` (loads `templates/base-theme.jar`, a Nitro server asset), `email-render-preview.ts`; tests in `server/tests/`.
    - `state/editor-context.tsx` — React context (theme name, locale, panel layout, login/email/account config + uploaded assets, import/reset); `useEditor()` hook. Drafts persist across sign-in via `src/lib/draft-storage.ts` (IndexedDB).
- `src/features/landing/` — marketing sections for the landing page.
- `src/config/` — `env.ts` (zod-validated **server** env: `OIDC_ISSUER_URI`, `OIDC_CLIENT_ID`, `OIDC_ACCESS_TOKEN_EXPECTED_AUDIENCE`, `DATABASE_URL` — note: `serverEnv` is not imported anywhere yet, so this validation does not currently run), `constants.ts` (`GITHUB_URL`).
- `src/oidc.ts` — `oidc-spa` utilities (`bootstrapOidc`, `enforceLogin`, `useOidc`, `getOidc`, `fetchWithAuth`).
- `src/db/` — `index.ts` (Neon client) + `schema.ts` (currently a placeholder `todos` table).
- `src/routeTree.gen.ts` — **auto-generated** by TanStack Router. Do not edit.

### Editor ↔ theme preview protocol

Each surface renders the _real_ theme in an isolated same-origin iframe. Understanding a flow requires reading both sides:

- **Login** — `features/editor/login/preview/preview-iframe.tsx` embeds `/preview/login` and calls `usePublishPreview`; `routes/preview.login.tsx` calls `useReceivePreview`. Transport is a same-origin **`BroadcastChannel("kc-preview")`** (`login/hooks/use-preview-channel.ts`), so a preview opened in a new tab also receives updates. Messages: `{ type: "request" }` (sent by the preview on mount; the editor answers with current state + assets, since BroadcastChannel doesn't buffer), `{ type: "state", state: { pageId, storyId, colorScheme, config, locale } }`, `{ type: "assets", assets }` (uploaded `File`s). Known limitation: the channel name is fixed, so two editor tabs share it.
- Scenario `overrides` can contain **non-cloneable functions** (e.g. `messagesPerField.get`), so they are never sent; the preview re-resolves them locally via `getStory(pageId, storyId)` and builds the context with `getKcContextMock({ pageId, overrides })`, mapping config onto `SHADCN_THEME_*` properties.
- Color scheme is applied by toggling the `dark` class **and** writing `localStorage["isDarkMode"]` — the theme's `ThemeProvider` reads that key on every (re)mount, and a locale change remounts `KcPage`.
- **Account** — `features/editor/account/preview/preview-iframe.tsx` ↔ `routes/preview.account.$.tsx` use `window.postMessage` with `kc-account-preview:*` messages (`request-config`, `ready`, `config`, `branding`); both sides check `event.origin === window.location.origin` **and** the exact source window (`account/hooks/use-account-preview-channel.ts`).
- **Email** — no channel: `email/preview/preview-iframe.tsx` calls the `renderEmailPreviewFn` server function and shows the returned HTML via `srcDoc`.

Build wiring (`vite.config.ts`): `ssr.noExternal` bundles the theme (source-only) and `@keycloakify/keycloak-account-ui` (extensionless ESM) for SSR rather than externalizing them; the `oidc-spa` Vite plugin automatically switches any route using `enforceLogin` to `ssr: false`; `viteReact({ compiler: true })` runs Oxc's native React Compiler pass (needs the optional `oxc-transform-react` dev dependency, no Babel) — so manual `useMemo`/`useCallback` for identity is unnecessary in app code, but components that break the rules of React are silently skipped.

## Gotchas

- **Auto-generated, never hand-edit:** `packages/shadcn-theme/src/kc.gen.tsx`, `apps/editor/src/routeTree.gen.ts`.
- The theme's `exports` paths (`./preview`, `./theme`, `./email`, `./email-preview`, `./account-preview`) are load-bearing for the editor — refactor them in lockstep with the editor's imports.
- Preview `overrides` containing functions can't be structured-cloned across the preview channel; keep their resolution inside `routes/preview.login.tsx`.
