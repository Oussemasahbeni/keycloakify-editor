import type { PrimaryPreset } from "@keycloakify-editor/shadcn-theme/theme";
import { primaryPresetOptions, primaryPresets } from "@keycloakify-editor/shadcn-theme/theme";
import { Mail } from "lucide-react";

import { ImageAssetField } from "#/components/image-asset-field.tsx";
import { Swatch } from "#/components/swatch.tsx";
import { Field, FieldLabel } from "#/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import { useEditor } from "#/features/editor/state/editor-context.tsx";
import { prettify } from "#/lib/utils";

import { getEmailLogoError } from "../../shared/validation/email-logo";

// Sentinel Select value for "inherit the login primary" (config.primary
// is `undefined` in that case, which a controlled Select can't represent).
const INHERIT = "__inherit__";

const colorFor = (preset: PrimaryPreset) => primaryPresets[preset].light.primary;

function PrimaryColorField() {
    const { email, login } = useEditor();
    const { config, updateConfig } = email;

    return (
        <Field>
            <FieldLabel>Primary color</FieldLabel>
            <Select
                value={config.primary ?? INHERIT}
                onValueChange={value =>
                    updateConfig({
                        primary: value === INHERIT ? undefined : (value as PrimaryPreset),
                    })
                }
            >
                <SelectTrigger className="w-full">
                    <SelectValue>
                        {(selected: PrimaryPreset | typeof INHERIT) => {
                            const primary = selected === INHERIT ? login.config.primary : selected;
                            return (
                                <span className="flex items-center gap-2">
                                    <Swatch color={colorFor(primary)} />
                                    {selected === INHERIT ? `Match login (${prettify(primary)})` : prettify(primary)}
                                </span>
                            );
                        }}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value={INHERIT}>
                        <span className="flex items-center gap-2">
                            <Swatch color={colorFor(login.config.primary)} />
                            Match login ({prettify(login.config.primary)})
                        </span>
                    </SelectItem>
                    {primaryPresetOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            <span className="flex items-center gap-2">
                                <Swatch color={colorFor(option)} />
                                {prettify(option)}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

function EmailLogoUrlField() {
    const { config, updateConfig, emailLogoFile, setEmailLogoFile } = useEditor().email;

    return (
        <ImageAssetField
            accept=".png,.jpg,.jpeg"
            hint="PNG or JPEG (max 1 MB)."
            validate={getEmailLogoError}
            icon={Mail}
            label="Email logo"
            url={config.logoUrl ?? ""}
            onUrlChange={value => updateConfig({ logoUrl: value })}
            file={emailLogoFile}
            onFileChange={file => setEmailLogoFile(file)}
        />
    );
}

export function EmailThemeSidebar() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Separator />
            <PrimaryColorField />
            <EmailLogoUrlField />
        </div>
    );
}
