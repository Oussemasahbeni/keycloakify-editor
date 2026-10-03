import type { Attribute } from "@keycloakify/login-ui/KcContext";
import type { JSX } from "@keycloakify/login-ui/tools/JSX";
import { useUserProfileForm, type FormAction, type FormFieldError } from "@keycloakify/login-ui/useUserProfileForm";
import { Fragment, useEffect } from "react";
import { assert } from "tsafe/assert";

import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { DO_MAKE_USER_CONFIRM_PASSWORD } from "./DO_MAKE_USER_CONFIRM_PASSWORD";
import { FieldErrors } from "./FieldErrors";
import { GroupLabel } from "./GroupLabel";
import { InputFieldByType } from "./InputFieldByType";

export type UserProfileFormFieldsProps = {
    onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
    BeforeField?: (props: BeforeAfterFieldProps) => JSX.Element | null;
    AfterField?: (props: BeforeAfterFieldProps) => JSX.Element | null;
};

type BeforeAfterFieldProps = {
    attribute: Attribute;
    dispatchFormAction: React.Dispatch<FormAction>;
    displayableErrors: FormFieldError[];
    valueOrValues: string | string[];
};

export function UserProfileFormFields(props: UserProfileFormFieldsProps) {
    const { onIsFormSubmittableValueChange, BeforeField, AfterField } = props;

    const { kcContext } = useKcContext();

    assert("profile" in kcContext);

    const i18n = useI18n();

    const { advancedMsg } = i18n;

    const {
        formState: { formFieldStates, isFormSubmittable },
        dispatchFormAction,
    } = useUserProfileForm({
        kcContext,
        i18n,
        doMakeUserConfirmPassword: DO_MAKE_USER_CONFIRM_PASSWORD,
    });

    useEffect(() => {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);

    return (
        <>
            {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }, index) => {
                return (
                    <Fragment key={attribute.name}>
                        <GroupLabel
                            attribute={attribute}
                            previousGroupName={formFieldStates[index - 1]?.attribute.group?.name ?? ""}
                        />
                        {BeforeField !== undefined && (
                            <BeforeField
                                attribute={attribute}
                                dispatchFormAction={dispatchFormAction}
                                displayableErrors={displayableErrors}
                                valueOrValues={valueOrValues}
                            />
                        )}
                        <Field
                            data-invalid={displayableErrors.length > 0 ? "true" : undefined}
                            style={{
                                display: attribute.annotations.inputType === "hidden" ? "none" : undefined,
                            }}
                        >
                            <FieldLabel htmlFor={attribute.name} className="gap-0.5">
                                {advancedMsg(attribute.displayName ?? "")}
                                {attribute.required && <span aria-hidden="true">*</span>}
                            </FieldLabel>
                            {attribute.annotations.inputHelperTextBefore !== undefined && (
                                <FieldDescription id={`form-help-text-before-${attribute.name}`} aria-live="polite">
                                    {advancedMsg(attribute.annotations.inputHelperTextBefore)}
                                </FieldDescription>
                            )}
                            <InputFieldByType
                                attribute={attribute}
                                valueOrValues={valueOrValues}
                                displayableErrors={displayableErrors}
                                dispatchFormAction={dispatchFormAction}
                            />
                            <FieldErrors
                                attribute={attribute}
                                displayableErrors={displayableErrors}
                                fieldIndex={undefined}
                            />
                            {attribute.annotations.inputHelperTextAfter !== undefined && (
                                <FieldDescription id={`form-help-text-after-${attribute.name}`} aria-live="polite">
                                    {advancedMsg(attribute.annotations.inputHelperTextAfter)}
                                </FieldDescription>
                            )}
                            {AfterField !== undefined && (
                                <AfterField
                                    attribute={attribute}
                                    dispatchFormAction={dispatchFormAction}
                                    displayableErrors={displayableErrors}
                                    valueOrValues={valueOrValues}
                                />
                            )}
                            {/* NOTE: Downloading of html5DataAnnotations scripts is done in the useUserProfileForm hook */}
                        </Field>
                    </Fragment>
                );
            })}
        </>
    );
}
