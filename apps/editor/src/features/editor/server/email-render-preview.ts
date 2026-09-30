import { emailTemplateIds } from "@keycloakify-editor/shadcn-theme/email";
import { renderEmailPreview } from "@keycloakify-editor/shadcn-theme/email-preview";
import { primaryPresetOptions } from "@keycloakify-editor/shadcn-theme/theme";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { LOCALES } from "../../../lib/locales";

const schema = z.object({
    templateId: z.enum(emailTemplateIds),
    locale: z.enum(LOCALES),
    plainText: z.boolean().optional(),
    theme: z.object({
        primaryColor: z.enum(primaryPresetOptions),
        logoUrl: z.string().optional(),
    }),
});

export const renderEmailPreviewFn = createServerFn({ method: "POST" })
    .validator(schema)
    .handler(async ({ data }) => {
        return renderEmailPreview({
            templateId: data.templateId,
            locale: data.locale,
            theme: data.theme,
            plainText: data.plainText,
        });
    });
