import type {
    BasePalette,
    FontFamily,
    Layout,
    RadiusPreset,
    SidePanelPosition,
    PrimaryPreset,
} from "@keycloakify-editor/shadcn-theme/theme";
import {
    basePaletteOptions,
    basePalettes,
    fontFamilyOptions,
    layoutOptions,
    radiusPresetOptions,
    sidePanelPositionOptions,
    primaryPresetOptions,
    primaryPresets,
} from "@keycloakify-editor/shadcn-theme/theme";
import type { LucideIcon } from "lucide-react";
import { Columns2, Image, Info, PanelLeft, PanelRight, Shuffle, Square } from "lucide-react";
import type { ReactNode } from "react";

import { Swatch } from "#/components/swatch.tsx";
import { Button } from "#/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "#/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from "#/components/ui/input-group.tsx";
import { Label } from "#/components/ui/label";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import { Switch } from "#/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip.tsx";
import { getThemeNameError } from "#/features/editor/shared/validation/theme-name.ts";
import { useEditor } from "#/features/editor/state/editor-context";
import { pickRandom, prettify } from "#/lib/utils";

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
                    <SelectValue>
                        {(selected: RadiusPreset) => (
                            <span className="flex items-center gap-2">{prettify(selected)}</span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                    {radiusPresetOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            <span className="flex items-center gap-2">{prettify(option)}</span>
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

const layoutMeta: Record<Layout, { description: string; Icon: LucideIcon }> = {
    "two-column": {
        description: "Sign-in form paired with a branded side panel.",
        Icon: Columns2,
    },
    "centered-card": {
        description: "A single card centered on the page.",
        Icon: Square,
    },
    "image-aside": {
        description: "Form alongside a full-height image.",
        Icon: Image,
    },
};

function LayoutField() {
    const { config, updateConfig } = useEditor().login;

    return (
        <Field>
            <RadioGroup value={config.layout} onValueChange={value => updateConfig({ layout: value as Layout })}>
                {layoutOptions.map(option => {
                    const { description, Icon } = layoutMeta[option];
                    return (
                        <FieldLabel className="hover:cursor-pointer" key={option} htmlFor={`layout-${option}`}>
                            <Field orientation="horizontal">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                                    <Icon className="size-4" />
                                </span>
                                <FieldContent>
                                    <FieldTitle>{prettify(option)}</FieldTitle>
                                    <FieldDescription>{description}</FieldDescription>
                                </FieldContent>
                                <RadioGroupItem value={option} id={`layout-${option}`} />
                            </Field>
                        </FieldLabel>
                    );
                })}
            </RadioGroup>
        </Field>
    );
}

const sidePanelPositionMeta: Record<SidePanelPosition, { label: string; Icon: LucideIcon }> = {
    left: { label: "Left", Icon: PanelLeft },
    right: { label: "Right", Icon: PanelRight },
};

function SidePanelPositionField() {
    const { config, updateConfig } = useEditor().login;

    if (config.layout !== "two-column") {
        return null;
    }

    return (
        <Field>
            <FieldLabel>Side panel position</FieldLabel>
            <RadioGroup
                className="grid grid-cols-2 gap-2"
                value={config.sidePanelPosition}
                onValueChange={value => updateConfig({ sidePanelPosition: value })}
            >
                {sidePanelPositionOptions.map(option => {
                    const { label, Icon } = sidePanelPositionMeta[option];
                    return (
                        <FieldLabel
                            className="hover:cursor-pointer"
                            key={option}
                            htmlFor={`side-panel-position-${option}`}
                        >
                            <Field orientation="horizontal">
                                <Icon className="size-4" />
                                <FieldContent>
                                    <FieldTitle>{label}</FieldTitle>
                                </FieldContent>
                                <RadioGroupItem value={option} id={`side-panel-position-${option}`} />
                            </Field>
                        </FieldLabel>
                    );
                })}
            </RadioGroup>
        </Field>
    );
}

function ShowPlaceholdersField() {
    const { config, updateConfig } = useEditor().login;

    return (
        <div className="flex items-center gap-2">
            <Switch
                id="show-placeholders"
                checked={config.showPlaceholder}
                onCheckedChange={checked => updateConfig({ showPlaceholder: checked })}
            />
            <Label htmlFor="show-placeholders">Show placeholders</Label>
        </div>
    );
}
function ShowRealmNameField() {
    const { config, updateConfig } = useEditor().login;

    return (
        <div className="flex items-center gap-2">
            <Switch
                id="show-realm-name"
                checked={config.showRealmName}
                onCheckedChange={checked => updateConfig({ showRealmName: checked })}
            />
            <Label htmlFor="show-realm-name">Show realm name</Label>
        </div>
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
            layout: pickRandom(layoutOptions),
            showPlaceholder: Math.random() < 0.5,
            showRealmName: Math.random() < 0.5,
        });
    }

    return (
        <Button type="button" variant="outline" className="w-full" onClick={shuffle}>
            <Shuffle />
            Shuffle
        </Button>
    );
}

function ThemeNameField() {
    const { themeName, setThemeName } = useEditor();
    const error = getThemeNameError(themeName);
    return (
        <Field className="mt-2">
            <FieldLabel>Theme name</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    type="text"
                    value={themeName}
                    aria-invalid={error ? true : undefined}
                    onChange={e => setThemeName(e.target.value)}
                    placeholder="my-login-theme"
                />
                <InputGroupAddon align="inline-end">
                    <ThemeNameHint invalid={Boolean(error)} />
                </InputGroupAddon>
            </InputGroup>
            <FieldError>{error}</FieldError>
        </Field>
    );
}

function ThemeNameHint({ invalid }: { invalid: boolean }) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Theme name requirements"
                        className={invalid ? "text-destructive" : "text-muted-foreground"}
                    >
                        <Info />
                    </Button>
                }
            />
            <TooltipContent>
                Used as the Keycloak theme (folder) name. Lowercase letters, digits and dashes only — e.g. acme-login.
            </TooltipContent>
        </Tooltip>
    );
}
function WelcomeMessageField() {
    const { config, updateConfig } = useEditor().login;

    if (config.layout !== "two-column") {
        return null;
    }

    return (
        <Field>
            <div className="flex items-center justify-between gap-2">
                <FieldLabel>Welcome message</FieldLabel>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Welcome message details"
                                className="text-muted-foreground"
                            >
                                <Info />
                            </Button>
                        }
                    />
                    <TooltipContent>
                        To translate per-locale, override the "welcomeMessage" key in your realm message bundle
                        (Keycloak admin → Realm settings → Localization). With this field and the override both empty,
                        the theme default is used.
                    </TooltipContent>
                </Tooltip>
            </div>
            <FieldDescription>
                Shown on the side panel. Overrides all languages, leave empty to use your realm's translations.
            </FieldDescription>
            <InputGroup>
                <InputGroupTextarea
                    value={config.welcomeMessage}
                    onChange={e => updateConfig({ welcomeMessage: e.target.value })}
                    placeholder="Default: your realm's welcomeMessage translation"
                />
            </InputGroup>
        </Field>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-4">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
            {children}
        </section>
    );
}

export function BrandingPanel() {
    return (
        <div className="space-y-6">
            <ShuffleButton />
            <ThemeNameField />

            <Separator />

            <Section title="Appearance">
                <BasePaletteField />
                <PrimaryColorField />
                <RadiusField />
                <FontFamilyField />
            </Section>

            <Separator />

            <Section title="Layout">
                <LayoutField />
                <SidePanelPositionField />
                <div className="flex gap-2">
                    <ShowRealmNameField />
                    <ShowPlaceholdersField />
                </div>
                <WelcomeMessageField />
            </Section>
        </div>
    );
}
