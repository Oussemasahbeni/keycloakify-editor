import type { Attribute } from "@keycloakify/login-ui/KcContext";
import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";

export function GroupLabel(props: {
    attribute: Attribute;
    groupNameRef: {
        current: string;
    };
}) {
    const { attribute, groupNameRef } = props;

    const { advancedMsg } = useI18n();

    if (attribute.group?.name !== groupNameRef.current) {
        groupNameRef.current = attribute.group?.name ?? "";

        if (groupNameRef.current !== "") {
            assert(attribute.group !== undefined);

            return (
                <div
                    className="flex flex-col gap-4 rounded-lg border bg-card p-4"
                    {...Object.fromEntries(
                        Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [
                            `data-${key}`,
                            value,
                        ]),
                    )}
                >
                    {(() => {
                        const groupDisplayHeader = attribute.group.displayHeader ?? "";
                        const groupHeaderText =
                            groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

                        return (
                            <div>
                                <h3 id={`header-${attribute.group.name}`} className="text-lg font-semibold">
                                    {groupHeaderText}
                                </h3>
                            </div>
                        );
                    })()}
                    {(() => {
                        const groupDisplayDescription = attribute.group.displayDescription ?? "";

                        if (groupDisplayDescription !== "") {
                            const groupDescriptionText = advancedMsg(groupDisplayDescription);

                            return (
                                <div>
                                    <p
                                        id={`description-${attribute.group.name}`}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {groupDescriptionText}
                                    </p>
                                </div>
                            );
                        }

                        return null;
                    })()}
                </div>
            );
        }
    }

    return null;
}
