"use client";

import { useRef, type ChangeEvent } from "react";

type ImageGalleryFieldProps = {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

export default function ImageGalleryField({
  images,
  onChange,
  maxImages = 8,
}: ImageGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxImages - images.length;
    const selected = files.slice(0, remaining);

    const dataUrls = await Promise.all(selected.map(readFileAsDataUrl));
    onChange([...images, ...dataUrls]);

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--navy)]">Galerie photos</p>
          <p className="text-xs text-[var(--muted)]">
            Importez depuis votre galerie ({images.length}/{maxImages})
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="rounded-full bg-[var(--navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-40 hover:bg-[var(--navy-mid)] transition-colors"
        >
          Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--navy)]/20 bg-white px-4 py-12 text-center hover:border-[var(--gold)] transition-colors"
        >
          <span className="text-2xl text-[var(--gold)]">＋</span>
          <span className="text-sm font-medium text-[var(--navy)]">Choisir des images</span>
          <span className="text-xs text-[var(--muted)]">JPG, PNG — première image = couverture</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, index) => (
            <div key={`${index}-${src.slice(0, 24)}`} className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--navy)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--gold)]">
                  Couverture
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Supprimer l'image"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[var(--navy)]/20 text-2xl text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              ＋
            </button>
          )}
        </div>
      )}
    </div>
  );
}
