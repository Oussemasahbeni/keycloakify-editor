import type { Attribute } from "@keycloakify/login-ui/KcContext";
import {
    getButtonToDisplayForMultivaluedAttributeField,
    type FormAction,
} from "@keycloakify/login-ui/useUserProfileForm";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";

export function AddRemoveButtonsMultiValuedAttribute(props: {
    attribute: Attribute;
    values: string[];
    fieldIndex: number;
    dispatchFormAction: React.Dispatch<Extract<FormAction, { action: "update" }>>;
}) {
    const { attribute, values, fieldIndex, dispatchFormAction } = props;

    const { msg } = useI18n();

    const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({
        attribute,
        values,
        fieldIndex,
    });

    const idPostfix = `-${attribute.name}-${fieldIndex + 1}`;

    return (
        <div className="mt-2 flex items-center gap-2">
            {hasRemove && (
                <Button
                    id={`kc-remove${idPostfix}`}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        dispatchFormAction({
                            action: "update",
                            name: attribute.name,
                            valueOrValues: values.filter((_, i) => i !== fieldIndex),
                        })
                    }
                >
                    {msg("remove")}
                </Button>
            )}
            {hasAdd && (
                <Button
                    id={`kc-add${idPostfix}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        dispatchFormAction({
                            action: "update",
                            name: attribute.name,
                            valueOrValues: [...values, ""],
                        })
                    }
                >
                    {msg("addValue")}
                </Button>
            )}
        </div>
    );
}
