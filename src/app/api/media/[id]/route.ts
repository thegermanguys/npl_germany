import { getMediaAsset } from "@/lib/queries";
import { isDatabaseConfigured } from "@/lib/db";
import { isMediaId, isPublicMediaKind } from "@/lib/media";

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
    const asset = await getMediaAsset(id);
    if (!asset || !isPublicMediaKind(asset.kind)) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(new Uint8Array(asset.bytes), {
      headers: {
        "Content-Type": asset.mime_type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
