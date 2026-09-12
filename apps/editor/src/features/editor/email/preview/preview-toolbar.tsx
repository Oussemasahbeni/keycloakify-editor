import type { EmailTemplate } from "@kc-studio/shadcn-theme/email";
import { emailTemplates } from "@kc-studio/shadcn-theme/email";
import { Mail, RotateCcw } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { LanguageSelect } from "#/features/editor/shared/components/language-select";
import { useEditor } from "#/features/editor/state/editor-context";

function TemplateSelect() {
    const { template, setTemplate } = useEditor().email;

    return (
        <Select value={template} onValueChange={value => setTemplate(value as EmailTemplate)}>
            <SelectTrigger className="w-84">
                <Mail className="size-4 text-muted-foreground" />
                <SelectValue>{(selected: EmailTemplate) => selected.label}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-100">
                {emailTemplates.map(value => (
                    <SelectItem key={value.id} value={value}>
                        {value.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
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

export function EmailPreviewToolbar() {
    return (
        <div className="flex items-center justify-between gap-2 border-b p-2">
            <div className="flex items-center gap-2">
                <TemplateSelect />
                <LanguageSelect />
            </div>

            <div className="flex items-center gap-2">
                <ResetButton />
            </div>
        </div>
    );
}
