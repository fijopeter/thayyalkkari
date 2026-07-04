import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/imageUpload";
import { handleImageError } from "@/lib/image";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.uploadFailed"));
    } finally {
      setUploading(false);
    }
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs font-medium text-maroon-700 hover:underline disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {uploading ? t("admin.uploading") : t("admin.uploadPhoto")}
          </button>
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
