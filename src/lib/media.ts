export const MEDIA_KINDS = ["player_photo", "franchise_logo", "league_logo"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_MEDIA_BYTES = 512 * 1024;

export function mediaPath(id: string): string {
  return `/api/media/${id}`;
}

export function isMediaId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function asMediaBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    return Buffer.from(hex, "hex");
  }
  throw new Error("invalid media bytes");
}

export async function readImageFile(
  file: File | null,
): Promise<{ ok: true; mime: string; bytes: Buffer } | { ok: false; error: string }> {
  if (!file || file.size === 0) return { ok: false, error: "Choose a file." };
  if (file.size > MAX_MEDIA_BYTES) return { ok: false, error: "Keep the image under 512 KB." };
  if (!ALLOWED_MEDIA_TYPES.includes(file.type as (typeof ALLOWED_MEDIA_TYPES)[number])) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP." };
  }
  return { ok: true, mime: file.type, bytes: Buffer.from(await file.arrayBuffer()) };
}
