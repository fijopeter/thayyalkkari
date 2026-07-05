import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { deleteImage, uploadImage } from "@/lib/imageUpload";
import { handleImageError } from "@/lib/image";
import { useR2Capacity } from "@/hooks/useR2Capacity";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const { atLimit: r2AtLimit } = useR2Capacity();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (r2AtLimit) {
      setError(t("admin.r2LimitReached"));
      return;
    }
    const previous = value;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
      // Replacing an existing upload — the old file is now unreferenced, so
      // reclaim its storage instead of leaving it orphaned in the bucket.
      if (previous) void deleteImage(previous);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    if (value) void deleteImage(value);
    onChange("");
  }

  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex items-start gap-3">
        {value && (
          <img
            src={value}
            alt=""
            onError={handleImageError}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 space-y-1.5">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            required={required}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || r2AtLimit}
              className="flex items-center gap-1.5 text-xs font-medium text-maroon-700 hover:underline disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {uploading ? t("admin.uploading") : t("admin.uploadPhoto")}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs font-medium text-ink-700/50 hover:text-red-600 hover:underline disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("admin.removeImage")}
              </button>
            )}
          </div>
          {r2AtLimit && !error && (
            <p className="text-xs text-red-600">{t("admin.r2LimitReached")}</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
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
