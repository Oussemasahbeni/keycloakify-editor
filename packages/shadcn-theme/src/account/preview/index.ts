/**
 * Editor-facing entry for previewing the account console from source.
 *
 * Nothing here is imported by the Keycloak theme build (`main-kc.tsx`), so none
 * of it ships in the JAR. The UI itself stays behind `lazy()` because its module
 * graph reads the `#environment` script the loader injects at mount time.
 */

import { lazy } from "react";

export { KcAccountUiLoader } from "@keycloakify/keycloak-account-ui";

export { applyThemePreset, type ThemePresetProperties } from "#/login/theme/applyThemePreset";

export {
    createAccountKcContext,
    defaultAccountFeatureFlags,
    type AccountFeatureFlags,
    type AccountKcContextParams,
    type AccountPreviewKcContext,
} from "./createAccountKcContext";
export { setPreviewKeycloak } from "./previewKeycloakSlot";

export const AccountPreviewUi = lazy(() => import("./AccountPreviewUi"));
