import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { XCircle } from "lucide-react";
import { useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";
import { assert } from "tsafe/assert";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "code.ftl");

    const [copied, setCopied] = useState(false);

    const { msg } = useI18n();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(kcContext.code.code ?? "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <Template
            headerNode={kcContext.code.success ? msg("codeSuccessTitle") : msg("codeErrorTitle", kcContext.code.error)}
        >
            <div id="kc-code">
                {kcContext.code.success ? (
                    <>
                        <Field>
                            <FieldLabel htmlFor="code">{msg("copyCodeInstruction")}</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="code"
                                    defaultValue={kcContext.code.code}
                                    readOnly
                                    className="font-mono"
                                />
                                <InputGroupAddon align="inline-end">
                                    <Button
                                        onClick={handleCopy}
                                        variant="secondary"
                                        size="icon"
                                        className="size-4"
                                        aria-label="Copy code to clipboard"
                                    >
                                        {copied ? <MdCheck className="text-success" /> : <MdContentCopy />}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </>
                ) : (
                    kcContext.code.error && (
                        <Alert variant="error">
                            <XCircle />
                            <AlertDescription>
                                <p
                                    id="error"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(kcContext.code.error),
                                    }}
                                />
                            </AlertDescription>
                        </Alert>
                    )
                )}
            </div>
        </Template>
    );
}
