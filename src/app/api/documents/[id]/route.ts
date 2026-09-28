import { isDatabaseConfigured } from "@/lib/db";
import { documentFilename, isDocumentKind, isMediaId } from "@/lib/media";
import { findDocumentOwner, getMediaAsset } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isMediaId(id) || !isDatabaseConfigured()) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const session = await getSession();
    if (!session) return new Response("Not found", { status: 404 });

    const asset = await getMediaAsset(id);
    if (!asset || !isDocumentKind(asset.kind)) {
      return new Response("Not found", { status: 404 });
    }

    const owner = await findDocumentOwner(id);
    if (!owner) return new Response("Not found", { status: 404 });
    if (!isAdmin(session) && session.userId !== owner.userId) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(new Uint8Array(asset.bytes), {
      headers: {
        "Content-Type": asset.mime_type,
        "Content-Disposition": `inline; filename="${documentFilename(asset.kind, asset.mime_type)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
