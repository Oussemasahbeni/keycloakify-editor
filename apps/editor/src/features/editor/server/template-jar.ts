import { useStorage } from "nitro/storage";

/** Loads the bytes of the template Keycloak theme JAR, bundled as a Nitro server
 *  asset (see `serverAssets` in vite.config.ts) so it survives serverless bundling. */
export async function loadTemplateJar(): Promise<Uint8Array> {
    const raw = await useStorage("assets:theme-template").getItemRaw("base-theme.jar");
    if (raw == null) {
        throw new Error(
            "Template theme JAR not found. Run `pnpm theme:build-keycloak-theme` " +
                "then `pnpm -F @keycloakify-editor/app copy-template-jar`.",
        );
    }
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBufferLike);
}
