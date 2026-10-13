import { cn } from "#/lib/utils";

interface LogoProps extends Omit<React.ComponentProps<"img">, "src" | "alt" | "width" | "height"> {
    size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
    return (
        <img
            src="/logo.png"
            alt="themekey"
            width={size}
            height={size}
            className={cn("shrink-0 object-contain", className)}
            {...props}
        />
    );
}
