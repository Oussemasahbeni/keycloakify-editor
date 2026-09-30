import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";

import { Checkbox } from "#/components/ui/checkbox";
import { FieldError } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-medium">{msg("termsTitle")}</h3>
                <div className="text-sm text-muted-foreground">{msg("termsText")}</div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="termsAccepted"
                        name="termsAccepted"
                        checked={areTermsAccepted}
                        onCheckedChange={checked => onAreTermsAcceptedValueChange(checked)}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    <Label htmlFor="termsAccepted" className="cursor-pointer text-sm font-medium">
                        {msg("acceptTerms")}
                    </Label>
                </div>

                {messagesPerField.existsError("termsAccepted") && (
                    <FieldError id="input-error-terms-accepted">
                        <span
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(messagesPerField.get("termsAccepted")),
                            }}
                        />
                    </FieldError>
                )}
            </div>
        </div>
    );
}
