import { assert } from "tsafe/assert";

import { Input } from "#/components/ui/input";
import { InputGroupInput } from "#/components/ui/input-group";
import { useI18n } from "#/login/i18n.ts";

import { AddRemoveButtonsMultiValuedAttribute } from "./AddRemoveButtonsMultiValuedAttribute";
import { FieldErrors } from "./FieldErrors";
import type { InputFieldByTypeProps } from "./InputFieldByType";

export function InputTag(props: InputFieldByTypeProps & { fieldIndex: number | undefined; isInGroup?: boolean }) {
    const { attribute, fieldIndex, dispatchFormAction, valueOrValues, displayableErrors, isInGroup = false } = props;

    const { advancedMsgStr } = useI18n();

    const InputComponent = isInGroup ? InputGroupInput : Input;
    return (
        <>
            <InputComponent
                type={(() => {
                    const { inputType } = attribute.annotations;

                    if (inputType?.startsWith("html5-")) {
                        return inputType.slice(6);
                    }

                    return inputType ?? "text";
                })()}
                id={attribute.name}
                name={attribute.name}
                value={(() => {
                    if (fieldIndex !== undefined) {
                        assert(Array.isArray(valueOrValues));
                        return valueOrValues[fieldIndex];
                    }

                    assert(typeof valueOrValues === "string");

                    return valueOrValues;
                })()}
                aria-invalid={displayableErrors.length !== 0}
                disabled={attribute.readOnly}
                autoComplete={attribute.autocomplete}
                placeholder={
                    attribute.annotations.inputTypePlaceholder === undefined
                        ? undefined
                        : advancedMsgStr(attribute.annotations.inputTypePlaceholder)
                }
                pattern={attribute.annotations.inputTypePattern}
                size={
                    attribute.annotations.inputTypeSize === undefined
                        ? undefined
                        : parseInt(`${attribute.annotations.inputTypeSize}`)
                }
                maxLength={
                    attribute.annotations.inputTypeMaxlength === undefined
                        ? undefined
                        : parseInt(`${attribute.annotations.inputTypeMaxlength}`)
                }
                minLength={
                    attribute.annotations.inputTypeMinlength === undefined
                        ? undefined
                        : parseInt(`${attribute.annotations.inputTypeMinlength}`)
                }
                max={attribute.annotations.inputTypeMax}
                min={attribute.annotations.inputTypeMin}
                step={attribute.annotations.inputTypeStep}
                {...Object.fromEntries(
                    Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]),
                )}
                onChange={event =>
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: (() => {
                            if (fieldIndex !== undefined) {
                                assert(Array.isArray(valueOrValues));

                                return valueOrValues.map((value, i) => {
                                    if (i === fieldIndex) {
                                        return event.target.value;
                                    }

                                    return value;
                                });
                            }

                            return event.target.value;
                        })(),
                    })
                }
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: fieldIndex,
                    })
                }
            />
            {(() => {
                if (fieldIndex === undefined) {
                    return null;
                }

                assert(Array.isArray(valueOrValues));

                const values = valueOrValues;

                return (
                    <>
                        <FieldErrors
                            attribute={attribute}
                            displayableErrors={displayableErrors}
                            fieldIndex={fieldIndex}
                        />
                        <AddRemoveButtonsMultiValuedAttribute
                            attribute={attribute}
                            values={values}
                            fieldIndex={fieldIndex}
                            dispatchFormAction={dispatchFormAction}
                        />
                    </>
                );
            })()}
        </>
    );
}
