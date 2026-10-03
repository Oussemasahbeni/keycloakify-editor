const SESSION_STORAGE_KEY = "redirectUrlOrigin";

function webOriginOf(value: string): string | undefined {
    try {
        const { protocol, origin } = new URL(value, window.location.origin);
        return protocol === "http:" || protocol === "https:" ? origin : undefined;
    } catch {
        return undefined;
    }
}

export const redirectUrlOrigin = ((): string | undefined => {
    from_url: {
        const url = new URL(window.location.href);

        const value = url.searchParams.get("redirect_uri");

        if (value === null) {
            break from_url;
        }

        const origin = webOriginOf(value);

        if (origin === undefined) {
            break from_url;
        }

        sessionStorage.setItem(SESSION_STORAGE_KEY, origin);

        return origin;
    }

    from_session_storage: {
        const storedOrigin = sessionStorage.getItem(SESSION_STORAGE_KEY);

        if (storedOrigin === null) {
            break from_session_storage;
        }

        return storedOrigin;
    }

    return undefined;
})();
