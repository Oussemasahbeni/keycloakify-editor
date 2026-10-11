import { queryOptions, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";

import { Logo } from "#/components/logo";
import { ModeToggle } from "#/components/mode-toggle";
import { buttonVariants } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { UserMenu } from "#/features/editor/header/user-menu.tsx";

import { themesQueryKey } from "../queries";
import { listThemes } from "../server/themes";
import { ThemeCard } from "./theme-card";

function NewThemeLink() {
    return (
        <Link to="/login" className={buttonVariants({ variant: "default" })}>
            <Plus />
            New theme
        </Link>
    );
}

export function ThemesDashboard() {
    const themesList = useServerFn(listThemes);
    const themesOptions = queryOptions({
        queryKey: [...themesQueryKey, themesList],
        queryFn: () => themesList(),
    });
    const { data: themes, error, isLoading } = useQuery(themesOptions);

    return (
        <div className="flex min-h-svh flex-col">
            <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
                <Link to="/" className="flex items-center gap-2">
                    <Logo size={28} />
                    <span className="text-muted-foreground">My themes</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserMenu />
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-medium">My themes</h1>
                        {themes && themes.length > 0 && (
                            <p className="text-sm text-muted-foreground">{themes.length} saved</p>
                        )}
                    </div>
                    <NewThemeLink />
                </div>

                {isLoading && (
                    <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
                        <Spinner className="size-4" />
                        <span className="text-sm">Loading themes...</span>
                    </div>
                )}

                {error && <p className="text-sm text-destructive">Couldn't load your themes: {error.message}</p>}

                {themes && themes.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Nothing saved yet. Design a theme in the editor and press Save to keep it here.
                        </p>
                        <NewThemeLink />
                    </div>
                )}

                {themes && themes.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {themes.map(theme => (
                            <ThemeCard key={theme.id} theme={theme} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
