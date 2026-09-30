import type { LucideIcon } from "lucide-react";
import { Image as ImageIcon, Moon, PanelLeft, Star, Sun } from "lucide-react";

import { ImageAssetField } from "#/components/image-asset-field";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { FileUpload } from "#/components/ui/file-upload";
import type { ThemeAssetKey } from "#/features/editor/shared/model/assets.ts";
import { assetDefinitions } from "#/features/editor/shared/model/assets.ts";
import { getFaviconError } from "#/features/editor/shared/validation/favicon.ts";
import { useEditor } from "#/features/editor/state/editor-context.tsx";

const ASSET_ICONS: Record<ThemeAssetKey, LucideIcon> = {
    favicon: Star,
    logoUrl: Sun,
    logoDarkUrl: Moon,
    asideImageUrl: PanelLeft,
    cardImageUrl: ImageIcon,
    sidePanelImageUrl: PanelLeft,
    sidePanelImageDarkUrl: Moon,
};

export function AssetsPanel() {
    const { config, updateConfig, assets, setAssets } = useEditor().login;

    return (
        <div className="space-y-4">
            <Card size="sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="size-4 text-muted-foreground" />
                        Favicon
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FileUpload
                        label="Upload favicon"
                        value={assets.favicon}
                        onChange={file => setAssets({ ...assets, favicon: file })}
                        accept=".png,.svg,.ico"
                        validate={getFaviconError}
                        hint="PNG, SVG, or ICO (max 1 MB)."
                    />
                </CardContent>
            </Card>

            {assetDefinitions
                .filter(asset => !("layout" in asset) || asset.layout === config.layout)
                .map(asset => (
                    <ImageAssetField
                        key={asset.key}
                        icon={ASSET_ICONS[asset.key]}
                        label={asset.label}
                        url={config[asset.key]}
                        onUrlChange={value => updateConfig({ [asset.key]: value })}
                        file={assets[asset.key]}
                        onFileChange={file => setAssets({ ...assets, [asset.key]: file })}
                    />
                ))}
        </div>
    );
}
