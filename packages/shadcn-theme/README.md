# Keycloakify Editor — shadcn theme

A modern, production-ready Keycloak login theme built with React, TypeScript, Tailwind CSS v4, shadcn/ui, and Keycloakify v11.

[![CI](https://github.com/keycloakify/keycloakify/actions/workflows/ci.yaml/badge.svg)](https://github.com/keycloakify/keycloakify/actions/workflows/ci.yaml)
[![npm downloads](https://img.shields.io/npm/dm/@oussemasahbeni/keycloakify-login-shadcn)](https://www.npmjs.com/package/@oussemasahbeni/keycloakify-login-shadcn)
[![npm version](https://img.shields.io/npm/v/@oussemasahbeni/keycloakify-login-shadcn.svg)](https://www.npmjs.com/package/@oussemasahbeni/keycloakify-login-shadcn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Oussemasahbeni/keycloakify-editor/blob/main/LICENSE)

---

## Features

- **Modern UI** - Beautiful, responsive design using Tailwind CSS v4 and shadcn/ui components
- **Three Layout Modes** - `two-column`, `centered-card`, and `image-aside` layouts controlled from env vars
- **Shadcn-Inspired Theming** - Curated accent presets, base palettes, radius presets, and font presets
- **Dark Mode** - Built-in dark/light/system theme toggle with persistent preferences
- **Custom Email Templates** - Styled email templates using jsx-email for all Keycloak events
- **Complete Login Flow** - All 35+ Keycloak login pages fully customized
- **Social Login Providers** - Pre-styled icons for 16+ OAuth providers (Google, GitHub, Microsoft, etc.)
- **Storybook Integration** - Visual testing with live toolbar controls for locale, layout, theme, font, radius, and placeholders
- **RTL Support** - Layout and form behavior adapted for right-to-left locales such as Arabic
- **Vite Powered** - Fast development with HMR and optimized builds
- **Type-Safe** - Full TypeScript support throughout the codebase

---

## Quick Start with npm

Get started quickly by using the published npm package in your own project.

### Step 1: Create a new Vite + React + TypeScript project

```bash
pnpm create vite
```

When prompted:

- **Project name:** `keycloak-theme` (or your preferred name)
- **Select a framework:** Choose **React**
- **Select a variant:** Choose **TypeScript**

```bash
cd keycloak-theme
```

### Step 2: Install dependencies

```bash
pnpm add keycloakify @oussemasahbeni/keycloakify-login-shadcn
pnpm install
```

### Step 3: Initialize Keycloakify

```bash
npx keycloakify init
```

When prompted:

- **Which theme type would you like to initialize?** Select **(x) login**
- **Do you want to install the Stories?** Select **(x) Yes (Recommended)**

### Step 4: Configure Vite

Update your `vite.config.ts` to include Tailwind CSS, path aliases, and the Keycloakify plugin:

```typescript
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        keycloakify({
            accountThemeImplementation: "none",
            themeName: "your-theme-name",
            environmentVariables: [
                {
                    name: "SHADCN_THEME_LOGO_URL",
                    default: "",
                },
                {
                    name: "SHADCN_THEME_LOGO_DARK_URL",
                    default: "",
                },
                { name: "SHADCN_THEME_APP_NAME", default: "Acme Inc." },
                { name: "SHADCN_THEME_LAYOUT", default: "two-column" },
                { name: "SHADCN_THEME_ASIDE_IMAGE_URL", default: "" },
                { name: "SHADCN_THEME_PRIMARY", default: "neutral" },
                { name: "SHADCN_THEME_BASE", default: "neutral" },
                { name: "SHADCN_THEME_RADIUS", default: "default" },
                { name: "SHADCN_THEME_FONT", default: "geist" },
                { name: "SHADCN_THEME_SHOW_PLACEHOLDER", default: "true" },
            ],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
```

### Step 5: Configure TypeScript paths

Add the path alias to your `tsconfig.app.json` and `tsconfig.json`:

```json
//tsconfig.json
{
    // ...
    "compilerOptions": {
        // ...
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

```json
// tsconfig.app.json
{
    "compilerOptions": {
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

### Step 7: Initializing Git

Using Git is a requirement. It enables Keycloakify to track the files you have customized vs the files that you're just inheriting from the keycloakify-login-shadcn NPM package.

```bash
git init .
git add -A
git commit -m "Initial commit"
```

### Step 8: Run Storybook and build

```bash
# Run Storybook for component development and testing
pnpm storybook

# Build the JAR file to import in Keycloak, see https://docs.keycloakify.dev/deploying-your-theme
pnpm build-keycloak-theme

# Test in a local Keycloak. More info: https://docs.keycloakify.dev/testing-your-theme/inside-of-keycloak
pnpm exec keycloakify start-keycloak
```

That's it! You now have a fully functional Keycloak login theme using the published package.

### Before You Start

Before customizing the theme, watch this short Keycloakify overview. It explains the core concepts you need to understand how your changes are applied in Keycloak.

[Watch the Keycloakify overview video](https://www.youtube.com/watch?v=0peJITq1WXU)

---

## Development (for contributors)

If you want to clone this repository and develop/customize the theme locally:

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- [Maven](https://maven.apache.org/) (for building the theme JAR)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/Oussemasahbeni/keycloakify-editor.git
cd keycloakify-editor

# Install dependencies
pnpm install
```

### Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Run Storybook for component development
pnpm storybook

# Preview email templates
pnpm emails:preview

# Build the Keycloak theme JAR
pnpm build-keycloak-theme
```

---

## Theme Configuration

The login theme is primarily customized through Keycloakify environment variables. These values are available in both the built Keycloak theme and Storybook.

### Environment Variables

| Variable | Default | Allowed values | Description |
| ----------------------------- | -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- |
| `SHADCN_THEME_LOGO_URL` | `""` | Any image URL or `%BASE_URL%/filename` | Logo used in light mode. Use `%BASE_URL%/logo.svg` to self-host via `public/`. |
| `SHADCN_THEME_LOGO_DARK_URL` | `""` | Any image URL or `%BASE_URL%/filename` | Logo used in dark mode. Optional; falls back to `SHADCN_THEME_LOGO_URL`. Use `%BASE_URL%/logo.svg` to self-host via `public/`. |
| `SHADCN_THEME_ASIDE_IMAGE_URL` | `""` | Any image URL or `%BASE_URL%/filename` | `image-aside` panel image. Use `%BASE_URL%/image.jpg` to self-host via `public/`. | mode. |
| `SHADCN_THEME_LAYOUT` | `"two-column"` | `two-column`, `centered-card`, `image-aside` | Selects the outer page layout used by `Template.tsx`. |
| `SHADCN_THEME_PRIMARY` | `"neutral"` | See accent preset list below | Selects the shadcn-style accent color family used for primary actions. |
| `SHADCN_THEME_BASE` | `"neutral"` | See base palette list below | Selects the neutral surface palette used for backgrounds, cards, borders, muted states, and ring. |
| `SHADCN_THEME_RADIUS` | `"default"` | `default`, `none`, `small`, `medium`, `large` | Controls the global border radius token. |
| `SHADCN_THEME_FONT` | `"geist"` | See font preset list below | Controls the main theme font family. |
| `SHADCN_THEME_SHOW_PLACEHOLDER` | `"true"` | `true`, `false` | Shows or hides placeholders on supported auth forms. |

`SHADCN_THEME_SHOW_PLACEHOLDER` currently applies to the fixed auth forms implemented directly in this theme, such as login, login-username, login-password, reset-password, and update-password.

The register page is intentionally not covered by this automatic placeholder toggle. Register fields are dynamic and come from Keycloak user profile configuration, so the theme cannot safely predict which fields will exist. For register and other dynamic profile forms, placeholders should be configured in Keycloak through the user profile field annotations.

### Layout Options

- `two-column`
- `centered-card`
- `image-aside`

### Accent Presets

- `neutral`
- `amber`
- `blue`
- `cyan`
- `emerald`
- `fuchsia`
- `green`
- `indigo`
- `lime`
- `orange`
- `pink`
- `purple`
- `red`
- `rose`
- `sky`
- `teal`
- `violet`
- `yellow`

### Base Palettes

- `neutral`
- `stone`
- `zinc`
- `mauve`
- `olive`
- `mist`
- `taupe`

### Radius Presets

- `default`
- `none`
- `small`
- `medium`
- `large`

### Font Presets

- `inter`
- `geist`
- `manrope`
- `figtree`
- `source-sans-3`
- `ibm-plex-sans`
- `lora`
- `playfair-display`
- `jetbrains-mono`

### Example Theme Configuration

```ts
environmentVariables: [
    {
        name: "SHADCN_THEME_LOGO_URL",
        default: "",
    },
    {
        name: "SHADCN_THEME_LOGO_DARK_URL",
        default: "",
    },
    { name: "SHADCN_THEME_LAYOUT", default: "two-column" },
    { name: "SHADCN_THEME_ASIDE_IMAGE_URL", default: "" },
    { name: "SHADCN_THEME_PRIMARY", default: "neutral" },
    { name: "SHADCN_THEME_BASE", default: "neutral" },
    { name: "SHADCN_THEME_RADIUS", default: "default" },
    { name: "SHADCN_THEME_FONT", default: "geist" },
    { name: "SHADCN_THEME_SHOW_PLACEHOLDER", default: "true" },
];
```

Example branding combinations:

- `SHADCN_THEME_LAYOUT=image-aside`
- `SHADCN_THEME_PRIMARY=indigo`
- `SHADCN_THEME_BASE=stone`
- `SHADCN_THEME_RADIUS=medium`
- `SHADCN_THEME_FONT=manrope`
- `SHADCN_THEME_SHOW_PLACEHOLDER=true`

### Storybook Controls

Storybook exposes the same runtime customization model through toolbar controls so you can test combinations without creating duplicate stories.

Available controls:

- locale
- layout
- theme preset
- base palette
- radius preset
- font preset
- placeholder visibility

### Branding Notes

1. **Logo**: Set `SHADCN_THEME_LOGO_URL` (and optionally `SHADCN_THEME_LOGO_DARK_URL` for a dark-mode variant; it falls back to the light logo), or replace `src/login/assets/img/auth-logo.svg`
2. **Colors**: Use `SHADCN_THEME_PRIMARY`, `SHADCN_THEME_BASE`, and `SHADCN_THEME_RADIUS`
3. **Fonts**: Use `SHADCN_THEME_FONT`; the project now uses packaged font imports instead of manual asset-only font wiring

### Internationalization

Add or modify translations in `src/login/i18n.ts`:

```typescript
.withCustomTranslations({
    en: {
        welcomeMessage: "Welcome to Your App",
        loginAccountTitle: "Login to your account",
        // ... more translations
    },
    fr: { /* French translations */ },
    ar: { /* Arabic translations */ }
})
```

## Email Templates

Custom email templates are built with [jsx-email](https://jsx.email/) and support multiple languages.

### Available Templates

| Template                     | Description                     |
| ---------------------------- | ------------------------------- |
| `email-verification.tsx`     | Email verification              |
| `password-reset.tsx`         | Password reset link             |
| `executeActions.tsx`         | Required actions                |
| `identity-provider-link.tsx` | IDP linking                     |
| `org-invite.tsx`             | Organization invitation         |
| `event-login_error.tsx`      | Login error notification        |
| `event-update_password.tsx`  | Password change notification    |
| `event-update_totp.tsx`      | TOTP configuration notification |
| And more...                  |                                 |

### Preview Emails Locally

```bash
pnpm emails:preview
```

### Email Locales

Translations are in `src/email/locales/{locale}/translation.json`:

- `en/` - English
- `fr/` - French
- `ar/` - Arabic

---

## Building for Production

### Install Maven

Required for building the Keycloak theme JAR file.

- **macOS**: `brew install maven`
- **Ubuntu/Debian**: `sudo apt-get install maven`
- **Windows**: `choco install openjdk && choco install maven`

### Build the Theme

```bash
pnpm build-keycloak-theme
```

The built theme will be output as a `.jar` file in the `dist_keycloak/` directory.

### Deploy to Keycloak

1. Copy the `.jar` file to your Keycloak's `providers/` directory
2. Restart Keycloak
3. Go to Keycloak Admin Console → **Realm Settings** → **Themes**
4. Select your custom theme from the dropdown

---

## Testing

### Storybook

Run Storybook for visual testing and component documentation:

```bash
pnpm storybook
```

### Local Keycloak Testing

For local testing with a Keycloak instance, see the [Keycloakify documentation](https://docs.keycloakify.dev/testing-your-theme).

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](./LICENSE) © 2026 Oussema Sahbeni.

---

## Acknowledgments

- [Keycloakify](https://keycloakify.dev) - For making Keycloak theming with React possible
- [shadcn/ui](https://ui.shadcn.com) - For the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - For the utility-first CSS framework
- [jsx-email](https://jsx.email) - For React email templates
