/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/applications/Applications.tsx" --revert
 */

import { CheckIcon, ChevronRightIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { toast } from "#/components/ui/toast";
import { cn } from "#/lib/utils";

import { type AccountEnvironment } from "..";
import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import { deleteConsent } from "../api/methods";
import { accountKeys, useAccountMutation, useApplications } from "../api/queries";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Page } from "../components/page/Page";
import { TableEmptyRow, TableLoadingRow } from "../components/TableStates";
import { formatDate } from "../utils/formatDate";
import { toastApiError } from "../utils/toastError";

function Detail({ term, children }: { term: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="font-medium wrap-break-word">{children}</dd>
        </div>
    );
}

export const Applications = () => {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();

    const { data: applications } = useApplications();
    const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());

    const toggleOpen = (clientId: string) =>
        setOpenIds(prev => {
            const next = new Set(prev);
            if (!next.delete(clientId)) {
                next.add(clientId);
            }
            return next;
        });

    const removeConsent = useAccountMutation((api, id: string) => deleteConsent(api, id), {
        invalidates: [accountKeys.applications()],
        onSuccess: () => toast.add({ title: t("removeConsentSuccess"), type: "success" }),
        onError: error => toastApiError(t, "removeConsentError", error),
    });

    return (
        <Page title={t("application")} description={t("applicationsIntroMessage")}>
            <div
                id="applications-list"
                className="rounded-(--radius) border border-border bg-card text-card-foreground"
            >
                <Table aria-label={t("application")}>
                    <TableHeader>
                        <TableRow id="applications-list-header">
                            <TableHead className="w-10">
                                <span className="sr-only">{t("applicationDetails", { clientId: "" })}</span>
                            </TableHead>
                            <TableHead>{t("name")}</TableHead>
                            <TableHead>{t("applicationType")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    {applications === undefined && (
                        <TableBody>
                            <TableLoadingRow colSpan={4} />
                        </TableBody>
                    )}
                    {applications?.length === 0 && (
                        <TableBody>
                            <TableEmptyRow colSpan={4}>
                                {t("noApplications", { defaultValue: "No applications" })}
                            </TableEmptyRow>
                        </TableBody>
                    )}
                    {applications?.map(application => {
                        const name = label(t, application.clientName || application.clientId);
                        const contentId = `content-${application.clientId}`;

                        return (
                            <TableBody key={application.clientId} data-testid="applications-list-item">
                                <TableRow data-state={openIds.has(application.clientId) ? "selected" : undefined}>
                                    <TableCell>
                                        <Button
                                            id={`toggle-${application.clientId}`}
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-expanded={openIds.has(application.clientId)}
                                            aria-controls={contentId}
                                            aria-label={t("applicationDetails", { clientId: application.clientId })}
                                            onClick={() => toggleOpen(application.clientId)}
                                        >
                                            <ChevronRightIcon
                                                className={cn(
                                                    "transition-transform rtl:-scale-x-100",
                                                    openIds.has(application.clientId) && "rotate-90",
                                                )}
                                            />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {application.effectiveUrl ? (
                                            <a
                                                href={application.effectiveUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn(
                                                    buttonVariants({ variant: "link" }),
                                                    "title-case h-auto p-0",
                                                )}
                                            >
                                                {name}
                                                <ExternalLinkIcon data-icon="inline-end" />
                                            </a>
                                        ) : (
                                            name
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {application.userConsentRequired ? t("thirdPartyApp") : t("internalApp")}
                                        {application.offlineAccess ? `, ${t("offlineAccess")}` : ""}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={application.inUse ? "secondary" : "outline"}>
                                            {application.inUse ? t("inUse") : t("notInUse")}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow
                                    id={contentId}
                                    hidden={!openIds.has(application.clientId)}
                                    className="hover:bg-transparent"
                                >
                                    <TableCell colSpan={4} className="bg-muted/20 p-0 whitespace-normal">
                                        <div className="flex flex-col gap-4 px-4 py-4 sm:ps-14">
                                            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                                                <Detail term={t("client")}>{application.clientId}</Detail>
                                                {application.description && (
                                                    <Detail term={t("description")}>{application.description}</Detail>
                                                )}
                                                {application.effectiveUrl && (
                                                    <Detail term="URL">{application.effectiveUrl.split('"')}</Detail>
                                                )}
                                                {application.consent && (
                                                    <>
                                                        <Detail term={t("hasAccessTo")}>
                                                            <ul className="flex flex-col gap-1">
                                                                {application.consent.grantedScopes.map(scope => (
                                                                    <li
                                                                        key={scope.id}
                                                                        className="flex items-center gap-1.5"
                                                                    >
                                                                        <CheckIcon className="size-4 text-success" />
                                                                        {t(scope.name, scope.displayText)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </Detail>
                                                        {application.tosUri && (
                                                            <Detail term={t("termsOfService")}>
                                                                {application.tosUri}
                                                            </Detail>
                                                        )}
                                                        {application.policyUri && (
                                                            <Detail term={t("privacyPolicy")}>
                                                                {application.policyUri}
                                                            </Detail>
                                                        )}
                                                        {application.logoUri && (
                                                            <Detail term={t("logo")}>
                                                                <img
                                                                    src={application.logoUri}
                                                                    alt=""
                                                                    className="max-h-12"
                                                                />
                                                            </Detail>
                                                        )}
                                                        <Detail term={t("accessGrantedOn")}>
                                                            {formatDate(
                                                                new Date(application.consent.createdDate),
                                                                context.environment.locale,
                                                            )}
                                                        </Detail>
                                                    </>
                                                )}
                                            </dl>
                                            {(application.consent || application.offlineAccess) && (
                                                <div className="flex flex-col gap-3 border-t border-border pt-4">
                                                    <div>
                                                        <ConfirmDialog
                                                            trigger={<Button variant="outline" size="sm" />}
                                                            label={t("removeAccess")}
                                                            title={t("removeAccess")}
                                                            description={t("removeModalMessage", {
                                                                name: application.clientId,
                                                            })}
                                                            confirmLabel={t("confirm")}
                                                            cancelLabel={t("cancel")}
                                                            destructive
                                                            onConfirm={() => removeConsent.mutate(application.clientId)}
                                                        />
                                                    </div>
                                                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                                        <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                                                        {t("infoMessage")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        );
                    })}
                </Table>
            </div>
        </Page>
    );
};

export default Applications;
