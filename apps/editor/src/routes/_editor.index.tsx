import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/")({
    beforeLoad: ({ search }) => {
        throw Route.redirect({ to: "/editor/login", search, replace: true });
    },
});
