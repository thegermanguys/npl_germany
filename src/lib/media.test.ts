import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { asMediaBuffer, bytesForDatabase, isMediaId, mediaPath, readImageFile } from "./media.ts";

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
});
