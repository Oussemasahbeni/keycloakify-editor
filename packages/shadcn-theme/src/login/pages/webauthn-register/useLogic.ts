import { useRef } from "react";
import { base64url } from "rfc4648";
import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

// see https://github.com/keycloak/keycloak/blob/main/themes/src/main/resources/theme/base/login/resources/js/webauthnRegister.js

export type RegisterOptions = {
    challenge: string;
    rpId: string;
    rpEntityName: string;
    userid: string;
    username: string;
    signatureAlgorithms: string[];
    attestationConveyancePreference?: string;
    authenticatorAttachment?: string;
    requireResidentKey?: string; // deprecated: 'Yes' | 'No' | 'not specified'
    residentKey?: string; // 'required' | 'preferred' | 'discouraged' | 'not specified'
    userVerificationRequirement?: string;
    createTimeout: number;
    excludeCredentialIds: string | undefined; // Comma-separated string
};

export type WebAuthnRegisterResult =
    | {
          success: true;
          clientDataJSON: string;
          attestationObject: string;
          publicKeyCredentialId: string;
          transports: string;
      }
    | { success: false; error: string };

export function useLogic() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "webauthn-register.ftl");

    const { msgStr } = useI18n();

    const registerFormRef = useRef<HTMLFormElement>(null);
    // Guards against concurrent navigator.credentials.create() calls on double-click
    // (Keycloak's script registers its click listener with `{ once: true }`).
    const isRegisteringRef = useRef(false);

    const submitRegister = (result: WebAuthnRegisterResult, label?: string) => {
        const form = registerFormRef.current;
        assert(form !== null);

        const getInput = (name: string) => {
            const input = form.elements.namedItem(name);
            assert(input instanceof HTMLInputElement, `Missing hidden input: ${name}`);
            return input;
        };

        if (result.success) {
            getInput("clientDataJSON").value = result.clientDataJSON;
            getInput("attestationObject").value = result.attestationObject;
            getInput("publicKeyCredentialId").value = result.publicKeyCredentialId;
            getInput("transports").value = result.transports;
            if (label) getInput("authenticatorLabel").value = label;
        } else {
            getInput("error").value = result.error;
        }

        form.submit();
    };

    const onRegisterClick = async () => {
        if (isRegisteringRef.current) return;
        isRegisteringRef.current = true;

        const result = await webAuthnRegister({
            challenge: kcContext.challenge,
            userid: kcContext.userid,
            username: kcContext.username,
            signatureAlgorithms: kcContext.signatureAlgorithms,
            rpEntityName: kcContext.rpEntityName,
            rpId: kcContext.rpId,
            attestationConveyancePreference: kcContext.attestationConveyancePreference,
            authenticatorAttachment: kcContext.authenticatorAttachment,
            requireResidentKey: kcContext.requireResidentKey,
            residentKey: kcContext.residentKey,
            userVerificationRequirement: kcContext.userVerificationRequirement,
            createTimeout:
                typeof kcContext.createTimeout === "string" ? Number(kcContext.createTimeout) : kcContext.createTimeout,
            excludeCredentialIds: kcContext.excludeCredentialIds,
        });

        if (result.success) {
            const initLabel = msgStr("webauthn-registration-init-label");
            const initLabelPrompt = msgStr("webauthn-registration-init-label-prompt");

            let label = window.prompt(initLabelPrompt, initLabel);
            if (label === null) label = initLabel;

            submitRegister(result, label);
        } else {
            submitRegister(result);
        }
    };

    return {
        registerFormRef,
        onRegisterClick,
    };
}

