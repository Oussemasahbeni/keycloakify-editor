import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";
import { accessQueryKey } from "#/features/billing/queries.ts";
import { confirmCheckout, createCheckoutSession, getAccessStatus } from "#/features/billing/server/billing.ts";
import { clearDraft, saveDraft } from "#/lib/draft-storage";
import { useOidc } from "#/oidc.ts";

import { generateJar } from "../server/generate-jar";
import { SURFACES } from "../shared/model/surface";
import { buildThemeFormData } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";
import { PaywallDialog } from "./paywall-dialog";
import { SignInDialog } from "./sign-in-dialog";

const editorRoute = getRouteApi("/_editor");

/**
 * Exports the theme as a JAR, which takes an account and lifetime access. A
 * user missing either is sent to sign in or to pay; both leave the page, so the
 * edits wait in a draft and are back when the user is, ready to export.
 *
 * What is shown here is a convenience: the server refuses an export without
 * access whatever this component believes.
 */
export function ExportButton() {
    const {
        themeName,
        theme,
        persistence: { saved, allowLeave },
    } = useEditor();

    const { isUserLoggedIn, login } = useOidc();
    const { checkout, session_id: sessionId } = editorRoute.useSearch();
    const navigate = editorRoute.useNavigate();
    const pathname = useLocation({ select: location => location.pathname });
    const queryClient = useQueryClient();

    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [openPaywallDialog, setOpenPaywallDialog] = useState(false);
    const [isLeavingForCheckout, setIsLeavingForCheckout] = useState(false);
    const handledCheckoutReturn = useRef(false);

    const exportJar = useServerFn(generateJar);
    const fetchAccess = useServerFn(getAccessStatus);
    const requestCheckout = useServerFn(createCheckoutSession);
    const confirmPayment = useServerFn(confirmCheckout);

    const accessOptions = queryOptions({
        queryKey: [...accessQueryKey, fetchAccess],
        queryFn: () => fetchAccess(),
        // Held back on the way in from a payment: the confirmation below is what
        // records it, and an answer read before that would say "no access".
        enabled: isUserLoggedIn === true && checkout !== "success",
    });
    const { data: access } = useQuery(accessOptions);

    // Stripe's redirect only says a checkout ended; whether it was paid is asked
    // of the server, which asks Stripe.
    const confirmationOptions = queryOptions({
        queryKey: ["billing-checkout", sessionId ?? null, confirmPayment],
        queryFn: () => confirmPayment({ data: { sessionId: sessionId ?? "" } }),
        enabled: isUserLoggedIn === true && checkout === "success" && sessionId !== undefined,
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const confirmation = useQuery(confirmationOptions);

    const { mutate: exportTheme, isPending } = useMutation({
        mutationFn: async () => {
            const response = await exportJar({ data: buildThemeFormData(theme) });
            return { blob: await response.blob(), name: themeName.trim() };
        },
        onSuccess: ({ blob, name }) => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${name}.jar`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);

            void clearDraft();
            toast.add({
                description: `Downloaded ${name}.jar`,
                type: "success",
            });
        },
        onError: error => {
            // The server may have refused for lack of access (a refund, say); ask again
            // so the next click shows the paywall instead of this error.
            void queryClient.invalidateQueries({ queryKey: accessQueryKey });
            toast.add({
                description: error instanceof Error ? error.message : "Export failed.",
                type: "error",
            });
        },
    });

    const { mutate: startCheckout, isPending: isStartingCheckout } = useMutation({
        mutationFn: async () => {
            // Same hand-off as sign-in: the edits wait in a draft while the user is at Stripe.
            await saveDraft({ ...theme, saved: saved ?? undefined }).catch(() =>
                toast.add({
                    description: "Couldn't save your edits before the payment; they may be lost after the redirect.",
                    type: "warning",
                }),
            );
            const surface = SURFACES.find(option => pathname.startsWith(option.to))?.value ?? "login";
            return requestCheckout({ data: { surface, themeId: saved?.id } });
        },
        onSuccess: result => {
            if (result.status === "already-paid") {
                void clearDraft();
                queryClient.setQueryData(accessOptions.queryKey, { hasAccess: true });
                return exportTheme();
            }
            setIsLeavingForCheckout(true);
            allowLeave();
            window.location.assign(result.url);
        },
        onError: error => {
            // Not leaving after all, so the draft must not be restored over a later visit.
            void clearDraft();
            toast.add({
                description: error instanceof Error ? error.message : "Couldn't start the checkout.",
                type: "error",
            });
        },
    });

    function handleExport() {
        const nameError = getThemeNameError(themeName);
        if (nameError)
            return toast.add({
                description: `Invalid theme name: ${nameError}`,
                type: "error",
            });

        // Export needs a session: ask for sign-in up front instead of uploading everything
        // first, and keep the edits in a draft so they survive the sign-in redirect.
        if (!isUserLoggedIn) {
            void saveDraft({ ...theme, saved: saved ?? undefined })
                .catch(() =>
                    toast.add({
                        description: "Couldn't save your edits before signing in; they may be lost after the redirect.",
                        type: "warning",
                    }),
                )
                .finally(() => setOpenSignInDialog(true));
            return;
        }

        // While access is unknown (still loading, or the check failed) the export
        // is simply attempted: the server decides either way.
        if (access?.hasAccess === false) return setOpenPaywallDialog(true);

        exportTheme();
    }

    function handleSignIn() {
        setOpenSignInDialog(false);
        login?.().catch(() => toast.add({ description: "Couldn't reach the sign-in server.", type: "error" }));
    }

    function handleContinueToPayment() {
        setOpenPaywallDialog(false);
        startCheckout();
    }

    // Back from Stripe: report how it went, then take the checkout parameters out of the URL.
    const isConfirming = checkout === "success" && sessionId !== undefined && isUserLoggedIn === true;
    const isCheckoutSettled =
        checkout !== undefined && isUserLoggedIn !== undefined && !(isConfirming && confirmation.isPending);

    useEffect(() => {
        if (!isCheckoutSettled || handledCheckoutReturn.current) return;
        handledCheckoutReturn.current = true;

        if (isConfirming && confirmation.data?.hasAccess) {
            queryClient.setQueryData(accessOptions.queryKey, confirmation.data);
            toast.add({ description: "Payment received. You can export now, and any time after.", type: "success" });
        } else if (checkout === "cancelled") {
            toast.add({ description: "Payment cancelled. You haven't been charged.", type: "warning" });
        } else if (isConfirming) {
            toast.add({
                description: confirmation.isError
                    ? "Couldn't confirm your payment. If you were charged, export unlocks within a few minutes."
                    : "Your payment is still processing. Export unlocks as soon as it goes through.",
                type: "warning",
            });
        }

        void navigate({
            search: previous => ({ ...previous, checkout: undefined, session_id: undefined }),
            replace: true,
        });
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- fires once per return from checkout, guarded by the ref above
    }, [isCheckoutSettled]);

    const isBusy = isPending || isStartingCheckout || isLeavingForCheckout || isConfirming;

    return (
        <>
            <Button size="sm" onClick={handleExport} disabled={isBusy}>
                {isBusy ? <Spinner /> : <Download />}
                Export
            </Button>

            <SignInDialog
                title="Sign in to export"
                description="Exporting a theme requires an account. Your design is kept in this browser while you sign in, so you'll pick up right where you left off."
                open={openSignInDialog}
                onOpenChange={() => setOpenSignInDialog(false)}
                onSignIn={handleSignIn}
            />

            <PaywallDialog
                open={openPaywallDialog}
                onOpenChange={() => setOpenPaywallDialog(false)}
                onContinue={handleContinueToPayment}
            />
        </>
    );
}
