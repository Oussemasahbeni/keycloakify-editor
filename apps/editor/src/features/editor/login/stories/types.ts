import type { KcContext } from "@keycloakify-editor/shadcn-theme/preview";

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export type PageId = KcContext["pageId"];

export const pageCategories = [
    { id: "sign-in", label: "Sign-in" },
    { id: "registration", label: "Registration & profile" },
    { id: "credentials", label: "Passwords & credentials" },
    { id: "idp", label: "Identity providers" },
    { id: "sessions", label: "Consent & sessions" },
    { id: "status", label: "Status & errors" },
] as const;

export type PageCategory = (typeof pageCategories)[number]["id"];

export type PageGroup = {
    id: PageCategory;
    label: string;
    pages: PagePreview[];
};

export type PageStory<TId extends PageId = PageId> = {
    id: string;
    label: string;
    /**
     * Partial `kcContext`, deep-merged over the page's base mock. Typed against this page's context.
     */
    overrides?: DeepPartial<Extract<KcContext, { pageId: TId }>>;
};

export type PagePreview<TId extends PageId = PageId> = {
    pageId: TId;
    label: string;
    category: PageCategory;
    /** At least one scenario; the first is treated as the default. */
    stories: [PageStory<TId>, ...PageStory<TId>[]];
};
