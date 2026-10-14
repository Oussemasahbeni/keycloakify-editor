import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { z } from "zod";

import { LoadingScreen } from "#/components/loading-screen";
import { buttonVariants } from "#/components/ui/button";
import { EditorHeader } from "#/features/editor/header/editor-header.tsx";
import { EditorProvider, useEditor } from "#/features/editor/state/editor-context.tsx";

// A malformed value is dropped rather than turned into an error page: the editor
// then simply opens on a new theme.
const editorSearchSchema = z.object({
    themeId: z.uuid().optional().catch(undefined),
    share: z.string().optional().catch(undefined),
    // Set by Stripe's redirect back from checkout; the export button reads and then removes them.
    checkout: z.enum(["success", "cancelled"]).optional().catch(undefined),
    session_id: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_editor")({
    validateSearch: editorSearchSchema,
    component: EditorLayout,
});

function EditorLayout() {
    const { themeId, share } = Route.useSearch();

    return (
        <EditorProvider themeId={themeId} shareToken={share}>
            <EditorBody />
        </EditorProvider>
    );
}

function EditorBody() {
    const { remote } = useEditor().persistence;

    if (remote.state === "loading") return <LoadingScreen />;

    if (remote.state === "ready") {
        return (
            <div className="flex h-svh flex-col">
                <EditorHeader />
                <Outlet />
            </div>
        );
    }

    // remote.state === "error"
    return <ThemeUnavailable title="Couldn't open this theme" description={remote.message} />;
}

function ThemeUnavailable(props: { title: string; description: string }) {
    const { title, description } = props;

    return (
        <div className="flex h-svh flex-col items-center justify-center gap-4 p-6 text-center">
            <h1 className="text-lg font-medium">{title}</h1>
            <p className="max-w-md text-sm text-muted-foreground">{description}</p>
            <Link to="/login" className={buttonVariants({ variant: "outline" })}>
                Start a new theme
            </Link>
        </div>
    );
}
