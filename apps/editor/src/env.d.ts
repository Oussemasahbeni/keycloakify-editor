/// <reference types="vite/client" />

declare global {
    // Client-side environment variables (exposed via Vite, VITE_ prefix)
    // interface ImportMetaEnv {}

    // interface ImportMeta {
    //     readonly env: ImportMetaEnv;
    // }

    // Server-side environment variables
    namespace NodeJS {
        interface ProcessEnv {
            readonly DATABASE_URL: string;
            readonly OIDC_ISSUER_URI: string;
            readonly OIDC_CLIENT_ID: string;
            readonly OIDC_ACCESS_TOKEN_EXPECTED_AUDIENCE: string;
            readonly AWS_ENDPOINT_URL_S3: string;
            readonly AWS_REGION: string;
            readonly AWS_ACCESS_KEY_ID: string;
            readonly AWS_SECRET_ACCESS_KEY: string;
            readonly THEME_ASSETS_BUCKET: string;
            readonly STRIPE_SECRET_KEY: string;
            readonly STRIPE_WEBHOOK_SECRET: string;
            readonly STRIPE_PRICE_ID: string;
        }
    }
}

export {};
