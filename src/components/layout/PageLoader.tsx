import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

/** Lightweight fallback shown while a lazy-loaded route chunk is fetched. */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.span
        animate={{ rotate: [0, 25, 0, -25, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-100 text-maroon-600"
      >
        <Scissors className="h-5 w-5" />
      </motion.span>
    </div>
  );
}
