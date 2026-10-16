import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";

import { cn } from "#/lib/utils";

function InputOTP({
    className,
    containerClassName,
    ...props
}: React.ComponentProps<typeof OTPInput> & {
    containerClassName?: string;
}) {
    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn("cn-input-otp flex items-center has-disabled:opacity-50", containerClassName)}
            spellCheck={false}
            // The default "increase-width" strategy widens the hidden input by 40px when a password manager
            // is detected; inside a full-width Field that overflows the card and focusing it scrolls the
            // card's overflow-hidden content sideways.
            pushPasswordManagerStrategy="none"
            className={cn("disabled:cursor-not-allowed", className)}
            {...props}
        />
    );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-otp-group"
            className={cn(
                "flex items-center rounded-md has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
                className,
            )}
            {...props}
        />
    );
}

function InputOTPSlot({
    index,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    index: number;
}) {
    const inputOTPContext = React.use(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                "relative flex size-9 items-center justify-center border-y border-e border-input text-sm shadow-xs transition-all outline-none first:rounded-s-md first:border-s last:rounded-e-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
                className,
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
                </div>
            )}
        </div>
    );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-otp-separator"
            className="flex items-center [&_svg:not([class*='size-'])]:size-4"
            role="separator"
            {...props}
        >
            <MinusIcon />
        </div>
    );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