async function webAuthnRegister(options: RegisterOptions): Promise<WebAuthnRegisterResult> {
    const {
        challenge,
        rpId,
        rpEntityName,
        userid,
        username,
        signatureAlgorithms,
        attestationConveyancePreference,
        authenticatorAttachment,
        requireResidentKey,
        residentKey,
        userVerificationRequirement,
        createTimeout,
        excludeCredentialIds,
    } = options;

    if (!window.PublicKeyCredential) {
        return { success: false, error: "WebAuthnUnsupportedBrowser" };
    }

    // Build Public Key Options
    const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(base64url.parse(challenge, { loose: true })),
        rp: { id: rpId, name: rpEntityName },
        user: {
            id: new Uint8Array(base64url.parse(userid, { loose: true })),
            name: username,
            displayName: username,
        },
        pubKeyCredParams: [],
        timeout: createTimeout !== 0 ? createTimeout * 1000 : undefined,
        excludeCredentials: [],
    };

    // Map Algorithms
    if (signatureAlgorithms.length === 0) {
        publicKey.pubKeyCredParams.push({ type: "public-key", alg: -7 });
    } else {
        signatureAlgorithms.forEach(alg => {
            publicKey.pubKeyCredParams.push({
                type: "public-key",
                alg: Number(alg),
            });
        });
    }

    // Authenticator Selection
    const authSelect: AuthenticatorSelectionCriteria = {};
    let isAuthSelectSpecified = false;

    if (authenticatorAttachment && authenticatorAttachment !== "not specified") {
        authSelect.authenticatorAttachment = authenticatorAttachment as AuthenticatorAttachment;
        isAuthSelectSpecified = true;
    }

    if (residentKey && residentKey !== "not specified") {
        // residentKey is the current spec field and the source of truth. requireResidentKey is
        // deprecated but still set for older clients: it is true iff residentKey is "required".
        authSelect.residentKey = residentKey as ResidentKeyRequirement;
        authSelect.requireResidentKey = residentKey === "required";
        isAuthSelectSpecified = true;
    } else if (requireResidentKey && requireResidentKey !== "not specified") {
        // Fall back to the deprecated option when residentKey is not available in older Keycloak contexts.
        if (requireResidentKey === "Yes") {
            authSelect.residentKey = "required";
            authSelect.requireResidentKey = true;
        } else {
            authSelect.residentKey = "discouraged";
            authSelect.requireResidentKey = false;
        }
        isAuthSelectSpecified = true;
    }

    if (userVerificationRequirement && userVerificationRequirement !== "not specified") {
        authSelect.userVerification = userVerificationRequirement as UserVerificationRequirement;
        isAuthSelectSpecified = true;
    }

    if (isAuthSelectSpecified) {
        publicKey.authenticatorSelection = authSelect;
    }

    // Attestation
    if (attestationConveyancePreference && attestationConveyancePreference !== "not specified") {
        publicKey.attestation = attestationConveyancePreference as AttestationConveyancePreference;
    }

    // Exclude Credentials (prevent registering the same key twice)
    if (excludeCredentialIds) {
        const ids = excludeCredentialIds.split(",").filter(id => id !== "");
        publicKey.excludeCredentials = ids.map(id => ({
            type: "public-key",
            id: new Uint8Array(base64url.parse(id, { loose: true })),
        }));
    }

    try {
        // Call Browser API
        const credential = (await navigator.credentials.create({
            publicKey,
        })) as PublicKeyCredential;

        // Type Narrowing & Formatting
        if (!(credential instanceof PublicKeyCredential)) {
            throw new Error("Created credential is not a PublicKeyCredential");
        }

        const response = credential.response;
        if (!(response instanceof AuthenticatorAttestationResponse)) {
            throw new Error("Response is not an AuthenticatorAttestationResponse");
        }

        // Handle Transports
        let transports = "";
        if (typeof response.getTransports === "function") {
            const transportsList = response.getTransports();
            if (transportsList && Array.isArray(transportsList)) {
                transports = transportsList.join(",");
            }
        }

        // Success
        return {
            success: true,
            clientDataJSON: base64url.stringify(new Uint8Array(response.clientDataJSON), {
                pad: false,
            }),
            attestationObject: base64url.stringify(new Uint8Array(response.attestationObject), {
                pad: false,
            }),
            publicKeyCredentialId: base64url.stringify(new Uint8Array(credential.rawId), {
                pad: false,
            }),
            transports,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            // Keep the DOMException name in the posted string ("InvalidStateError: ...") — the server
            // classifies the error by matching on it (see keycloak/keycloak#50654).
            error: String(error),
        };
    }
}
