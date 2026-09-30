import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { useI18n } from "#/login/i18n.ts";

export function LogoutOtherSessions() {
    const { msg } = useI18n();

    return (
        <div className="flex items-center gap-2">
            <Checkbox id="logout-sessions" name="logout-sessions" value="on" />
            <Label htmlFor="logout-sessions" className="cursor-pointer text-sm font-medium">
                {msg("logoutOtherSessions")}
            </Label>
        </div>
    );
}
