import { Building2 } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "select-organization.ftl");

    const { msg } = useI18n();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const formRef = useRef<HTMLFormElement>(null);
    const organizationInputRef = useRef<HTMLInputElement>(null);

    const onOrganizationClick = (organizationAlias: string) => (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!organizationInputRef.current || !formRef.current) {
            return;
        }

        organizationInputRef.current.value = organizationAlias;
        setIsSubmitting(true);

        if (typeof formRef.current.requestSubmit === "function") {
            formRef.current.requestSubmit();
            return;
        }

        formRef.current.submit();
    };

    const onSelectSubmit = () => {
        if (!organizationInputRef.current || !formRef.current || !selectedOrg) return;
        organizationInputRef.current.value = selectedOrg;
        setIsSubmitting(true);
        if (typeof formRef.current.requestSubmit === "function") {
            formRef.current.requestSubmit();
            return;
        }
        formRef.current.submit();
    };

    const organizations = kcContext.user.organizations ?? [];
    const useSelect = organizations.length > 3;

    return (
        <Template headerNode={msg("organization.selectTitle")}>
            <form ref={formRef} action={kcContext.url.loginAction} method="post">
                <div id="kc-user-organizations" className="flex flex-col gap-2">
                    <h2 className="text-base font-semibold">{msg("organization.select")}</h2>
                    {useSelect ? (
                        <div className="flex flex-col gap-3">
                            <Select
                                value={selectedOrg}
                                onValueChange={value => setSelectedOrg(value ?? "")}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={msg("organization.pickPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    {organizations.map(({ alias, name }) => (
                                        <SelectItem key={alias} value={alias}>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="size-4 text-muted-foreground" />
                                                {name ?? alias}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                className="w-full"
                                disabled={isSubmitting || !selectedOrg}
                                onClick={onSelectSubmit}
                            >
                                {msg("doContinue")}
                            </Button>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {organizations.map(({ alias, name }) => (
                                <li key={alias}>
                                    <Button
                                        id={`organization-${alias}`}
                                        type="button"
                                        variant="outline"
                                        onClick={onOrganizationClick(alias)}
                                        disabled={isSubmitting}
                                        className="flex h-auto w-full items-center justify-start gap-3 p-4 transition-colors hover:border-primary hover:bg-accent"
                                    >
                                        <Building2 className="size-5 shrink-0 text-muted-foreground" />
                                        <span className="text-sm font-medium">{name ?? alias}</span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input ref={organizationInputRef} type="hidden" name="kc.org" />
            </form>
        </Template>
    );
}
