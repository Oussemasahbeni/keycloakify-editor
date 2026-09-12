/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/KcContext.ts" --revert
 */

import { type KcContextLike, createGetKcContext } from "@keycloakify/keycloak-account-ui";

import type { KcEnvName } from "../kc.gen";

export type KcContext = KcContextLike & {
    themeType: "account";
    themeName: string;
    properties: Record<KcEnvName, string>;
};

export const { getKcContext } = createGetKcContext<KcContext>();
