import type { BasePalette, FontFamily, PrimaryPreset, RadiusPreset } from "@keycloakify-editor/shadcn-theme/theme";
import {
    basePaletteOptions,
    basePalettes,
    fontFamilyOptions,
    primaryPresetOptions,
    primaryPresets,
    radiusPresetOptions,
} from "@keycloakify-editor/shadcn-theme/theme";
import { Shuffle } from "lucide-react";

import { Swatch } from "#/components/swatch.tsx";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { useEditor } from "#/features/editor/state/editor-context";
import { pickRandom, prettify } from "#/lib/utils";

/**
 * The branding the account console actually consumes: the four theme presets.
 * They live on the shared login config, so every field below reads and writes
 * `useEditor().login` — the Login surface shows the same values.
 */

function BasePaletteField() {
    const { config, previewColorScheme, updateConfig } = useEditor().login;
    const colorFor = (palette: BasePalette) => basePalettes[palette][previewColorScheme].mutedForeground;

    return (
        <Field>
            <FieldLabel>Base palette</FieldLabel>
            <Select value={config.base} onValueChange={value => updateConfig({ base: value as BasePalette })}>
                <SelectTrigger className="w-full">
                    <SelectValue>
                        {(selected: BasePalette) => (
                            <span className="flex items-center gap-2">
                                <Swatch color={colorFor(selected)} />
                                {prettify(selected)}
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                    {basePaletteOptions.map(option => (
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

function PrimaryColorField() {
    const { config, previewColorScheme, updateConfig } = useEditor().login;
    const colorFor = (preset: PrimaryPreset) => primaryPresets[preset][previewColorScheme].primary;

    return (
        <Field>
            <FieldLabel>Primary color</FieldLabel>
            <Select value={config.primary} onValueChange={value => updateConfig({ primary: value as PrimaryPreset })}>
                <SelectTrigger className="w-full">
                    <SelectValue>
                        {(selected: PrimaryPreset) => (
                            <span className="flex items-center gap-2">
                                <Swatch color={colorFor(selected)} />
                                {prettify(selected)}
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
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

function RadiusField() {
    const { config, updateConfig } = useEditor().login;

    return (
        <Field>
            <FieldLabel>Radius</FieldLabel>
            <Select value={config.radius} onValueChange={value => updateConfig({ radius: value as RadiusPreset })}>
                <SelectTrigger className="w-full">
                    <SelectValue>{(selected: RadiusPreset) => prettify(selected)}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                    {radiusPresetOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {prettify(option)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

function FontFamilyField() {
    const { config, updateConfig } = useEditor().login;

    return (
        <Field>
            <FieldLabel>Font family</FieldLabel>
            <Select value={config.font} onValueChange={value => updateConfig({ font: value as FontFamily })}>
                <SelectTrigger className="w-full">
                    <SelectValue>{(selected: FontFamily) => prettify(selected)}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                    {fontFamilyOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {prettify(option)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

function ShuffleButton() {
    const { updateConfig } = useEditor().login;

    function shuffle() {
        updateConfig({
            base: pickRandom(basePaletteOptions),
            primary: pickRandom(primaryPresetOptions),
            radius: pickRandom(radiusPresetOptions),
            font: pickRandom(fontFamilyOptions),
        });
    }

    return (
        <Button type="button" variant="outline" className="w-full" onClick={shuffle}>
            <Shuffle />
            Shuffle
        </Button>
    );
}

export function AccountBrandingPanel() {
    return (
        <div className="space-y-6">
            <ShuffleButton />

            <section className="flex flex-col gap-4">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Appearance</h3>
                <BasePaletteField />
                <PrimaryColorField />
                <RadiusField />
                <FontFamilyField />
            </section>
        </div>
    );
}
