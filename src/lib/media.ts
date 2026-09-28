export const PUBLIC_MEDIA_KINDS = ["player_photo", "franchise_logo", "league_logo"] as const;
export const DOCUMENT_KINDS = ["passport", "residence_permit", "health_insurance"] as const;
export const MEDIA_KINDS = [...PUBLIC_MEDIA_KINDS, ...DOCUMENT_KINDS] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_SLOTS = [
  { slot: "passport", kind: "passport", label: "Passport" },
  { slot: "residence_permit", kind: "residence_permit", label: "Residence permit" },
  { slot: "health_insurance", kind: "health_insurance", label: "Health insurance confirmation" },
] as const;
export type DocumentSlot = (typeof DOCUMENT_SLOTS)[number]["slot"];

export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_MEDIA_BYTES = 2 * 1024 * 1024;

export function mediaPath(id: string): string {
  return `/api/media/${id}`;
}

export function documentPath(id: string): string {
  return `/api/documents/${id}`;
}

export function isPublicMediaKind(kind: string): boolean {
  return (PUBLIC_MEDIA_KINDS as readonly string[]).includes(kind);
}

export function isDocumentKind(kind: string): kind is DocumentKind {
  return (DOCUMENT_KINDS as readonly string[]).includes(kind);
}

export function isDocumentSlot(value: string): value is DocumentSlot {
  return DOCUMENT_SLOTS.some((slot) => slot.slot === value);
}

export function documentIdForSlot(
  documents: {
    passport_id: string | null;
    residence_permit_id: string | null;
    health_insurance_id: string | null;
  },
  slot: DocumentSlot,
): string | null {
  if (slot === "passport") return documents.passport_id;
  if (slot === "residence_permit") return documents.residence_permit_id;
  return documents.health_insurance_id;
}

export function documentFilename(kind: DocumentKind, mimeType: string): string {
  const ext = mimeType === "application/pdf" ? "pdf" : mimeType === "image/png" ? "png" : "jpg";
  const base =
    kind === "residence_permit" ? "residence-permit" : kind === "health_insurance" ? "health-insurance" : "passport";
  return `${base}.${ext}`;
}

export function isMediaId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function asMediaBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return Buffer.from(value);
  }
  if (value && typeof value === "object" && "data" in value && Array.isArray((value as { data: unknown }).data)) {
    return Buffer.from((value as { data: number[] }).data);
  }
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    return Buffer.from(hex, "hex");
  }
  throw new Error("invalid media bytes");
}

export function bytesForDatabase(bytes: Buffer): Uint8Array {
  return new Uint8Array(bytes);
}

function sniffImageType(bytes: Uint8Array): (typeof ALLOWED_MEDIA_TYPES)[number] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function sniffPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

export async function readImageFile(
  file: File | Blob | null,
): Promise<{ ok: true; mime: string; bytes: Buffer } | { ok: false; error: string }> {
  if (!file) return { ok: false, error: "Choose a file." };
  const size = "size" in file ? Number(file.size) : 0;
  if (!size) return { ok: false, error: "Choose a file." };
  if (size > MAX_MEDIA_BYTES) return { ok: false, error: "Keep the image under 2 MB." };
  try {
    if (typeof file.arrayBuffer !== "function") return { ok: false, error: "Choose a file." };
    const bytes = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(bytes);
    const declared = "type" in file ? String(file.type ?? "") : "";
    const mime = sniffed ?? (ALLOWED_MEDIA_TYPES.includes(declared as (typeof ALLOWED_MEDIA_TYPES)[number])
      ? (declared as (typeof ALLOWED_MEDIA_TYPES)[number])
      : null);
    if (!mime) return { ok: false, error: "Use a JPEG, PNG, or WebP." };
    return { ok: true, mime, bytes };
  } catch {
    return { ok: false, error: "Could not read that file." };
  }
}

export async function readDocumentFile(
  file: File | Blob | null,
): Promise<{ ok: true; mime: string; bytes: Buffer } | { ok: false; error: string }> {
  if (!file) return { ok: false, error: "Choose a file." };
  const size = "size" in file ? Number(file.size) : 0;
  if (!size) return { ok: false, error: "Choose a file." };
  if (size > MAX_MEDIA_BYTES) return { ok: false, error: "Keep the file under 2 MB." };
  try {
    if (typeof file.arrayBuffer !== "function") return { ok: false, error: "Choose a file." };
    const bytes = Buffer.from(await file.arrayBuffer());
    const sniffedImage = sniffImageType(bytes);
    const imageOk = sniffedImage === "image/jpeg" || sniffedImage === "image/png";
    const declared = "type" in file ? String(file.type ?? "") : "";
    const mime = sniffPdf(bytes)
      ? "application/pdf"
      : imageOk
        ? sniffedImage
        : ALLOWED_DOCUMENT_TYPES.includes(declared as (typeof ALLOWED_DOCUMENT_TYPES)[number])
          ? (declared as (typeof ALLOWED_DOCUMENT_TYPES)[number])
          : null;
    if (!mime) return { ok: false, error: "Use a PDF, JPEG, or PNG." };
    return { ok: true, mime, bytes };
  } catch {
    return { ok: false, error: "Could not read that file." };
  }
}
