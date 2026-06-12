import Image from "next/image";

import type { ImageEntry } from "../lib/image-manifest";

interface BrandedImageProps {
  image?: ImageEntry;
  /** Shown inside the placeholder when no photo exists yet (e.g. species name). */
  label: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

// Renders a real photo when the manifest provides one, otherwise a branded,
// on-brand placeholder (mahogany field, ivory pattern + label) so imageless
// catalog entries still look intentional. Always fills its positioned parent.
export function BrandedImage({ image, label, sizes, priority, className }: BrandedImageProps) {
  if (image) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className ?? "object-cover"}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${label} — farm photo coming soon`}
      className="absolute inset-0 flex flex-col items-center justify-center bg-brand-mahogany p-6 text-center"
    >
      <Image
        src="/brand/MRMF_Pattern_Ivory_png.png"
        alt=""
        fill
        aria-hidden="true"
        className="object-cover opacity-10"
        sizes={sizes}
      />
      <span className="relative font-heading text-3xl leading-tight text-brand-ivory">
        {label}
      </span>
      <span className="relative mt-2 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-ivory/80">
        Farm photo coming soon
      </span>
    </div>
  );
}
