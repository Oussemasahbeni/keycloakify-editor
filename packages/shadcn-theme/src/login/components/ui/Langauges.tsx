import { IoCheckmark, IoLanguage } from "react-icons/io5";

import { Button } from "#/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useI18n } from "#/login/i18n.ts";

export function Languages() {
    const { msgStr, currentLanguage, enabledLanguages } = useI18n();

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" aria-label={msgStr("languages")}>
                            <IoLanguage />
                            {currentLanguage.label}
                        </Button>
                    }
                />
                <DropdownMenuContent id="language-switch1" role="menu" className="max-h-72 overflow-y-auto">
                    {enabledLanguages.map(({ languageTag, label, href }, i) => {
                        const isActive = languageTag === currentLanguage.languageTag;

                        return (
                            <DropdownMenuItem key={languageTag}>
                                <a
                                    role="menuitem"
                                    id={`language-${i + 1}`}
                                    href={href}
                                    className="flex w-full cursor-pointer items-center justify-between"
                                >
                                    {label}
                                    {isActive && <IoCheckmark className="size-4 opacity-50" />}
                                </a>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
