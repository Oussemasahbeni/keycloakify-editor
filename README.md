# Keycloakify Editor

> A **shadcn/ui + Tailwind v4** Keycloak login theme, plus a **visual editor** that lets you tweak it live and export a ready-to-deploy `.jar` — no FreeMarker required.

<p align="left">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA.svg?logo=react&logoColor=white" />
  <img alt="Tailwind v4" src="https://img.shields.io/badge/Tailwind-v4-38BDF8.svg?logo=tailwindcss&logoColor=white" />
  <img alt="Keycloakify v11" src="https://img.shields.io/badge/Keycloakify-v11-4D4D4D.svg" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-F69220.svg?logo=pnpm&logoColor=white" />
</p>

<!-- Add a screenshot or GIF of the editor here — e.g. ![Editor](./docs/editor.png) -->

---

## What's inside

This is a **pnpm workspace monorepo** with two projects that share one source of truth for the theme:

| Package | Name | What it is |
| ------- | ---- | ---------- |
| [`packages/shadcn-theme`](./packages/shadcn-theme) | `@keycloakify-editor/shadcn-theme` | The Keycloak **login + email theme** — React 19, TypeScript, Tailwind CSS v4, shadcn/ui, [Keycloakify](https://www.keycloakify.dev/) v11. Builds to a `.jar` you drop into Keycloak. |
| [`apps/editor`](./apps/editor) | `@keycloakify-editor/app` | A [TanStack Start](https://tanstack.com/start) web app: a **visual editor** that renders the *real* theme in an iframe so you can adjust layout, colors, fonts and branding, preview every login page, and **export / import** a themed `.jar`. |

The editor consumes the theme as a `workspace:*` dependency and drives it through a small typed contract (option arrays, defaults, and the `SHADCN_THEME_*` property keys), so the live preview and the downloaded `.jar` can never drift apart.

## Features

- 🎨 **Live visual editing** — change layout, primary/base colors, radius, font and branding, and see the real theme update instantly.
- 🖼️ **Branding uploads** — logos (light/dark), favicon, aside/side-panel images, baked straight into the `.jar`.
- 📄 **Every page covered** — ~40 login-flow pages (login, register, OTP, recovery, consent, errors…) previewable with realistic mock data.
- 📦 **Export → deploy** — download a self-contained Keycloak theme `.jar`; the current settings are baked as `theme.properties` defaults (still overridable per-realm via env vars).
- 🔁 **Import round-trip** — re-open a `.jar` the editor produced and every setting, image and name rehydrates for further editing.
- ✉️ **Email theming** — themed transactional email templates via [`jsx-email`](https://jsx.email/).
- 🌗 **Light / dark** and 30 locales out of the box.

## Quick start

**Prerequisites:** Node `>=20`, [pnpm](https://pnpm.io/) `11`.

```bash
git clone https://github.com/Oussemasahbeni/keycloakify-editor.git
cd keycloakify-editor
pnpm install
```

Then pick a workflow:

```bash
# Develop the theme UI in Storybook (the primary theme workflow, port 6006)
pnpm theme:storybook

# Run the visual editor (port 3000)
pnpm editor:dev

# Build the deployable Keycloak theme .jar → packages/shadcn-theme/dist_keycloak/
pnpm theme:build-keycloak-theme
```

## Repository layout

```
.
├── apps/
│   └── editor/            # @keycloakify-editor/app — TanStack Start visual editor
├── packages/
│   ├── shadcn-theme/      # @keycloakify-editor/shadcn-theme — the Keycloak theme (published)
│   └── spartan-theme/     # placeholder for a future theme
├── package.json           # root workspace scripts
└── pnpm-workspace.yaml
```

## Commands

All root scripts delegate to a package with `pnpm -F`. Run any package-local script directly with `pnpm -F @keycloakify-editor/<pkg> <script>`.

| Command | Description |
| ------- | ----------- |
| `pnpm theme:storybook` | Storybook for the theme (port 6006) — primary theme dev workflow |
| `pnpm theme:dev` | Vite dev server for the theme (mock `kcContext`) |
| `pnpm theme:build-keycloak-theme` | Full build → `.jar` in `packages/shadcn-theme/dist_keycloak/` |
| `pnpm theme:build-storybook` | Static Storybook |
| `pnpm theme:emails-preview` | Preview the email templates |
| `pnpm theme:lint` | Lint the theme |
| `pnpm editor:dev` | Editor dev server (port 3000) |
| `pnpm editor:build` | Build the editor (self-contained Node server in `dist/`) |
| `pnpm editor:test` | Editor test suite (Vitest) |
| `pnpm editor:lint` | Lint the editor |
| `pnpm format` | Prettier across the whole repo |

## Deploying the theme to Keycloak

1. Build the theme:
   ```bash
   pnpm theme:build-keycloak-theme
   ```
2. Copy the resulting `packages/shadcn-theme/dist_keycloak/shadcn-theme.jar` into your Keycloak instance's `providers/` directory.
3. Restart Keycloak, then in the Admin Console select the theme under **Realm settings → Themes → Login theme**.

> 💡 Prefer not to touch the CLI? Use the **editor** (`pnpm editor:dev`) to configure everything visually and click **Export** to download a `.jar` with your settings already baked in.

### Configuration (`SHADCN_THEME_*`)

The theme reads its look from `SHADCN_THEME_*` Keycloak env vars, each with a sensible default baked in — so the `.jar` works with zero configuration, yet stays overridable per realm at deploy time. Key ones:

| Var | Values |
| --- | ------ |
| `SHADCN_THEME_LAYOUT` | `two-column` · `centered-card` · `image-aside` |
| `SHADCN_THEME_PRIMARY` | `neutral` · `blue` · `emerald` · `indigo` · `rose` · … (18 accents) |
| `SHADCN_THEME_BASE` | `neutral` · `stone` · `zinc` · `mauve` · `olive` · `mist` · `taupe` |
| `SHADCN_THEME_RADIUS` | `none` · `small` · `default` · `medium` · `large` |
| `SHADCN_THEME_FONT` | `geist` (default) · `inter` · `manrope` · … |

See the [theme README](./packages/shadcn-theme/README.md) for the complete list, allowed values, and self-hosted-asset (`%BASE_URL%/…`) details.

## Editor configuration

The editor is a full app and needs a few server env vars (zod-validated in `apps/editor/src/config/env.ts`):

| Var | Purpose |
| --- | ------- |
| `DATABASE_URL` | Neon Postgres connection string (Drizzle ORM) |
| `OIDC_ISSUER_URI` | OIDC issuer for login (`oidc-spa`) |
| `OIDC_CLIENT_ID` | OIDC client id |

## Tech stack

- **Theme:** React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Keycloakify v11 · jsx-email · Storybook
- **Editor:** TanStack Start (Nitro) · React 19 + React Compiler · TanStack Router/Query · Drizzle ORM (Neon) · oidc-spa · Vitest
- **Tooling:** pnpm workspaces · Vite · Prettier

## Contributing

```bash
pnpm format      # format everything
pnpm editor:test # run the editor tests
```

PRs and issues welcome. Please format before submitting.

## License

[MIT](./LICENSE) © Oussema Sahbeni
