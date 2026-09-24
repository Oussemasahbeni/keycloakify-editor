import type { ParsedTheme } from "#/features/editor/shared/parse-theme-jar";

const DB_NAME = "keycloakify-editor";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "current";
const DRAFT_VERSION = 1;

export type ThemeDraft = ParsedTheme & {
    version: typeof DRAFT_VERSION;
    savedAt: number;
};

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveDraft(draft: ParsedTheme): Promise<void> {
    const db = await openDb();
    try {
        const record: ThemeDraft = {
            ...draft,
            version: DRAFT_VERSION,
            savedAt: Date.now(),
        };
        await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record, DRAFT_KEY));
    } finally {
        db.close();
    }
}

export async function loadDraft(): Promise<ThemeDraft | undefined> {
    const db = await openDb();
    try {
        const draft = await requestToPromise(
            db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DRAFT_KEY),
        );
        if (draft && draft.version !== DRAFT_VERSION) {
            await clearDraft();
            return undefined;
        }
        return draft;
    } finally {
        db.close();
    }
}

export async function clearDraft(): Promise<void> {
    const db = await openDb();
    try {
        await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(DRAFT_KEY));
    } finally {
        db.close();
    }
}
