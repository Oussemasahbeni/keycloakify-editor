import { assert } from "tsafe/assert";

import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n.ts";

import type { InputFieldByTypeProps } from "./InputFieldByType";

export function TextareaTag(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, displayableErrors, valueOrValues } = props;

    const { advancedMsgStr } = useI18n();

    assert(typeof valueOrValues === "string");

    const value = valueOrValues;

    return (
        <textarea
            id={attribute.name}
            name={attribute.name}
            className={cn(
                "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                displayableErrors.length !== 0 &&
                    "border-destructive ring-destructive/20 focus-visible:ring-destructive",
            )}
            aria-invalid={displayableErrors.length !== 0}
            disabled={attribute.readOnly}
            cols={
                attribute.annotations.inputTypeCols === undefined
                    ? undefined
                    : parseInt(`${attribute.annotations.inputTypeCols}`)
            }
            rows={
                attribute.annotations.inputTypeRows === undefined
                    ? undefined
                    : parseInt(`${attribute.annotations.inputTypeRows}`)
            }
            placeholder={
                attribute.annotations.inputTypePlaceholder === undefined
                    ? undefined
                    : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
            }
            maxLength={
                attribute.annotations.inputTypeMaxlength === undefined
                    ? undefined
                    : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
            }
            value={value}
            onChange={event =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: event.target.value,
                })
            }
            onBlur={() =>
                dispatchFormAction({
                    action: "focus lost",
                    name: attribute.name,
                    fieldIndex: undefined,
                })
            }
        />
    );
}
