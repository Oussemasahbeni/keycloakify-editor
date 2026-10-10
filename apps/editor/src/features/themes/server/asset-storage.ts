import {
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Where uploaded theme images live: a bucket in Neon Object Storage, reached
 * through its S3 API. Postgres holds one key per image
 *
 * The bytes go between the browser and the bucket directly, over short-lived
 * signed URLs issued here — never through this server, whose host caps request
 * and response bodies at a few megabytes. Signed URLs are used for downloads
 * too, so nothing depends on the bucket being publicly readable.
 *
 * Objects are never overwritten. Every upload gets a fresh key, a save records
 * the new keys on the theme in one statement, and the objects it replaced are
 * deleted afterwards. A failure in between leaves an unreferenced object behind, never
 * a row pointing at missing or half-written bytes.
 */

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const DOWNLOAD_URL_TTL_SECONDS = 10 * 60;

const client = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
});
const bucket = process.env.THEME_ASSETS_BUCKET;

/**
 * Keys start with the uploader's `sub`. That prefix is how a save tells that a
 * key it is handed was issued to the same user. The `sub` is encoded so one
 * containing a slash can't produce a prefix that sits inside another user's.
 */
const keyPrefix = (ownerSub: string) => `${encodeURIComponent(ownerSub)}/`;

export const newAssetKey = (ownerSub: string) => `${keyPrefix(ownerSub)}${crypto.randomUUID()}`;

export const isAssetKeyOf = (ownerSub: string, key: string) => key.startsWith(keyPrefix(ownerSub));

/** A URL the browser can `PUT` one file to, with exactly this content type. */
export function signUpload(key: string, mimeType: string): Promise<string> {
    return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: mimeType }), {
        expiresIn: UPLOAD_URL_TTL_SECONDS,
    });
}

export function signDownload(key: string): Promise<string> {
    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
        expiresIn: DOWNLOAD_URL_TTL_SECONDS,
    });
}

/** What actually landed in the bucket, or null if nothing did. */
export async function describeAsset(key: string): Promise<{ size: number; mimeType: string } | null> {
    try {
        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return { size: head.ContentLength ?? 0, mimeType: head.ContentType ?? "application/octet-stream" };
    } catch (error) {
        if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchKey")) return null;
        throw error;
    }
}

/** Server-side copy to a new key (read then write: the S3 copy operation isn't documented as supported). */
export async function copyAsset(sourceKey: string, targetKey: string, mimeType: string): Promise<void> {
    const { Body } = await client.send(new GetObjectCommand({ Bucket: bucket, Key: sourceKey }));
    if (!Body) throw new Error("A stored image is missing.");
    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: targetKey,
            Body: await Body.transformToByteArray(),
            ContentType: mimeType,
        }),
    );
}

/**
 * Removes objects nothing references any more. Never throws: by the time this
 * runs the save, delete or rollback it belongs to has already been decided, and
 * a leftover object costs storage but breaks nothing.
 */
export async function discardAssets(keys: readonly string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
        await client.send(
            new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map(Key => ({ Key })), Quiet: true } }),
        );
    } catch (error) {
        console.error(`Couldn't delete ${keys.length} unreferenced theme image(s):`, keys, error);
    }
}
