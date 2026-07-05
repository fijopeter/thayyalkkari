import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { Shop } from "@/types";
import { addShowcaseImage, deleteShowcaseImage } from "@/store/shopsStore";
import { uploadImage } from "@/lib/imageUpload";
import { handleImageError } from "@/lib/image";
import { useDbCapacity } from "@/hooks/useDbCapacity";
import { useR2Capacity } from "@/hooks/useR2Capacity";
import { Button } from "@/components/ui/Button";

export function ShowcaseEditor({ shop }: { shop: Shop }) {
  const { t } = useTranslation();
  const { atLimit: dbAtLimit } = useDbCapacity();
  const { atLimit: r2AtLimit } = useR2Capacity();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (dbAtLimit) {
      setError(t("admin.dbLimitReached"));
      return;
    }
    if (r2AtLimit) {
      setError(t("admin.r2LimitReached"));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      const result = await addShowcaseImage(shop.id, url);
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string, imageUrl: string) {
    const result = await deleteShowcaseImage(imageId, imageUrl);
    if (result.error) setError(result.error);
  }

  const disabled = uploading || dbAtLimit || r2AtLimit;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-700/60">{t("admin.showcaseHint")}</p>

      {shop.showcaseImages.length === 0 && (
        <p className="text-sm text-ink-700/50">{t("admin.noShowcaseImages")}</p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {shop.showcaseImages.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl">
            <img
              src={img.image}
              alt=""
              onError={handleImageError}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(img.id, img.image)}
              aria-label={t("admin.removeImage")}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {uploading ? t("admin.uploading") : t("admin.addShowcaseImage")}
      </Button>

      {dbAtLimit && <p className="text-sm text-red-600">{t("admin.dbLimitReached")}</p>}
      {!dbAtLimit && r2AtLimit && <p className="text-sm text-red-600">{t("admin.r2LimitReached")}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
