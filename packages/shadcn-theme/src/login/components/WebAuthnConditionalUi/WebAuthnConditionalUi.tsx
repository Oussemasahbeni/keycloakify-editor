import { Fingerprint } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";

import { useLogic, type UseLogicProps } from "./useLogic";

export function WebAuthnConditionalUI(props: UseLogicProps) {
    const { msgStr } = useI18n();

    const { webAuthnFormRef, onPasskeyDoAuthenticateClick } = useLogic(props);

    const { loginAction } = props;

    return (
        <>
            <form id="webauth" action={loginAction} method="post" hidden ref={webAuthnFormRef}>
                <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                <input type="hidden" id="authenticatorData" name="authenticatorData" />
                <input type="hidden" id="signature" name="signature" />
                <input type="hidden" id="credentialId" name="credentialId" />
                <input type="hidden" id="userHandle" name="userHandle" />
                <input type="hidden" id="error" name="error" />
            </form>

            <Button
                id="authenticateWebAuthnButton"
                type="button"
                className="mt-4 w-full"
                variant="outline"
                onClick={onPasskeyDoAuthenticateClick}
            >
                <Fingerprint className="size-4" />
                {msgStr("passkey-doAuthenticate")}
            </Button>
        </>
    );
}
