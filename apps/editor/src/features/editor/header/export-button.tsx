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

import { generateJar } from "../server/generate-jar";
import { SURFACES } from "../shared/model/surface";
import { buildThemeFormData } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";
import { useSaveTheme } from "../state/use-save-theme";
import { PaywallDialog } from "./paywall-dialog";

const editorRoute = getRouteApi("/_editor");

/**
 * Exports the theme as a JAR, which takes lifetime access. A user without it is
 * sent to pay, which leaves the page, so the theme is saved to their account
 * first and Stripe sends them back to it, ready to export.
 *
 * What is shown here is a convenience: the server refuses an export without
 * access whatever this component believes.
 */
export function ExportButton() {
    const {
        themeName,
        theme,
        persistence: { saved, isDirty },
    } = useEditor();
    const { saveTheme, isSaving } = useSaveTheme();

    const { checkout, session_id: sessionId } = editorRoute.useSearch();
    const navigate = editorRoute.useNavigate();
    const pathname = useLocation({ select: location => location.pathname });
    const queryClient = useQueryClient();

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
        enabled: checkout !== "success",
    });
    const { data: access } = useQuery(accessOptions);

    // Stripe's redirect only says a checkout ended; whether it was paid is asked
    // of the server, which asks Stripe.
    const confirmationOptions = queryOptions({
        queryKey: ["billing-checkout", sessionId ?? null, confirmPayment],
        queryFn: () => confirmPayment({ data: { sessionId: sessionId ?? "" } }),
        enabled: checkout === "success" && sessionId !== undefined,
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
        mutationFn: async (themeId: string) => {
            const surface = SURFACES.find(option => pathname.startsWith(option.to))?.value ?? "login";
            return requestCheckout({ data: { surface, themeId } });
        },
        onSuccess: result => {
            if (result.status === "already-paid") {
                queryClient.setQueryData(accessOptions.queryKey, { hasAccess: true });
                return exportTheme();
            }
            setIsLeavingForCheckout(true);
            window.location.assign(result.url);
        },
        onError: error => {
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

        // While access is unknown (still loading, or the check failed) the export
        // is simply attempted: the server decides either way.
        if (access?.hasAccess === false) return setOpenPaywallDialog(true);

        exportTheme();
    }

    async function handleContinueToPayment() {
        setOpenPaywallDialog(false);
        // Stripe's redirect leaves the page: unsaved edits go to the account first,
        // and the return URL opens the saved theme. A failed save has been reported.
        const target = saved !== null && !isDirty ? saved : await saveTheme().catch(() => null);
        if (target) startCheckout(target.id);
    }

    // Back from Stripe: report how it went, then take the checkout parameters out of the URL.
    const isConfirming = checkout === "success" && sessionId !== undefined;
    const isCheckoutSettled = checkout !== undefined && !(isConfirming && confirmation.isPending);

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

    const isBusy = isPending || isSaving || isStartingCheckout || isLeavingForCheckout || isConfirming;

    return (
        <>
            <Button size="sm" onClick={handleExport} disabled={isBusy}>
                {isBusy ? <Spinner /> : <Download />}
                Export
            </Button>

            <PaywallDialog
                open={openPaywallDialog}
                onOpenChange={() => setOpenPaywallDialog(false)}
                onContinue={handleContinueToPayment}
            />
        </>
    );
}
