/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/groups/Groups.tsx" --revert
 */

import { CheckIcon, MinusIcon } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";

import { useGroups } from "../api/queries";
import type { Group } from "../api/representations";
import { Page } from "../components/page/Page";
import { TableEmptyRow, TableLoadingRow } from "../components/TableStates";

/** Adds the (inherited) parent groups of `group` to `groups`, walking up the path. */
function addParents(group: Group, groups: Group[], groupPaths: string[]) {
    const parentPath = group.path.slice(0, group.path.lastIndexOf("/"));

    if (parentPath && !groupPaths.includes(parentPath)) {
        const parent: Group = { name: parentPath.slice(parentPath.lastIndexOf("/") + 1), path: parentPath };
        groups.push(parent);
        groupPaths.push(parentPath);
        addParents(parent, groups, groupPaths);
    }
}

const identity = (groups: Group[]) => groups;

/** What Keycloak shows without "direct membership": every group plus its inherited parents. */
const withParents = (groups: Group[]) => {
    const result = [...groups];
    const paths = result.map(({ path }) => path);
    groups.forEach(group => addParents(group, result, paths));
    return result;
};

export const Groups = () => {
    const { t } = useTranslation();
    const directMembershipId = useId();
    const [directMembership, setDirectMembership] = useState(false);
    const { data: groups } = useGroups(directMembership ? identity : withParents);

    return (
        <Page
            title={t("groups")}
            description={t("groupDescriptionLabel")}
            actions={
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={directMembershipId}
                        data-testid="directMembership-checkbox"
                        checked={directMembership}
                        onCheckedChange={checked => setDirectMembership(checked)}
                    />
                    <Label htmlFor={directMembershipId}>{t("directMembership")}</Label>
                </div>
            }
        >
            <div id="groups-list" className="rounded-(--radius) border border-border bg-card text-card-foreground">
                <Table aria-label={t("groups")}>
                    <TableHeader>
                        <TableRow id="groups-list-columns-names">
                            <TableHead>{t("name")}</TableHead>
                            <TableHead>{t("path")}</TableHead>
                            <TableHead className="w-px text-end whitespace-nowrap">{t("directMembership")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups === undefined && <TableLoadingRow colSpan={3} />}
                        {groups?.length === 0 && <TableEmptyRow colSpan={3}>{t("noGroups", "—")}</TableEmptyRow>}
                        {groups?.map((group, index) => (
                            <TableRow key={group.path} id={`${index}-group`}>
                                <TableCell data-testid={`group[${index}].name`} className="font-medium">
                                    {group.name}
                                </TableCell>
                                <TableCell id={`${index}-group-path`} className="text-muted-foreground">
                                    {group.path}
                                </TableCell>
                                <TableCell id={`${index}-group-directMembership`} className=" text-start">
                                    {group.id != null ? (
                                        <>
                                            <CheckIcon aria-hidden="true" className="me-auto size-4 text-success" />
                                            <span className="sr-only">{t("directMembership")}</span>
                                        </>
                                    ) : (
                                        <MinusIcon
                                            aria-hidden="true"
                                            className="me-auto size-4 text-muted-foreground/60"
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Page>
    );
};

export default Groups;
