import { useEffect } from "react";

/** Sets document.title for the current page, restoring the default on unmount. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Thayyalkkari` : "Thayyalkkari | തയ്യൽക്കാരി";
  }, [title]);
}
