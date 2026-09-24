import { SITE_URL } from "#/config/constants.ts";

const SITE_NAME = "Keycloakify Editor";
const TWITTER_HANDLE = "@Spike_2002";

/**
 * Build the meta tags for a page. Pair this with a canonical `<link>` in the
 * route's `head.links` (see `routes/index.tsx`).
 */
export const seo = ({
    title,
    description,
    keywords,
    image,
    url,
}: {
    title: string;
    description?: string;
    image?: string;
    keywords?: string;
    /** Absolute or root-relative URL of the page, used for og:url. */
    url?: string;
}) => {
    const absoluteImage = image
        ? image.startsWith("http")
            ? image
            : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
        : undefined;
    const absoluteUrl = url
        ? url.startsWith("http")
            ? url
            : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`
        : SITE_URL;

    const tags = [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:creator", content: TWITTER_HANDLE },
        { name: "twitter:site", content: TWITTER_HANDLE },
        { name: "twitter:card", content: absoluteImage ? "summary_large_image" : "summary" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl },
        { property: "og:locale", content: "en_US" },
        ...(absoluteImage
            ? [
                  { name: "twitter:image", content: absoluteImage },
                  { property: "og:image", content: absoluteImage },
                  { property: "og:image:alt", content: title },
              ]
            : []),
    ];

    return tags;
};
