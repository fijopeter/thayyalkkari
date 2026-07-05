import { motion } from "framer-motion";
import type { ShowcaseImage } from "@/types";
import { handleImageError } from "@/lib/image";
import { Container } from "@/components/ui/Container";

const CARD_CLASS =
  "h-40 w-56 shrink-0 overflow-hidden rounded-2xl shadow-soft sm:h-48 sm:w-64";

/** An auto-scrolling strip of shop photos — images only, no captions. A single photo just stays put; two or more loop seamlessly. */
export function ShowcaseMarquee({ images }: { images: ShowcaseImage[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Container className="flex justify-center">
        <div className={CARD_CLASS}>
          <img
            src={images[0].image}
            alt=""
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        </div>
      </Container>
    );
  }

  // Duplicate the list so the track can loop from -50% back to 0% seamlessly.
  // The gap between cards is applied as a margin on each card (not a flex
  // `gap` on the container) so it's included uniformly on every item — that
  // makes the two halves of the doubled track exactly equal in width, so the
  // -50%-to-0% loop lands precisely on the boundary with no jump. (A
  // container `gap` doesn't add a trailing gap after the last item, which
  // throws the 50% split off by half a gap and causes a visible stutter.)
  const track = [...images, ...images];
  const duration = Math.max(images.length * 5, 16);

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {track.map((img, i) => (
          <div key={`${img.id}-${i}`} className={`${CARD_CLASS} mr-4`}>
            <img
              src={img.image}
              alt=""
              loading="lazy"
              onError={handleImageError}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
