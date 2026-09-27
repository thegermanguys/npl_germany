import type { Metadata } from "next";
import { GALLERY_PHOTOS } from "@/data/photos";
import { CricketMarks } from "@/components/CricketIcon";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const user = await getSession();

  return (
    <>
      <Nav user={user} active="gallery" />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">MATCH DAYS</div>
          <h1>Gallery</h1>
          <CricketMarks />
        </div>
      </section>
      <section className="gallery-section">
        <div className="wrap">
          <GalleryGrid photos={GALLERY_PHOTOS} />
        </div>
      </section>
    </>
  );
}
