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
        if (!file) {
            setUrl(undefined);
            return;
        }
        const next = URL.createObjectURL(file);
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
}
