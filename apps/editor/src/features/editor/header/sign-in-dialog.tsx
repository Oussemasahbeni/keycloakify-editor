import { LogIn } from "lucide-react";

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

export type SignInDialogProps = {
    open: boolean;
    onSignIn: () => void;
    onOpenChange: (open: boolean) => void;
};

export function SignInDialog(props: SignInDialogProps) {
    const { open, onSignIn, onOpenChange } = props;
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <LogIn />
                    </AlertDialogMedia>
                    <AlertDialogTitle> Sign in to export</AlertDialogTitle>
                    <AlertDialogDescription>
                        Exporting a theme requires an account. Your design is kept in this browser while you sign in, so
                        you'll pick up right where you left off.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSignIn}>Sign in</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
