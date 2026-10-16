import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { getGroupedPages, getPage } from "#/features/editor/login/stories/pages.ts";
import type { PageId } from "#/features/editor/login/stories/types.ts";

type PageSelectProps = {
    pageId: PageId;
    storyId: string;
    onPageChange: (pageId: PageId) => void;
    onStoryChange: (storyId: string) => void;
};

export function PageSelect({ pageId, storyId, onPageChange, onStoryChange }: PageSelectProps) {
    const stories = getPage(pageId)?.stories ?? [];

    return (
        <>
            <Select value={pageId} onValueChange={value => onPageChange(value as PageId)}>
                <SelectTrigger className="w-64" aria-label="Page">
                    <span className="text-muted-foreground">Page</span>
                    <SelectValue>{(value: PageId) => getPage(value)?.label ?? value}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} className="max-h-100">
                    {getGroupedPages().map(group => (
                        <SelectGroup key={group.id}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {group.pages.map(page => (
                                <SelectItem key={page.pageId} value={page.pageId}>
                                    {page.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>

            {stories.length > 1 && (
                <Select value={storyId} onValueChange={value => onStoryChange(value ?? "default")}>
                    <SelectTrigger className="w-64" aria-label="Scenario">
                        <span className="text-muted-foreground">Scenario</span>
                        <SelectValue>
                            {(value: string) => stories.find(scenario => scenario.id === value)?.label ?? value}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} className="max-h-100">
                        {stories.map(scenario => (
                            <SelectItem key={scenario.id} value={scenario.id}>
                                {scenario.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </>
    );
}
