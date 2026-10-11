import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_editor/")({
    beforeLoad: ({ search }) => {
        throw Route.redirect({ to: "/login", search, replace: true });
    },
});
