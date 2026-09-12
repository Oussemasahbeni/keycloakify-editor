import { LogIn, Mail, User } from "lucide-react";

export type Surface = "login" | "email" | "account";

export type SurfaceOption = {
    value: Surface;
    label: string;
    to: `/editor/${Surface}`;
    icon: typeof LogIn;
};

export const SURFACES = [
    { value: "login", to: "/editor/login", label: "Login", icon: LogIn },
    { value: "email", to: "/editor/email", label: "Email", icon: Mail },
    { value: "account", to: "/editor/account", label: "Account", icon: User },
] as const satisfies ReadonlyArray<SurfaceOption>;
