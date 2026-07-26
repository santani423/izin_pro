import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_LOGO_URL,
  DEFAULT_FAVICON_URL,
  resolveBrandLogoUrl,
  resolveBrandFaviconUrl,
  getPublicBrandingUrl,
  saveBrandAssetFile,
  deleteBrandAssetFile,
} from "./branding";

test("uses the configured logo when provided", () => {
  const result = resolveBrandLogoUrl("/uploads/branding/custom.png");
  assert.equal(result, "/uploads/branding/custom.png");
});

test("falls back to the default logo when no custom logo is configured", () => {
  const result = resolveBrandLogoUrl(null);
  assert.equal(result, DEFAULT_LOGO_URL);
});

test("uses the configured favicon when provided", () => {
  const result = resolveBrandFaviconUrl("/uploads/branding/favicon-123.png");
  assert.equal(result, "/uploads/branding/favicon-123.png");
});

test("falls back to the default favicon when none is configured", () => {
  const result = resolveBrandFaviconUrl(null);
  assert.equal(result, DEFAULT_FAVICON_URL);
});

test("getPublicBrandingUrl returns the stored path when the file exists on disk", async () => {
  const result = await getPublicBrandingUrl(DEFAULT_LOGO_URL, "/should-not-be-used.png");
  assert.equal(result, DEFAULT_LOGO_URL);
});

test("getPublicBrandingUrl falls back when the file is missing (deleted/corrupted path)", async () => {
  const result = await getPublicBrandingUrl("/uploads/branding/does-not-exist-12345.png", DEFAULT_LOGO_URL);
  assert.equal(result, DEFAULT_LOGO_URL);
});

test("getPublicBrandingUrl falls back when no path is configured at all", async () => {
  const result = await getPublicBrandingUrl(null, DEFAULT_LOGO_URL);
  assert.equal(result, DEFAULT_LOGO_URL);
});

test("saveBrandAssetFile rejects unsupported mime types", async () => {
  const file = new File([Buffer.from("not-an-image")], "malware.exe", { type: "application/x-msdownload" });
  await assert.rejects(() => saveBrandAssetFile(file, "logo"), /Format tidak didukung/);
});

test("saveBrandAssetFile rejects files larger than 2MB", async () => {
  const big = Buffer.alloc(2 * 1024 * 1024 + 1);
  const file = new File([big], "huge.png", { type: "image/png" });
  await assert.rejects(() => saveBrandAssetFile(file, "logo"), /Maksimal 2MB/);
});

test("saveBrandAssetFile accepts SVG and writes it under public/uploads/branding", async () => {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg'></svg>";
  const file = new File([svg], "logo.svg", { type: "image/svg+xml" });
  const url = await saveBrandAssetFile(file, "logo");
  try {
    assert.match(url, /^\/uploads\/branding\/logo-\d+-[a-z0-9]+\.svg$/);
    await fs.access(path.join(process.cwd(), "public", url));
  } finally {
    await fs.unlink(path.join(process.cwd(), "public", url)).catch(() => {});
  }
});

test("deleteBrandAssetFile removes an uploaded asset", async () => {
  const file = new File(["fake-png-bytes"], "temp.png", { type: "image/png" });
  const url = await saveBrandAssetFile(file, "favicon");
  const absolutePath = path.join(process.cwd(), "public", url);
  await fs.access(absolutePath); // masih ada sebelum dihapus

  await deleteBrandAssetFile(url);

  await assert.rejects(() => fs.access(absolutePath));
});

test("deleteBrandAssetFile never removes the built-in default logo/favicon", async () => {
  await deleteBrandAssetFile(DEFAULT_LOGO_URL);
  await fs.access(path.join(process.cwd(), "public", DEFAULT_LOGO_URL)); // masih ada
});

test("deleteBrandAssetFile is a no-op for null/missing paths (no throw)", async () => {
  await deleteBrandAssetFile(null);
  await deleteBrandAssetFile(undefined);
});
