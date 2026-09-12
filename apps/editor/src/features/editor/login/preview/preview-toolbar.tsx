import { ExternalLink, RotateCcw } from "lucide-react";

import { Button } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import type { PageId } from "#/features/editor/login/stories/types";
import { LanguageSelect } from "#/features/editor/shared/components/language-select";
import { VIEWPORTS } from "#/features/editor/shared/model/viewport.ts";
import { useEditor } from "#/features/editor/state/editor-context";

import { SCHEMES } from "../../shared/model/preview-color-scheme";
import { PageSelect } from "./page-select";

function ViewportToggle() {
    const { viewport, setViewport } = useEditor().login;

    return (
        <ButtonGroup>
            {VIEWPORTS.map(({ id, label, icon: Icon }) => {
                const isActive = viewport === id;
                return (
                    <Tooltip key={id}>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant={isActive ? "default" : "outline"}
                                    size="icon"
                                    aria-pressed={isActive}
                                    onClick={() => setViewport(id)}
                                >
                                    <Icon className="size-4" />
                                    <span className="sr-only">{label}</span>
                                </Button>
                            }
                        />
                        <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                );
            })}
        </ButtonGroup>
    );
}

function PreviewThemeToggle() {
    const { previewColorScheme, setPreviewColorScheme } = useEditor().login;

    return (
        <ButtonGroup>
            {SCHEMES.map(({ value: scheme, label, icon: Icon }) => (
                <Tooltip key={scheme}>
                    <TooltipTrigger
                        render={
                            <Button
                                variant={previewColorScheme === scheme ? "default" : "outline"}
                                size="icon"
                                aria-pressed={previewColorScheme === scheme}
                                onClick={() => setPreviewColorScheme(scheme)}
                            >
                                <Icon />
                                <span className="sr-only">{label}</span>
                            </Button>
                        }
                    />
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            ))}
        </ButtonGroup>
    );
}

function PreviewInNewTab() {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button variant="outline" size="icon" onClick={() => window.open("/preview", "_blank", "noopener")}>
                        <ExternalLink />
                    </Button>
                }
            />
            <TooltipContent>Open full page in new tab</TooltipContent>
        </Tooltip>
    );
}

function ResetButton() {
    const { resetConfig } = useEditor();

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button variant="outline" size="icon" onClick={resetConfig}>
                        <RotateCcw />
                    </Button>
                }
            />
            <TooltipContent>Reset configuration</TooltipContent>
        </Tooltip>
    );
}

type PreviewToolbarProps = {
    pageId: PageId;
    storyId: string;
    onPageChange: (pageId: PageId) => void;
    onStoryChange: (storyId: string) => void;
};

export function LoginPreviewToolbar({ pageId, storyId, onPageChange, onStoryChange }: PreviewToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-2 border-b p-2">
            <div className="flex items-center gap-2">
                <PageSelect
                    pageId={pageId}
                    storyId={storyId}
                    onPageChange={onPageChange}
                    onStoryChange={onStoryChange}
                />
                <LanguageSelect />
                <ViewportToggle />
                <PreviewThemeToggle />
            </div>

            <div className="flex items-center gap-2">
                <PreviewInNewTab />
                <ResetButton />
            </div>
        </div>
    );
}
