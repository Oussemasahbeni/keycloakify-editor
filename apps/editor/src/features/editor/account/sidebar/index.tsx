import { Images, Info, Palette } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

import { AccountAssetsPanel } from "./assets-panel";
import { AccountBrandingPanel } from "./branding-panel";

/**
 * The account console has no configuration of its own: it reads the login
 * theme's presets (base, primary, radius, font) and its two logos. This sidebar
 * exposes exactly those, bound to the same config as the Login surface.
 */
export function AccountThemeSidebar() {
    return (
        <aside className="flex shrink-0 flex-col border-l bg-background">
            <Tabs defaultValue="branding" className="flex h-full min-h-0 flex-col gap-0">
                <div className="border-b p-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="branding">
                            <Palette />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="assets">
                            <Images />
                            Assets
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex gap-2 border-b bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <p>The account console shares the Login surface's branding. Changes here apply to both.</p>
                </div>

                <TabsContent value="branding" className="min-h-0 flex-1 overflow-y-auto p-4">
                    <AccountBrandingPanel />
                </TabsContent>
                <TabsContent value="assets" className="min-h-0 flex-1 overflow-y-auto p-4">
                    <AccountAssetsPanel />
                </TabsContent>
            </Tabs>
        </aside>
    );
}
