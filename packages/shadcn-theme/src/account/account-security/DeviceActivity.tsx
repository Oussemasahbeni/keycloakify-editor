/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/DeviceActivity.tsx" --revert
 */

import { CheckIcon, MonitorIcon, RefreshCwIcon, SmartphoneIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";

import { type AccountEnvironment } from "..";
import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import { deleteSession } from "../api/methods";
import { accountKeys, useAccountMutation, useDevices } from "../api/queries";
import type { ClientRepresentation, DeviceRepresentation, SessionRepresentation } from "../api/representations";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Page } from "../components/page/Page";
import { formatDate } from "../utils/formatDate";
import { toastApiError } from "../utils/toastError";

/** The current device first, and its current session first, so the user's own session leads the list. */
function moveCurrentToTop(devices: DeviceRepresentation[]) {
    const index = devices.findIndex(device => device.current);
    if (index < 0) {
        return devices;
    }
    const device = devices[index];
    const sessionIndex = device.sessions.findIndex(session => session.current);
    const current =
        sessionIndex < 0
            ? device
            : {
                  ...device,
                  sessions: [device.sessions[sessionIndex], ...device.sessions.filter((_, i) => i !== sessionIndex)],
              };
    return [current, ...devices.filter((_, i) => i !== index)];
}

export const DeviceActivity = () => {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();

    const { data: devices, refetch } = useDevices(moveCurrentToTop);

    const signOutAll = async () => {
        await deleteSession(context);
        await context.keycloak.logout();
    };

    const signOut = useAccountMutation(
        (api, { session }: { session: SessionRepresentation; device: DeviceRepresentation }) =>
            deleteSession(api, session.id),
        {
            invalidates: [accountKeys.devices()],
            onSuccess: (_, { session, device }) =>
                toast.add({
                    title: t("signedOutSession", { browser: session.browser, os: device.os }),
                    type: "success",
                }),
            onError: error => toastApiError(t, "errorSignOutMessage", error),
        },
    );
    const signOutSession = (session: SessionRepresentation, device: DeviceRepresentation) =>
        signOut.mutate({ session, device });

    const clientNames = (clients: ClientRepresentation[]) =>
        clients.map(client => (client.clientName !== "" ? label(t, client.clientName) : client.clientId)).join(", ");

    const formatEpoch = (seconds: number) => formatDate(new Date(seconds * 1000), context.environment.locale);

    if (!devices) {
        return (
            <div className="flex justify-center p-8">
                <Spinner className="size-6" />
            </div>
        );
    }

    const hasOtherSessions = devices.length > 1 || devices[0].sessions.length > 1;

    return (
        <Page title={t("deviceActivity")} description={t("signedInDevicesExplanation")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{t("signedInDevices")}</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Button id="refresh-page" variant="ghost" size="sm" onClick={() => void refetch()}>
                        <RefreshCwIcon data-icon="inline-start" />
                        {t("refreshPage")}
                    </Button>
                    {hasOtherSessions && (
                        <ConfirmDialog
                            trigger={<Button variant="outline" size="sm" />}
                            label={t("signOutAllDevices")}
                            title={t("signOutAllDevices")}
                            description={t("signOutAllDevicesWarning")}
                            confirmLabel={t("confirm")}
                            cancelLabel={t("cancel")}
                            destructive
                            onConfirm={signOutAll}
                        />
                    )}
                </div>
            </div>

            <div className="signed-in-device-list flex flex-col gap-4" aria-label={t("signedInDevices")}>
                {devices.flatMap(device =>
                    device.sessions.map((session, index) => {
                        const os = device.os.toLowerCase().includes("unknown")
                            ? t("unknownOperatingSystem")
                            : device.os;
                        const osVersion = device.osVersion.toLowerCase().includes("unknown") ? "" : device.osVersion;

                        return (
                            <Card key={session.id} data-testid={`row-${index}`} size="sm">
                                <CardHeader>
                                    <CardTitle className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2">
                                            {device.mobile ? (
                                                <SmartphoneIcon className="size-4 text-muted-foreground" />
                                            ) : (
                                                <MonitorIcon className="size-4 text-muted-foreground" />
                                            )}
                                            <span className="session-title">
                                                {os} {osVersion} / {session.browser}
                                            </span>
                                        </span>
                                        {session.current && (
                                            <Badge className="bg-success/10 text-success">
                                                <CheckIcon />
                                                {t("currentSession")}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>{session.ipAddress}</CardDescription>
                                    {!session.current && (
                                        <CardAction>
                                            <ConfirmDialog
                                                trigger={<Button variant="outline" size="sm" />}
                                                label={t("signOut")}
                                                title={t("signOut")}
                                                description={t("signOutWarning")}
                                                confirmLabel={t("confirm")}
                                                cancelLabel={t("cancel")}
                                                destructive
                                                onConfirm={() => signOutSession(session, device)}
                                            />
                                        </CardAction>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <dl className="signed-in-device-grid grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            [t("ipAddress"), session.ipAddress],
                                            [t("lastAccessedOn"), formatEpoch(session.lastAccess)],
                                            [t("clients"), clientNames(session.clients)],
                                            [t("started"), formatEpoch(session.started)],
                                            [t("expires"), formatEpoch(session.expires)],
                                        ].map(([term, value]) => (
                                            <div key={term} className="flex flex-col gap-0.5">
                                                <dt className="text-muted-foreground">{term}</dt>
                                                <dd className="font-medium wrap-break-word">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </CardContent>
                            </Card>
                        );
                    }),
                )}
            </div>
        </Page>
    );
};

export default DeviceActivity;
