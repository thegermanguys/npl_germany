import { forbidden, redirect } from "next/navigation";
import { forbiddenForClub } from "@/lib/access";
import { isDatabaseConfigured } from "@/lib/db";
import { franchiseForUser } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OwnerClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  const franchise = user && isDatabaseConfigured() ? await franchiseForUser(user.userId) : null;
  if (forbiddenForClub({ role: user?.role, ownFranchiseId: franchise?.id ?? null, requestedFranchiseId: id })) {
    forbidden();
  }
  redirect("/owner");
}
