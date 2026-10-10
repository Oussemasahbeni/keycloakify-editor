// Lets the editor's pages upload theme images to, and download them from, the
// object-storage bucket directly. Run once per bucket, and again whenever the
// list of sites that serve the editor changes:
//
//   node --env-file=.env scripts/set-bucket-cors.mjs http://localhost:3000 https://your-site.example
//
// Reads the same AWS_* and THEME_ASSETS_BUCKET variables as the app.
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const origins = process.argv.slice(2);
const { AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, THEME_ASSETS_BUCKET } = process.env;

if (origins.length === 0) {
    console.error("Pass at least one origin, e.g. http://localhost:3000");
    process.exit(1);
}
if (!AWS_ENDPOINT_URL_S3 || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !THEME_ASSETS_BUCKET) {
    console.error(
        "Set AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and THEME_ASSETS_BUCKET.",
    );
    process.exit(1);
}

const client = new S3Client({
    endpoint: AWS_ENDPOINT_URL_S3,
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
    forcePathStyle: true,
});

await client.send(
    new PutBucketCorsCommand({
        Bucket: THEME_ASSETS_BUCKET,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedOrigins: origins,
                    AllowedMethods: ["GET", "PUT"],
                    AllowedHeaders: ["content-type"],
                    MaxAgeSeconds: 3600,
                },
            ],
        },
    }),
);

console.log(`CORS on ${THEME_ASSETS_BUCKET} now allows GET and PUT from: ${origins.join(", ")}`);
