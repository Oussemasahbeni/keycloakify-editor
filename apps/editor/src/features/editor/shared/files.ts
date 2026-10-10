export const MAX_IMAGE_SIZE_BYTES = 1024 * 1024; // 1 MB

export const EMAIL_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
export const EMAIL_IMAGE_MIME_TYPES = ["image/png", "image/jpeg"];

export const LOGIN_IMAGE_EXTENSIONS = [".png", ".svg", ".jpg", ".jpeg"];
export const LOGIN_IMAGE_MIME_TYPES = ["image/png", "image/svg+xml", "image/jpeg"];

const EXTENSION_BY_MIME: Record<string, string> = {
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/jpeg": "jpg",
};

const MIME_BY_EXTENSION: Record<string, string> = {
    png: "image/png",
    svg: "image/svg+xml",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    ico: "image/x-icon",
};

/**
 * Safe lowercase extension for the baked asset filename, from the upload's name
 * (preferred) or MIME type. Defaults to `png`. The result feeds a `<baseName>.<ext>`
 * filename that must satisfy the JAR's `ASSET_NAME_PATTERN`.
 */
export function getImageExtension(file: File): string {
    const fromName = /\.([a-z0-9]+)$/.exec(file.name.toLowerCase())?.[1];
    if (fromName === "jpeg") return "jpg";
    if (fromName && ["png", "svg", "jpg"].includes(fromName)) return fromName;
    return EXTENSION_BY_MIME[file.type] ?? "png";
}

/** MIME type inferred from a filename's extension; falls back to octet-stream. */
export function mimeFromFilename(name: string): string {
    const ext = /\.([a-z0-9]+)$/.exec(name.toLowerCase())?.[1];
    return (ext && MIME_BY_EXTENSION[ext]) || "application/octet-stream";
}

const ZIP_SIGNATURES = [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
];

export function isValidJarSignature(bytes: Uint8Array): boolean {
    if (bytes.length < 4) return false;
    return ZIP_SIGNATURES.some(sig => sig.every((byte, i) => bytes[i] === byte));
}

/** What the upload rules look at — a `File`, or the same facts about one held elsewhere. */
export type FileMeta = Pick<File, "name" | "type" | "size">;
