import { BadgeCheckIcon, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { getInitials } from "#/lib/utils";
import { useOidc } from "#/oidc.ts";

export function UserMenu() {
    const { user, logout, isUserLoggedIn } = useOidc();

    if (!isUserLoggedIn || !user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={user.profileImageUrl} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Open user menu</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{user.name}</span>
                        <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                        <a
                            href={user.accountConsoleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2"
                        >
                            <BadgeCheckIcon />
                            Account
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => logout({ redirectTo: "home" })}
                    className="flex items-center gap-2 hover:cursor-pointer"
                >
                    <LogOut className="size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
