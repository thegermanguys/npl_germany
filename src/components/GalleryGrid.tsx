"use client";

import { useState } from "react";
import type { GalleryPhoto } from "@/data/photos";

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : photos[open];

  if (photos.length === 0) {
    return <div className="empty-note">No photos yet.</div>;
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className="g-item"
            onClick={() => setOpen(index)}
          >
            <img src={photo.src} alt={photo.title} loading="lazy" />
            <div className="g-cap">
              <p className="g-title">{photo.title}</p>
              <p className="g-sub">{photo.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
      {current ? (
        <div className="lightbox open" onClick={() => setOpen(null)}>
          <button className="lightbox-close" type="button" aria-label="Close" onClick={() => setOpen(null)}>
            ×
          </button>
          <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
            <img src={current.src} alt={current.title} />
            <p className="lightbox-cap">
              {[current.title, current.subtitle].filter(Boolean).join(" — ")}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
