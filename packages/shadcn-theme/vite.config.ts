import fs from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { buildEmailTheme } from "keycloakify-emails";
import { keycloakify } from "keycloakify/vite-plugin";
import { defineConfig } from "vite";

import { kcEnvironmentVariables } from "./src/kc-env";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
        react(),
        tailwindcss(),
        keycloakify({
            accountThemeImplementation: "Single-Page",
            startKeycloakOptions: {
                // OID4VCI is a preview feature; needed for the account console's Verifiable Credentials page.
                keycloakExtraArgs: ["--features=oid4vc-vci"],
            },
            themeName: "shadcn-theme",
            keycloakVersionTargets: {
                "22-to-25": false,
                "all-other-versions": "shadcn-theme.jar",
            },
            kcContextExclusionsFtl: `<@addToXKeycloakifyMessagesIfMessageKey str="welcomeMessage" />`,
            environmentVariables: kcEnvironmentVariables,
            postBuild: async buildContext => {
                for (const themeName of buildContext.themeNames) {
                    const loginResourcesDir = path.join(
                        buildContext.keycloakifyBuildDirPath,
                        "resources",
                        "theme",
                        themeName,
                        "login",
                        "resources",
                    );
                    for (const dir of ["css", "img", "js", "resources-common"]) {
                        fs.rmSync(path.join(loginResourcesDir, dir), {
                            recursive: true,
                            force: true,
                        });
                    }
                }
                await buildEmailTheme({
                    templatesSrcDirPath: path.join(buildContext.themeSrcDirPath, "email", "templates"),
                    assetsDirPath: path.join(buildContext.themeSrcDirPath, "email", "templates", "assets"),
                    i18nSourceFile: path.join(buildContext.themeSrcDirPath, "email", "i18n.ts"),
                    themeNames: buildContext.themeNames,
                    keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
                    locales: [
                        "ar",
                        "ca",
                        "cs",
                        "da",
                        "de",
                        "el",
                        "en",
                        "es",
                        "fa",
                        "fi",
                        "fr",
                        "hu",
                        "it",
                        "ja",
                        "ka",
                        "lt",
                        "lv",
                        "nl",
                        "no",
                        "pl",
                        "pt",
                        "pt-BR",
                        "ro",
                        "ru",
                        "sk",
                        "sv",
                        "th",
                        "tr",
                        "uk",
                        "zh-CN",
                        "zh-TW",
                    ],
                    esbuild: {
                        jsx: "automatic",
                    },
                    cwd: import.meta.dirname,
                    environmentVariables: buildContext.environmentVariables,
                });
            },
        }),
    ],
});
