import type { Attribute } from "@keycloakify/login-ui/KcContext";

import { useI18n } from "#/login/i18n.ts";

export function InputLabel(props: { attribute: Attribute; option: string }) {
    const { attribute, option } = props;
    const { advancedMsg } = useI18n();

    if (attribute.annotations.inputOptionLabels !== undefined) {
        const { inputOptionLabels } = attribute.annotations;

        return advancedMsg(inputOptionLabels[option] ?? option);
    }

    if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
        return advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
    }

    return <>{option}</>;
}
