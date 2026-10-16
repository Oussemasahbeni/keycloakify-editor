import { LogIn, Mail, User } from "lucide-react";

export type Surface = "login" | "email" | "account";

export type SurfaceOption = {
    value: Surface;
    label: string;
    to: `/${Surface}`;
    icon: typeof LogIn;
};

export const SURFACES = [
    { value: "login", to: "/login", label: "Login theme", icon: LogIn },
    { value: "email", to: "/email", label: "Email theme", icon: Mail },
    { value: "account", to: "/account", label: "Account theme", icon: User },
] as const satisfies ReadonlyArray<SurfaceOption>;
