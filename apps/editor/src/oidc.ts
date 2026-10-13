import { createKeycloakUtils } from "oidc-spa/keycloak";
import { oidcSpa } from "oidc-spa/react-tanstack-start";
import { z } from "zod";

import profileImageUrlFallback from "./profileImageFallback.svg";

export type User = {
    name: string;
    email: string;
    profileImageUrl: string;
    accountConsoleUrl: string;
};

export const { bootstrapOidc, useOidc, enforceLogin, oidcFnMiddleware } = oidcSpa
    .withUser<User>({
        createUser: async ({ decodedIdToken, issuerUri, clientId, validRedirectUri }) => {
            const { name, email, picture } = z
                .object({
                    name: z.string(),
                    email: z.string(),
                    picture: z.string().optional(),
                })
                .parse(decodedIdToken);

            const user: User = {
                name,
                email,
                profileImageUrl: picture ?? profileImageUrlFallback,
                accountConsoleUrl: createKeycloakUtils({ issuerUri }).getAccountUrl({
                    clientId,
                    validRedirectUri,
                }),
            };

            return user;
        },
    })
    .withAccessTokenValidation({
        type: "RFC 9068: JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens",
        expectedAudience: ({ process }) => process.env.OIDC_ACCESS_TOKEN_EXPECTED_AUDIENCE,
    })
    .createUtils();

bootstrapOidc(({ process }) => ({
    implementation: "real",
    issuerUri: process.env.OIDC_ISSUER_URI,
    clientId: process.env.OIDC_CLIENT_ID,
    debugLogs: true,
    // This module also loads in the framed `/preview/account` document, where the
    // silent-iframe flow would nest a frame and oidc-spa refuses to post the response.
    // 10.2.x falls back by itself when framed; the 10.3 rc line this app is on doesn't.
    // TODO: remove once the editor is on an oidc-spa version that includes that fallback.
    sessionRestorationMethod:
        typeof window !== "undefined" && window.self !== window.top ? "full page redirect" : "auto",
}));
