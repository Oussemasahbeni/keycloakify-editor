import type { ErrorComponentProps } from "@tanstack/react-router";
import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    const router = useRouter();
    const isRoot = useMatch({
        strict: false,
        select: state => state.id === rootRouteId,
    });

    console.error("DefaultCatchBoundary Error:", error);

    return (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
            <ErrorComponent error={error} />
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        void router.invalidate();
                    }}
                    className="rounded-sm bg-primary px-2 py-1 font-extrabold text-primary-foreground uppercase"
                >
                    Try Again
                </button>
                {isRoot ? (
                    <Link
                        to="/"
                        className="rounded-sm bg-primary px-2 py-1 font-extrabold text-primary-foreground uppercase"
                    >
                        Home
                    </Link>
                ) : (
                    <Link
                        to="/"
                        className="rounded-sm bg-primary px-2 py-1 font-extrabold text-primary-foreground uppercase"
                        onClick={e => {
                            e.preventDefault();
                            window.history.back();
                        }}
                    >
                        Go Back
                    </Link>
                )}
            </div>
        </div>
    );
}
