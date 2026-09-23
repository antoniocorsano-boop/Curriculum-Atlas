import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const DEFAULTS = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 82,
  maxInputPixels: 40000000,
  maxOutputBytes: 2000000
};

const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

function sha256(buffer) {
  return "sha256:" + crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function normalizeImage(inputPath, outputPath, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const input = sharp(inputPath, {
    failOn: "warning",
    limitInputPixels: config.maxInputPixels,
    sequentialRead: true
  });

  const source = await input.metadata();
  if (!ALLOWED_INPUT_FORMATS.has(source.format)) {
    throw new Error("MAT_PUB_B_UNSUPPORTED_INPUT_FORMAT:" + (source.format || "unknown"));
  }

  const outputBuffer = await input
    .rotate()
    .resize({
      width: config.maxWidth,
      height: config.maxHeight,
      fit: "inside",
      withoutEnlargement: true
    })
    .toColorspace("srgb")
    .webp({
      quality: config.quality,
      effort: 4,
      smartSubsample: true
    })
    .toBuffer();

  if (outputBuffer.length > config.maxOutputBytes) {
    throw new Error("MAT_PUB_B_OUTPUT_TOO_LARGE:" + outputBuffer.length);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, outputBuffer);

  const resultMeta = await sharp(outputBuffer).metadata();
  if (resultMeta.exif || resultMeta.xmp || resultMeta.iptc) {
    throw new Error("MAT_PUB_B_METADATA_STRIP_FAILED");
  }
  if (resultMeta.format !== "webp") {
    throw new Error("MAT_PUB_B_FORMAT_FAILED:" + (resultMeta.format || "unknown"));
  }
  if (!resultMeta.width || !resultMeta.height || resultMeta.width > config.maxWidth || resultMeta.height > config.maxHeight) {
    throw new Error("MAT_PUB_B_DIMENSION_BUDGET_FAILED");
  }

  return {
    mimeType: "image/webp",
    width: resultMeta.width,
    height: resultMeta.height,
    filesize: outputBuffer.length,
    checksum: sha256(outputBuffer),
    source: {
      format: source.format,
      width: source.width || null,
      height: source.height || null
    },
    metadataStripped: true
  };
}

async function selfTest() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "atlas-mat-pub-b-"));
  const sourcePath = path.join(dir, "source.jpg");
  const outputPath = path.join(dir, "normalized.webp");

  await sharp({
    create: {
      width: 3000,
      height: 1800,
      channels: 3,
      background: { r: 230, g: 240, b: 250 }
    }
  })
    .withMetadata({ orientation: 6 })
    .jpeg({ quality: 90 })
    .toFile(sourcePath);

  const before = await sharp(sourcePath).metadata();
  if (!before.exif) throw new Error("MAT_PUB_B_SELFTEST_SOURCE_METADATA_MISSING");

  const result = await normalizeImage(sourcePath, outputPath, {
    maxWidth: 1200,
    maxHeight: 1200,
    maxOutputBytes: 500000
  });

  const after = await sharp(outputPath).metadata();
  if (after.exif || after.xmp || after.iptc) {
    throw new Error("MAT_PUB_B_SELFTEST_METADATA_NOT_STRIPPED");
  }
  if (after.width > 1200 || after.height > 1200) {
    throw new Error("MAT_PUB_B_SELFTEST_RESIZE_FAILED");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(result.checksum)) {
    throw new Error("MAT_PUB_B_SELFTEST_CHECKSUM_FAILED");
  }

  console.log("MAT_PUB_B_SELFTEST_PASS");
  console.log(JSON.stringify(result, null, 2));
}

function readArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  if (process.argv.includes("--self-test")) {
    await selfTest();
    return;
  }

  const inputPath = readArg("--input");
  const outputPath = readArg("--output");
  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/normalize-image.mjs --input <file> --output <file.webp>");
    console.error("   or: node scripts/normalize-image.mjs --self-test");
    process.exitCode = 2;
    return;
  }

  const result = await normalizeImage(inputPath, outputPath);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
