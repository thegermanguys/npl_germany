import { forbidden } from "next/navigation";
import { forbiddenForPath } from "@/lib/access";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (forbiddenForPath("/owner", user?.role)) forbidden();
  return children;
}
