/**
 * Normalise every landing-gallery capture to one frame and emit AVIF/WebP siblings.
 *
 * The captures come out of the editor at whatever size the window was, and as
 * lossless PNG — fine for a screenshot of flat UI, ruinous for one containing a
 * photograph (`side-panel-image.png` was 2.4 MB). `Screenshot` serves
 * AVIF → WebP → PNG, so this generates the two it prefers and leaves the PNG as
 * the floor.
 *
 * Re-runnable: each file is read into a buffer before anything is written, so
 * overwriting in place is safe. Run it whenever a capture is added or replaced:
 *
 *     pnpm -F @keycloakify-editor/app encode-gallery
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const DIR = "public/images/gallery";

/** One frame for every slide — mismatched framing is what makes a carousel look sloppy. */
const FRAME = { width: 1991, height: 1271 };

const kb = n => `${String(Math.round(n / 1024)).padStart(5)}K`;
const files = (await readdir(DIR)).filter(f => f.endsWith(".png")).sort();

let pngBefore = 0;
let avifAfter = 0;

for (const file of files) {
    const png = path.join(DIR, file);
    const base = png.replace(/\.png$/, "");
    const input = await readFile(png);
    pngBefore += input.length;

    const framed = () => sharp(input).resize({ ...FRAME, fit: "cover", position: "center" });

    const [pngOut, webpOut, avifOut] = await Promise.all([
        framed().png({ compressionLevel: 9, effort: 10 }).toBuffer(),
        framed().webp({ quality: 82 }).toBuffer(),
        framed().avif({ quality: 55, effort: 6 }).toBuffer(),
    ]);

    await Promise.all([writeFile(png, pngOut), writeFile(`${base}.webp`, webpOut), writeFile(`${base}.avif`, avifOut)]);

    avifAfter += avifOut.length;
    console.log(
        `${file.padEnd(28)} png ${kb(input.length)} →${kb(pngOut.length)}   webp ${kb(webpOut.length)}   avif ${kb(avifOut.length)}`,
    );
}

console.log(`\n${files.length} captures at ${FRAME.width}×${FRAME.height}`);
console.log(`PNG ${Math.round(pngBefore / 1024)}K  →  AVIF ${Math.round(avifAfter / 1024)}K actually served`);
