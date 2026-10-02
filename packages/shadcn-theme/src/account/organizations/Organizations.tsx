/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/organizations/Organizations.tsx" --revert
 */

import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { Building2Icon, CheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "#/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "#/components/ui/empty";
import { Spinner } from "#/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";

import { useOrganizations } from "../api/queries";
import { DataTableToolbar } from "../components/DataTableToolbar";
import { Page } from "../components/page/Page";
import { TableEmptyRow } from "../components/TableStates";
import { useClientPagination } from "../utils/useClientPagination";

/**
 * The account endpoint adds the user's membership type (`MANAGED` | `UNMANAGED`),
 * which the admin-client representation does not declare yet.
 */
type UserOrganization = OrganizationRepresentation & { membershipType?: string };

function membershipLabel(membershipType: string) {
    const normalized = membershipType.charAt(0).toUpperCase() + membershipType.slice(1).toLowerCase();
    return normalized;
}

/** The account API returns domains as plain strings; the admin type says objects. Handle both. */
function domainsOf(organization: OrganizationRepresentation) {
    return (organization.domains ?? []).map(domain =>
        typeof domain === "string" ? { name: domain, verified: false } : domain,
    );
}

function Domains({ organization }: { organization: OrganizationRepresentation }) {
    const domains = domainsOf(organization);

    if (domains.length === 0) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {domains.map(domain => (
                <Badge key={domain.name} variant="outline">
                    {domain.verified && <CheckIcon className="text-success" />}
                    {domain.name}
                </Badge>
            ))}
        </div>
    );
}

function matches(organization: OrganizationRepresentation, query: string) {
    const haystack = [
        organization.name,
        organization.description,
        ...domainsOf(organization).map(domain => domain.name),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(query.toLowerCase());
}

export const Organizations = () => {
    const { t } = useTranslation();
    const { data: userOrgs, refetch } = useOrganizations();
    const { page, toolbarProps } = useClientPagination<UserOrganization>(userOrgs, matches);

    if (!userOrgs) {
        return (
            <div className="flex justify-center p-8">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (userOrgs.length === 0) {
        return (
            <Page title={t("organizations")} description={t("organizationDescription")}>
                <Empty className="border border-border bg-card">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2Icon />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyUserOrganizations")}</EmptyTitle>
                        <EmptyDescription>{t("emptyUserOrganizationsInstructions")}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </Page>
        );
    }

    return (
        <Page title={t("organizations")} description={t("organizationDescription")}>
            <div className="flex flex-col gap-4">
                <DataTableToolbar
                    {...toolbarProps}
                    searchPlaceholder={t("searchOrganization")}
                    onRefresh={() => void refetch()}
                />

                <div className="rounded-(--radius) border border-border bg-card text-card-foreground">
                    <Table aria-label={t("organizationList")}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("name")}</TableHead>
                                <TableHead>{t("domains")}</TableHead>
                                <TableHead>{t("description")}</TableHead>
                                <TableHead>{t("membershipType", { defaultValue: "Membership type" })}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {page.length === 0 && (
                                <TableEmptyRow colSpan={4}>
                                    {t("noSearchResults", { defaultValue: "No search results" })}
                                </TableEmptyRow>
                            )}
                            {page.map(organization => (
                                <TableRow key={organization.id ?? organization.name}>
                                    <TableCell className="font-medium">
                                        <span className="inline-flex items-center gap-2">
                                            {organization.name}
                                            {organization.enabled === false && (
                                                <Badge variant="outline">
                                                    {t("disabled", { defaultValue: "Disabled" })}
                                                </Badge>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-normal">
                                        <Domains organization={organization} />
                                    </TableCell>
                                    <TableCell
                                        className="max-w-xs truncate text-muted-foreground"
                                        title={organization.description}
                                    >
                                        {organization.description || <span aria-hidden="true">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        {organization.membershipType ? (
                                            <Badge variant="secondary">
                                                {t(`membershipType.${organization.membershipType}`, {
                                                    defaultValue: membershipLabel(organization.membershipType),
                                                })}
                                            </Badge>
                                        ) : (
                                            <span aria-hidden="true" className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Page>
    );
};

export default Organizations;
