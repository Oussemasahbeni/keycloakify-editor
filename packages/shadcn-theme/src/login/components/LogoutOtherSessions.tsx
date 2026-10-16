import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldLabel } from "#/components/ui/field";
import { useI18n } from "#/login/i18n.ts";

export function LogoutOtherSessions() {
    const { msg } = useI18n();

    return (
        <Field orientation="horizontal">
            <Checkbox id="logout-sessions" name="logout-sessions" value="on" />
            <FieldLabel htmlFor="logout-sessions">{msg("logoutOtherSessions")}</FieldLabel>
        </Field>
    );
}
