/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/SigningIn.tsx" --revert
 */

import {
    InfoIcon,
    KeyRoundIcon,
    LifeBuoyIcon,
    PlusIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "#/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Spinner } from "#/components/ui/spinner";

import { type AccountEnvironment } from "..";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useCredentials } from "../api/queries";
import type {
    CredentialContainer,
    CredentialMetadataRepresentation,
    CredentialMetadataRepresentationMessage,
} from "../api/representations";
import { Page } from "../components/page/Page";
import { formatDate } from "../utils/formatDate";
import { joinPath } from "../utils/joinPath";

/** Keycloak sends message parameters as a positional array; i18next wants `{0: …, 1: …}`. */
function messageParams(message: CredentialMetadataRepresentationMessage) {
    return message.parameters?.reduce<Record<number, string>>((acc, value, index) => ({ ...acc, [index]: value }), {});
}

function CredentialTypeIcon({ type }: { type: string }) {
    const className = "size-5";

    if (type.startsWith("password")) return <KeyRoundIcon className={className} />;
    if (type.startsWith("otp")) return <SmartphoneIcon className={className} />;
    if (type.startsWith("recovery")) return <LifeBuoyIcon className={className} />;
    return <ShieldCheckIcon className={className} />;
}

type CredentialRowProps = {
    container: CredentialContainer;
    meta: CredentialMetadataRepresentation;
};

function CredentialRow({ container, meta }: CredentialRowProps) {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();
    const { login } = context.keycloak;

    const { credential } = meta;
    const isWebAuthn = container.type.startsWith("webauthn");
    const icon = meta.iconLight || meta.iconDark;
    const iconSrc = icon
        ? joinPath(context.environment.resourceUrl, "passkeys", icon)
        : joinPath(context.environment.resourceUrl, "favicon.svg");
    const iconDarkSrc = meta.iconDark
        ? joinPath(context.environment.resourceUrl, "passkeys", meta.iconDark)
        : undefined;
    const authenticatorProvider = meta.infoProperties?.find(p => p.key === "webauthn-authenticator-provider")
        ?.parameters?.[0];
    const infoProperties = meta.infoProperties?.filter(p => p.key !== "webauthn-authenticator-provider") ?? [];
    const warningTitle = meta.warningMessageTitle;
    const warningDescription = meta.warningMessageDescription;

    return (
        <div
            id={`cred-${credential.id}`}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4"
        >
            <div
                data-testrole="icon"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            >
                {isWebAuthn ? (
                    <>
                        <img
                            src={iconSrc}
                            alt=""
                            width={28}
                            height={28}
                            className={iconDarkSrc ? "dark:hidden" : undefined}
                        />
                        {iconDarkSrc && (
                            <img src={iconDarkSrc} alt="" width={28} height={28} className="hidden dark:block" />
                        )}
                    </>
                ) : (
                    <CredentialTypeIcon type={container.type} />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
                <div data-testrole="label" className="font-medium">
                    {t(credential.userLabel) || t(credential.type)}
                    {authenticatorProvider && (
                        <span className="ms-2 font-normal text-muted-foreground">{authenticatorProvider}</span>
                    )}
                </div>
                {credential.createdDate && (
                    <p data-testrole="created-at" className="text-muted-foreground">
                        <Trans
                            i18nKey="credentialCreatedAt"
                            values={{ date: formatDate(new Date(credential.createdDate), context.environment.locale) }}
                        >
                            <strong className="me-1 font-medium text-foreground"></strong>
                        </Trans>
                    </p>
                )}
                {(meta.infoMessage || infoProperties.length > 0 || (warningTitle && warningDescription)) && (
                    <div data-testrole="warning-message" className="flex flex-col gap-2 text-muted-foreground">
                        {meta.infoMessage && (
                            <p className="flex items-start gap-1.5">
                                <InfoIcon className="mt-0.5 size-4 shrink-0" />
                                <span>{t(meta.infoMessage.key, messageParams(meta.infoMessage))}</span>
                            </p>
                        )}
                        {infoProperties.length > 0 && (
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                {infoProperties.map(prop => (
                                    <div key={prop.key} className="contents">
                                        <dt className="text-muted-foreground">{t(prop.key)}</dt>
                                        <dd className="text-foreground">{prop.parameters?.[0] ?? ""}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {warningTitle && warningDescription && (
                            <div className="flex items-start gap-1.5 text-warning">
                                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                                <div>
                                    <p className="font-medium">{t(warningTitle.key, messageParams(warningTitle))}</p>
                                    <p>{t(warningDescription.key, messageParams(warningDescription))}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {(container.removeable || container.updateAction) && (
                <div
                    id={`action-${credential.id}`}
                    aria-label={t("updateCredAriaLabel")}
                    className="flex shrink-0 flex-wrap gap-2 sm:justify-end"
                >
                    {container.updateAction && (
                        <Button
                            variant="outline"
                            size="sm"
                            data-testrole="update"
                            onClick={() => login({ action: container.updateAction })}
                        >
                            {t("update")}
                        </Button>
                    )}
                    {container.removeable && (
                        <Button
                            variant="outline"
                            size="sm"
                            data-testrole="remove"
                            className="text-destructive hover:text-destructive"
                            onClick={() => login({ action: `delete_credential:${credential.id}` })}
                        >
                            {t("delete")}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export const SigningIn = () => {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();
    const { login } = context.keycloak;
    const { data: credentials } = useCredentials();

    if (!credentials) {
        return (
            <div className="flex justify-center p-8">
                <Spinner className="size-6" />
            </div>
        );
    }

    const categories = [...new Set(credentials.map(c => c.category))];

    return (
        <Page title={t("signingIn")} description={t("signingInDescription")}>
            {categories.map(category => (
                <section key={category} aria-labelledby={`${category}-categ-title`} className="flex flex-col gap-4">
                    <h2 id={`${category}-categ-title`} className="text-lg font-semibold">
                        {t(category)}
                    </h2>
                    {credentials
                        .filter(cred => cred.category === category)
                        .map(container => (
                            <Card key={container.type} data-testid={`${container.type}/credential-list`}>
                                <CardHeader>
                                    <CardTitle data-testid={`${container.type}/title`} className="cred-title">
                                        {t(container.displayName)}
                                    </CardTitle>
                                    <CardDescription data-testid={`${container.type}/help-text`}>
                                        {t(container.helptext)}
                                    </CardDescription>
                                    {container.createAction && (
                                        <CardAction>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                data-testid={`${container.type}/create`}
                                                onClick={() => login({ action: container.createAction })}
                                            >
                                                <PlusIcon data-icon="inline-start" />
                                                {t("setUpNew", { name: t(`${container.type}-display-name`) })}
                                            </Button>
                                        </CardAction>
                                    )}
                                </CardHeader>
                                <CardContent className="flex flex-col divide-y divide-border">
                                    {container.userCredentialMetadatas.length === 0 && (
                                        <p
                                            data-testid={`${container.type}/not-set-up`}
                                            className="text-sm text-muted-foreground"
                                        >
                                            {t("notSetUp", { name: t(container.displayName) })}
                                        </p>
                                    )}
                                    {container.userCredentialMetadatas.map(meta => (
                                        <CredentialRow key={meta.credential.id} container={container} meta={meta} />
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                </section>
            ))}
        </Page>
    );
};

export default SigningIn;
