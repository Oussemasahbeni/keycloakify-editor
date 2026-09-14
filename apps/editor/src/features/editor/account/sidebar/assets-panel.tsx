import { Moon, Sun } from "lucide-react";

import { ImageAssetField } from "#/components/image-asset-field";
import { useEditor } from "#/features/editor/state/editor-context";

/**
 * The only images the account console shows: the logo and its dark-mode
 * variant. Same fields as on the Login surface, bound to the shared config.
 */
export function AccountAssetsPanel() {
    const { config, updateConfig, assets, setAssets } = useEditor().login;

    return (
        <div className="space-y-4">
            <ImageAssetField
                icon={Sun}
                label="Logo"
                url={config.logoUrl}
                onUrlChange={value => updateConfig({ logoUrl: value })}
                file={assets.logoUrl}
                onFileChange={file => setAssets({ ...assets, logoUrl: file })}
            />
            <ImageAssetField
                icon={Moon}
                label="Dark logo (optional)"
                url={config.logoDarkUrl}
                onUrlChange={value => updateConfig({ logoDarkUrl: value })}
                file={assets.logoDarkUrl}
                onFileChange={file => setAssets({ ...assets, logoDarkUrl: file })}
            />
        </div>
    );
}
