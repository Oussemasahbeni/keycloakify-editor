import { LockOpen } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { LIFETIME_ACCESS_PRICE } from "#/config/constants.ts";

export type PaywallDialogProps = {
    open: boolean;
    onContinue: () => void;
    onOpenChange: (open: boolean) => void;
};

export function PaywallDialog(props: PaywallDialogProps) {
    const { open, onContinue, onOpenChange } = props;
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <LockOpen />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Unlock export for {LIFETIME_ACCESS_PRICE.label}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Designing is free. Exporting takes a one-time payment of {LIFETIME_ACCESS_PRICE.label}, which
                        unlocks every export of every theme for good. Your design is kept in this browser while you pay,
                        so you'll pick up right where you left off.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue}>Continue to payment</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
