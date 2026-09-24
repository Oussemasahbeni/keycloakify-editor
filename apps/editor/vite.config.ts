import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { oidcSpa } from "oidc-spa/vite-plugin";
import { defineConfig } from "vite";

const config = defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackStart(),
        nitro({
            serverAssets: [{ baseName: "theme-template", dir: "./src/features/editor/server/templates" }],
        }),
        oidcSpa({
            browserRuntimeFreeze: {
                enabled: true,
                // Keycloakify's account loader reassigns `window.fetch` when it mounts
                // (in the `/preview/account` document); the freeze would throw on that.
                // Same exclusion the theme's own account entry point uses.
                excludes: ["fetch"],
            },
            DPoP: {
                enabled: true,
                mode: "auto",
            },
        }),
        // Oxc's native React Compiler pass (no Babel). Experimental integration; drop the
        // flag to disable. Components that break the rules of React are skipped silently.
        viteReact({ compiler: true }),
    ],
    ssr: {
        // The theme is source-only, and keycloak-account-ui ships extensionless ESM
        // imports that Node can't resolve; bundle both instead of externalizing.
        noExternal: ["@keycloakify-editor/shadcn-theme", "@keycloakify/keycloak-account-ui"],
    },
});

export default config;
