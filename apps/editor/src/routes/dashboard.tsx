import { createFileRoute } from "@tanstack/react-router";

import { ThemesDashboard } from "#/features/themes/dashboard/themes-dashboard.tsx";

export const Route = createFileRoute("/dashboard")({
    head: () => ({ meta: [{ title: "My themes — Keycloakify Editor" }] }),
    component: ThemesDashboard,
});
