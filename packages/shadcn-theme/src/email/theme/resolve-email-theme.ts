import { formatHex, parse } from "culori";

import type { PrimaryPreset } from "#/login/theme/index.ts";
import { primaryPresets } from "#/login/theme/index.ts";

import type { EmailTheme } from "./theme";

export function resolveEmailTheme(preset: PrimaryPreset, logoUrl: string | undefined): EmailTheme {
    const colors = resolveColors(preset);
    return {
        ...colors,
        logoUrl,
    };
}

export function resolveColors(preset: PrimaryPreset): {
    primaryColor: string;
    foregroundColor: string;
} {
    const primaryPreset = primaryPresets[preset];

    return {
        primaryColor: formatHex(parse(primaryPreset.light.primary))!,
        foregroundColor: formatHex(parse(primaryPreset.light.primaryForeground))!,
    };
}
