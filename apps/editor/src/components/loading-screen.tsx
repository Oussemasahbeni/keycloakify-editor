import { Logo } from "#/components/logo";
import { Spinner } from "#/components/ui/spinner";

export function LoadingScreen() {
    return (
        <div className="flex h-svh w-full flex-col items-center justify-center gap-6">
            <Logo size={48} />
            <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="size-4" />
                <span className="text-sm">Loading editor...</span>
            </div>
        </div>
    );
}
