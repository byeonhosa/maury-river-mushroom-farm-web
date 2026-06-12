// Image slot manifest. Map a logical slot key to a real, optimized photo when
// one exists. Slots with no entry render a branded placeholder via
// <BrandedImage>, so dropping in a real photo later is a one-line change here
// with no component edits. See docs/content/photo-shot-list.md for the shoot
// checklist that fills the empty slots.

export interface ImageEntry {
  src: string;
  alt: string;
}

// Per-species hero image (rendered on /mushrooms/[slug]). Keyed by species slug.
// Entries below point at photos already optimized under public/images. Every
// other species falls back to a branded placeholder until a photo is shot.
export const speciesImageManifest: Record<string, ImageEntry> = {
  "lion-s-mane": {
    src: "/images/products/lions-mane-mushrooms-studio-01.webp",
    alt: "Fresh lion's mane mushroom cluster",
  },
  "pink-oyster": {
    src: "/images/products/pink-oyster-mushrooms-01.webp",
    alt: "Close view of pink oyster mushroom gills",
  },
  "white-oyster": {
    src: "/images/products/white-oyster-mushrooms-01.webp",
    alt: "White oyster mushroom cluster",
  },
  "turkey-tail": {
    src: "/images/farm/turkey-tail-mushrooms-01.webp",
    alt: "Turkey tail mushrooms growing in fan-shaped layers",
  },
};

export function getSpeciesImage(slug: string): ImageEntry | undefined {
  return speciesImageManifest[slug];
}
