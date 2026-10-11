import { basePalettes, primaryPresets } from "@keycloakify-editor/shadcn-theme/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Link2, Link2Off, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Swatch } from "#/components/swatch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { toast } from "#/components/ui/toast";

import type { ThemeSummary } from "../model/saved-theme";
import { themesQueryKey } from "../queries";
import { deleteTheme, duplicateTheme, setThemeSharing } from "../server/themes";

function shareUrl(token: string) {
    return `${window.location.origin}/login?share=${encodeURIComponent(token)}`;
}

async function copyShareLink(token: string) {
    try {
        await navigator.clipboard.writeText(shareUrl(token));
        toast.add({ description: "Share link copied. Anyone with it can view and copy this theme.", type: "success" });
    } catch {
        toast.add({ title: "Couldn't copy the link", description: shareUrl(token), type: "warning" });
    }
}

const reportError = (fallback: string) => (error: unknown) =>
    toast.add({ description: error instanceof Error ? error.message : fallback, type: "error" });

export function ThemeCard({ theme }: { theme: ThemeSummary }) {
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const refresh = () => queryClient.invalidateQueries({ queryKey: themesQueryKey });

    const duplicateFn = useServerFn(duplicateTheme);
    const duplicate = useMutation({
        mutationFn: () => duplicateFn({ data: { id: theme.id } }),
        onSuccess: () => {
            toast.add({ description: `Duplicated ${theme.name}`, type: "success" });
            return refresh();
        },
        onError: reportError("Couldn't duplicate the theme."),
    });

    const removeFn = useServerFn(deleteTheme);
    const remove = useMutation({
        mutationFn: () => removeFn({ data: { id: theme.id } }),
        onSuccess: () => {
            toast.add({ description: `Deleted ${theme.name}`, type: "success" });
            return refresh();
        },
        onError: reportError("Couldn't delete the theme."),
    });

    const shareFn = useServerFn(setThemeSharing);
    const share = useMutation({
        mutationFn: (enabled: boolean) => shareFn({ data: { id: theme.id, enabled } }),
        onSuccess: async ({ shareToken }) => {
            if (shareToken) await copyShareLink(shareToken);
            else toast.add({ description: "Sharing stopped. The old link no longer works.", type: "success" });
            return refresh();
        },
        onError: reportError("Couldn't change sharing."),
    });

    const isBusy = duplicate.isPending || remove.isPending || share.isPending;
    const { shareToken } = theme;

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link to="/login" search={{ themeId: theme.id }} className="block truncate hover:underline">
                        {theme.name}
                    </Link>
                </CardTitle>
                <CardDescription>
                    Updated {new Date(theme.updatedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </CardDescription>
                <CardAction>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="icon" disabled={isBusy}>
                                    <MoreVertical />
                                    <span className="sr-only">Actions for {theme.name}</span>
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem render={<Link to="/login" search={{ themeId: theme.id }} />}>
                                <Pencil />
                                Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicate.mutate()}>
                                <Copy />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {shareToken ? (
                                <>
                                    <DropdownMenuItem onClick={() => void copyShareLink(shareToken)}>
                                        <Link2 />
                                        Copy share link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => share.mutate(false)}>
                                        <Link2Off />
                                        Stop sharing
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem onClick={() => share.mutate(true)}>
                                    <Link2 />
                                    Share
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                                <Trash2 />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <Swatch color={primaryPresets[theme.login.primary].light.primary} />
                    <Swatch color={basePalettes[theme.login.base].light.mutedForeground} />
                    <span>
                        {theme.login.layout} · {theme.login.font}
                    </span>
                    {shareToken && <Badge variant="secondary">Shared</Badge>}
                </div>
            </CardContent>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {theme.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The theme and its uploaded images are removed for good
                            {shareToken ? ", and its share link stops working" : ""}. JARs you already exported are not
                            affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                setConfirmDelete(false);
                                remove.mutate();
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
