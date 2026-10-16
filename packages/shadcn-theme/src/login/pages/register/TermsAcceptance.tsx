import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";

import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { useI18n } from "#/login/i18n.ts";
import type { KcContext } from "#/login/KcContext.ts";

export function TermsAcceptance(props: {
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

    const { msg } = useI18n();

    return (
        <FieldGroup>
            <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-medium">{msg("termsTitle")}</h3>
                <div className="text-sm text-muted-foreground">{msg("termsText")}</div>
            </div>

            <Field orientation="horizontal" data-invalid={messagesPerField.existsError("termsAccepted") || undefined}>
                <Checkbox
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={areTermsAccepted}
                    onCheckedChange={checked => onAreTermsAcceptedValueChange(checked)}
                    aria-invalid={messagesPerField.existsError("termsAccepted")}
                />
                <FieldContent>
                    <FieldLabel htmlFor="termsAccepted">{msg("acceptTerms")}</FieldLabel>
                    {messagesPerField.existsError("termsAccepted") && (
                        <FieldError id="input-error-terms-accepted">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.get("termsAccepted")),
                                }}
                            />
                        </FieldError>
                    )}
                </FieldContent>
            </Field>
        </FieldGroup>
    );
}
