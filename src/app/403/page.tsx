import type { Metadata } from "next";
import { ForbiddenView } from "@/components/ForbiddenView";

export const metadata: Metadata = { title: "Access denied" };
export const dynamic = "force-dynamic";

export default async function ForbiddenPage() {
  return <ForbiddenView />;
}
