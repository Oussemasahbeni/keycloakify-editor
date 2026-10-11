import { Link } from "@tanstack/react-router";

import { Button, buttonVariants } from "#/components/ui/button";

export function NotFound() {
    return (
        <main className="relative flex h-screen items-center justify-center overflow-hidden">
            <div className="max-w-md space-y-6 px-4 text-center">
                <div className="space-y-2">
                    <h1 className="text-9xl font-bold text-primary">404</h1>
                    <h2 className="text-3xl font-semibold tracking-tight">Page Not Found</h2>
                    <p className="text-lg text-muted-foreground">
                        Sorry, the page you are looking for doesn't exist or has been moved.
                    </p>
                </div>
                <div className="flex justify-center gap-4">
                    <Link className={buttonVariants({ variant: "default" })} to="/">
                        Go to editor
                    </Link>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>

            <div className="pointer-events-none absolute top-0 right-0 max-w-62.5 xl:max-w-112.5">
                <img src="/images/shape.svg" width={450} height={254} alt="" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 max-w-62.5 rotate-180 xl:max-w-112.5">
                <img src="/images/shape.svg" width={450} height={254} alt="" aria-hidden="true" />
            </div>
        </main>
    );
}
