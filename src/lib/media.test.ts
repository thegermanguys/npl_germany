import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  asMediaBuffer,
  bytesForDatabase,
  DOCUMENT_SLOTS,
  documentFilename,
  documentPath,
  isDocumentKind,
  isDocumentSlot,
  isMediaId,
  isPublicMediaKind,
  MAX_MEDIA_BYTES,
  mediaPath,
  readDocumentFile,
  readImageFile,
} from "./media.ts";

describe("mediaPath", () => {
  it("serves assets from /api/media", () => {
    assert.equal(mediaPath("11111111-1111-4111-8111-111111111111"), "/api/media/11111111-1111-4111-8111-111111111111");
  });
});

describe("isMediaId", () => {
  it("accepts a uuid", () => {
    assert.equal(isMediaId("a1b2c3d4-e5f6-4111-8111-222222222222"), true);
  });
  it("rejects a path fragment", () => {
    assert.equal(isMediaId("../secret"), false);
  });
});

describe("asMediaBuffer", () => {
  it("reads neon and node bytea shapes", () => {
    const raw = Buffer.from([1, 2, 3]);
    assert.deepEqual(asMediaBuffer(raw), raw);
    assert.deepEqual(asMediaBuffer(new Uint8Array([1, 2, 3])), raw);
    assert.deepEqual(asMediaBuffer({ data: [1, 2, 3] }), raw);
    assert.deepEqual(bytesForDatabase(raw) instanceof Uint8Array, true);
  });
});

describe("readImageFile", () => {
  it("rejects an empty file", async () => {
    const result = await readImageFile(new File([], "empty.png", { type: "image/png" }));
    assert.equal(result.ok, false);
  });
  it("rejects a non-image type", async () => {
    const result = await readImageFile(new File(["hello"], "notes.txt", { type: "text/plain" }));
    assert.equal(result.ok, false);
  });
  it("accepts a small png", async () => {
    const result = await readImageFile(new File([new Uint8Array([1, 2, 3])], "p.png", { type: "image/png" }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.mime, "image/png");
  });
  it("allows 2 MB and does not mention 512 KB", async () => {
    assert.equal(MAX_MEDIA_BYTES, 2 * 1024 * 1024);
    const tooBig = await readImageFile(
      new File([new Uint8Array(MAX_MEDIA_BYTES + 1)], "big.png", { type: "image/png" }),
    );
    assert.equal(tooBig.ok, false);
    if (!tooBig.ok) {
      assert.equal(tooBig.error, "Keep the image under 2 MB.");
      assert.equal(tooBig.error.includes("512"), false);
    }
  });
});

describe("documents", () => {
  it("keeps private kinds off the public media path", () => {
    assert.equal(isPublicMediaKind("player_photo"), true);
    assert.equal(isPublicMediaKind("passport"), false);
    assert.equal(isDocumentKind("passport"), true);
    assert.equal(isDocumentKind("player_photo"), false);
    assert.equal(isDocumentSlot("health_insurance"), true);
    assert.equal(documentPath("11111111-1111-4111-8111-111111111111"), "/api/documents/11111111-1111-4111-8111-111111111111");
    assert.equal(documentFilename("health_insurance", "application/pdf"), "health-insurance.pdf");
  });

  it("lists the three account slots", () => {
    assert.deepEqual(
      DOCUMENT_SLOTS.map((slot) => slot.label),
      ["Passport", "Residence permit", "Health insurance confirmation"],
    );
  });

  it("accepts a PDF and rejects WebP", async () => {
    const pdf = await readDocumentFile(new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "p.pdf", { type: "application/pdf" }));
    assert.equal(pdf.ok, true);
    if (pdf.ok) assert.equal(pdf.mime, "application/pdf");
    const webp = await readDocumentFile(new File([new Uint8Array([1, 2, 3])], "p.webp", { type: "image/webp" }));
    assert.equal(webp.ok, false);
    if (!webp.ok) assert.equal(webp.error, "Use a PDF, JPEG, or PNG.");
  });

  it("keeps documents under 2 MB", async () => {
    const tooBig = await readDocumentFile(
      new File([new Uint8Array(MAX_MEDIA_BYTES + 1)], "big.pdf", { type: "application/pdf" }),
    );
    assert.equal(tooBig.ok, false);
    if (!tooBig.ok) {
      assert.equal(tooBig.error, "Keep the file under 2 MB.");
      assert.equal(tooBig.error.includes("512"), false);
    }
  });
});
