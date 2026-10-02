/**
 * This file has been claimed for ownership from @keycloakify/keycloak-ui-shared version 260700.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/HelpItem.tsx" --revert
 */

import { CircleHelpIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { cn } from "#/lib/utils";

import { useHelp } from "../context/HelpContext";

type HelpItemProps = {
    helpText: ReactNode;
    fieldLabelId: string;
    /** Kept for API compatibility with upstream callers; layout is handled by the parent. */
    noVerticalAlign?: boolean;
    unWrap?: boolean;
    isRecommendation?: boolean;
};

/** Small help icon opening a popover with the attribute's helper text; hidden when help is disabled. */
export const HelpItem = ({ helpText, fieldLabelId, isRecommendation = false }: HelpItemProps) => {
    const { enabled } = useHelp();

    if (!enabled) {
        return null;
    }

    const Icon = isRecommendation ? TriangleAlertIcon : CircleHelpIcon;

    return (
        <Popover>
            <PopoverTrigger
                data-testid={`help-label-${fieldLabelId}`}
                aria-label={fieldLabelId}
                className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                    isRecommendation && "text-warning",
                )}
            >
                <Icon className="size-4" />
            </PopoverTrigger>
            <PopoverContent side="top" className="max-w-xs text-sm">
                {helpText}
            </PopoverContent>
        </Popover>
    );
};
