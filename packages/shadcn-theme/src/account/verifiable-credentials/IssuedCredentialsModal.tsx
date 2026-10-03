/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/verifiable-credentials/IssuedCredentialsModal.tsx" --revert
 */

import { ExternalLinkIcon, TriangleAlertIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
import { Button, buttonVariants } from "#/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { toast } from "#/components/ui/toast";
import { cn } from "#/lib/utils";

import type { AccountEnvironment } from "..";
import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import { revokeIssuedVerifiableCredential } from "../api/methods";
import { accountKeys, useAccountMutation, useIssuedVerifiableCredentials } from "../api/queries";
import type { IssuedUserVerifiableCredentialRepresentation } from "../api/representations";
import { DataTableToolbar } from "../components/DataTableToolbar";
import { TableEmptyRow, TableLoadingRow } from "../components/TableStates";
import { formatDate } from "../utils/formatDate";
import { toastApiError } from "../utils/toastError";
import { useClientPagination } from "../utils/useClientPagination";
import { hasManageRole } from "./hasManageRole";

type IssuedCredential = IssuedUserVerifiableCredentialRepresentation;

type IssuedCredentialsModalProps = {
    credentialScopeName: string;
    onClose: () => void;
};

const matches = (credential: IssuedCredential, query: string) => {
    const needle = query.toLowerCase();
    return [credential.id, credential.clientId, credential.clientName, credential.revision].some(value =>
        value?.toLowerCase().includes(needle),
    );
};

/** Every credential of one type that was issued to a wallet, with client-side search and paging. */
export const IssuedCredentialsModal = ({ credentialScopeName, onClose }: IssuedCredentialsModalProps) => {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();
    const canManage = hasManageRole(context);
    const columnCount = canManage ? 4 : 3;

    const [revokeTarget, setRevokeTarget] = useState<IssuedCredential>();
    const ofThisType = useMemo(
        () => (all: IssuedCredential[]) => all.filter(credential => credential.credentialType === credentialScopeName),
        [credentialScopeName],
    );
    const { data: issued, refetch } = useIssuedVerifiableCredentials(ofThisType);
    const { page, toolbarProps } = useClientPagination(issued, matches);

    // Captured once when the modal opens; good enough for "expired" labels.
    const [now] = useState(() => Date.now());
    const dateTime = (value?: number) => (value ? formatDate(new Date(value), context.environment.locale) : "—");

    const revoke = useAccountMutation(
        (api, credential: IssuedCredential) => revokeIssuedVerifiableCredential(api, credential.id ?? ""),
        {
            invalidates: [accountKeys.issuedVerifiableCredentials()],
            onSuccess: () => toast.add({ title: t("issuedCredentialRevokeSuccess"), type: "success" }),
            onError: error => toastApiError(t, "issuedCredentialRevokeError", error),
        },
    );

    return (
        <>
            <Dialog
                open
                onOpenChange={isOpen => {
                    if (!isOpen) {
                        onClose();
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t("issuedCredentials")}: {credentialScopeName}
                        </DialogTitle>
                        <DialogDescription className="sr-only">{t("issuedCredentials")}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <DataTableToolbar
                            {...toolbarProps}
                            searchPlaceholder={t("search", { defaultValue: "Search" })}
                            onRefresh={() => void refetch()}
                        />
                        <div className="rounded-(--radius) border border-border">
                            <Table aria-label={t("issuedCredentials")}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("issuedCredentialsIssuedAt")}</TableHead>
                                        <TableHead>{t("issuedCredentialsExpiresAt")}</TableHead>
                                        <TableHead>{t("issuedCredentialsWalletClient")}</TableHead>
                                        {canManage && (
                                            <TableHead className="w-px">
                                                <span className="sr-only">{t("doRevoke")}</span>
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!issued && <TableLoadingRow colSpan={columnCount} />}
                                    {issued && page.length === 0 && (
                                        <TableEmptyRow colSpan={columnCount}>{t("noIssuedCredentials")}</TableEmptyRow>
                                    )}
                                    {page.map(credential => {
                                        const isExpired = !!credential.expiresAt && credential.expiresAt < now;
                                        const clientName = credential.clientName || credential.clientId;

                                        return (
                                            <TableRow key={credential.id}>
                                                <TableCell>{dateTime(credential.issuedAt)}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-2",
                                                            isExpired && "text-destructive",
                                                        )}
                                                    >
                                                        {isExpired && <TriangleAlertIcon className="size-4" />}
                                                        {dateTime(credential.expiresAt)}
                                                        {isExpired && (
                                                            <Badge variant="destructive">
                                                                {t("expired", { defaultValue: "Expired" })}
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {!clientName ? (
                                                        "—"
                                                    ) : credential.clientBaseUrl ? (
                                                        <a
                                                            href={credential.clientBaseUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={cn(
                                                                buttonVariants({ variant: "link" }),
                                                                "h-auto p-0",
                                                            )}
                                                        >
                                                            {label(t, clientName)}
                                                            <ExternalLinkIcon data-icon="inline-end" />
                                                        </a>
                                                    ) : (
                                                        label(t, clientName)
                                                    )}
                                                </TableCell>
                                                {canManage && (
                                                    <TableCell>
                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => setRevokeTarget(credential)}
                                                            >
                                                                {t("doRevoke")}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            {t("close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={revokeTarget !== undefined}
                onOpenChange={isOpen => {
                    if (!isOpen) {
                        setRevokeTarget(undefined);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("revokeIssuedCredentialTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("deleteIssuedCredentialConfirm")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("doCancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                if (revokeTarget) {
                                    revoke.mutate(revokeTarget);
                                }
                                setRevokeTarget(undefined);
                            }}
                        >
                            {t("doRevoke")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
