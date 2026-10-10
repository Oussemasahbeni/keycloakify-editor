import { createFileRoute } from "@tanstack/react-router";

import { ThemesDashboard } from "#/features/themes/dashboard/themes-dashboard.tsx";
import { enforceLogin } from "#/oidc.ts";

export const Route = createFileRoute("/dashboard")({
    beforeLoad: enforceLogin,
    head: () => ({ meta: [{ title: "My themes — Keycloakify Editor" }] }),
    component: ThemesDashboard,
});
