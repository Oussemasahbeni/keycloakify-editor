import { z } from "zod";

const required = z.string().min(1);

const envSchema = z.object({
    DATABASE_URL: z.url(),
    OIDC_ISSUER_URI: z.url(),
    OIDC_CLIENT_ID: required,
    OIDC_ACCESS_TOKEN_EXPECTED_AUDIENCE: required,
    AWS_ENDPOINT_URL_S3: z.url(),
    AWS_REGION: required,
    // Not read by this app's code: the AWS SDK picks the credential up from the
    // environment itself. Listed so a missing one stops the server too.
    AWS_ACCESS_KEY_ID: required,
    AWS_SECRET_ACCESS_KEY: required,
    THEME_ASSETS_BUCKET: required,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map(issue => issue.path.join(".")))];
    throw new Error(`Missing or invalid environment variables: ${names.join(", ")}. See apps/editor/.env.sample.`);
}

/**
 * The server's configuration, checked once when the server entry loads
 * (`src/server.ts` imports this file): with a variable missing, every request
 * fails with the error above, so nothing downstream has to handle one that
 * isn't there. Server only: in the browser `process.env` is empty and this
 * would throw.
 */
export const serverEnv = parsed.data;
