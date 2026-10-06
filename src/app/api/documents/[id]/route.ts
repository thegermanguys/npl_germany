import { canOpenIdentityDocuments, staffBlockedFromDocuments } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/db";
import { documentFilename, isDocumentKind, isMediaId } from "@/lib/media";
import { findDocumentOwner, franchiseForUser, getMediaAsset } from "@/lib/queries";
import { getSession, isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

function forbiddenDocument(): Response {
  return new Response(
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>You cannot open this page</title></head><body><h1>You cannot open this page</h1></body></html>",
    {
      status: 403,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

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
    if (staffBlockedFromDocuments(session.role)) return forbiddenDocument();

    const asset = await getMediaAsset(id);
    if (!asset || !isDocumentKind(asset.kind)) {
      return new Response("Not found", { status: 404 });
    }

    const owner = await findDocumentOwner(id);
    if (!owner) return new Response("Not found", { status: 404 });

    let allowed = isAdmin(session) || session.userId === owner.userId;
    if (!allowed && session.role === "franchise_owner" && canOpenIdentityDocuments(session.role)) {
      const club = await franchiseForUser(session.userId);
      allowed = Boolean(club && owner.franchiseId && club.id === owner.franchiseId);
    }
    if (!allowed) return new Response("Not found", { status: 404 });

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
