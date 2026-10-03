import { useEffect, useState } from "react";

/**
 * A `blob:` URL for a `File`/`Blob`, usable as an `<img src>` (or anywhere else in
 * this origin, same-origin iframes included). It is revoked when the file changes
 * and on unmount, so callers never leak object URLs.
 *
 * Returns `undefined` while there is no file. For a URL that must survive a trip
 * to the server (e.g. the email render), read the file as a `data:` URL instead.
 */
export function useObjectUrl(file: Blob | null | undefined): string | undefined {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        // Blob URLs are an external resource: create + revoke in the same effect so every URL is
        // released. (A useMemo version leaks/revokes wrongly under StrictMode's double invocation.)
        if (!file) {
            // oxlint-disable-next-line react/set-state-in-effect -- see above
            setUrl(undefined);
            return;
        }
        const next = URL.createObjectURL(file);
        // oxlint-disable-next-line react/set-state-in-effect -- see above
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
}
