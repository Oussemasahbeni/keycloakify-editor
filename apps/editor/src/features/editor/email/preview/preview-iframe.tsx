import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { renderEmailPreviewFn } from "#/features/editor/server/email-render-preview";
import { useEditor } from "#/features/editor/state/editor-context.tsx";

import { EmailPreviewToolbar } from "./preview-toolbar";

export function EmailPreviewIframe() {
    const { email, login, locale } = useEditor();
    const renderPreview = useServerFn(renderEmailPreviewFn);
    const templateId = email.template.id;

    const primaryColor = email.config.primary ?? login.config.primary;
    const logoFile = email.emailLogoFile;

    // An uploaded logo can't be sent as a File to the render server, so inline it as
    // a data: URL — the server embeds it as <img src> and the iframe resolves it.
    const [logoDataUrl, setLogoDataUrl] = useState<string>();
    useEffect(() => {
        if (!logoFile) {
            setLogoDataUrl(undefined);
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => setLogoDataUrl(reader.result as string));
        reader.readAsDataURL(logoFile);
        return () => reader.abort();
    }, [logoFile]);

    const logoUrl = logoFile ? logoDataUrl : email.config.logoUrl;
    // Key on the file's identity, not the ~1.3 MB data URL (which react-query would
    // hash on every render). `enabled` waits for the async read before the first fetch.
    const logoKey = logoFile
        ? `file:${logoFile.name}:${logoFile.size}:${logoFile.lastModified}`
        : (email.config.logoUrl ?? "");

    const emailPreviewOptions = queryOptions({
        queryKey: ["email-preview", renderPreview, templateId, locale, primaryColor, logoKey, logoUrl],
        queryFn: () =>
            renderPreview({
                data: { templateId, locale, theme: { primaryColor, logoUrl } },
            }),
        enabled: !logoFile || logoDataUrl != null,
        placeholderData: keepPreviousData,
    });
    const { data: html } = useQuery(emailPreviewOptions);

    return (
        <div className="flex h-full flex-col">
            <EmailPreviewToolbar />
            <div className="h-full overflow-auto bg-muted/30 p-4">
                <iframe
                    title="Email preview"
                    // oxlint-disable-next-line react/iframe-missing-sandbox
                    sandbox="allow-same-origin allow-scripts"
                    srcDoc={html}
                    className="mx-auto block h-full w-full rounded-lg border shadow-sm"
                />
            </div>
        </div>
    );
}
