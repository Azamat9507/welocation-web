"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n";
import { deleteSpot, removePhoto } from "./actions";

type Labels = {
  photos: string;
  addPhoto: string;
  removePhoto: string;
  uploading: string;
  badPhoto: string;
  tooManyPhotos: string;
  deleteSpot: string;
  deleteConfirm: string;
  failed: string;
};

const MAX_SIDE = 1600;

// Shrinks a photo in the browser before it is sent: a phone photo is often 5-10 MB and HEIC, which the
// API doesn't read. Drawing it on a canvas also leaves its EXIF (with the GPS position) behind.
async function shrink(file: File): Promise<Blob | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
}

export function Photos({ spotId, images, lang, labels }: { spotId: number; images: string[]; lang: Locale; labels: Labels }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [error, setError] = useState<string>();
  // deleting takes two clicks, so a stray tap can't remove a place
  const [armed, setArmed] = useState(false);

  const upload = (files: FileList | null) =>
    start(async () => {
      setError(undefined);
      for (const file of Array.from(files ?? [])) {
        const blob = await shrink(file);
        if (!blob) {
          setError(labels.badPhoto);
          return;
        }
        const form = new FormData();
        form.set("file", blob, "photo.jpg");
        const res = await fetch(`/api/admin/photos/${spotId}`, { method: "POST", body: form }).catch(() => null);
        if (!res?.ok) {
          const code = res ? ((await res.json().catch(() => ({}))) as { error?: string }).error : undefined;
          setError(code === "tooMany" ? labels.tooManyPhotos : code === "photo" || code === "size" ? labels.badPhoto : labels.failed);
          break;
        }
      }
      router.refresh();
    });

  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold">{labels.photos}</h3>
      {images.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url) => (
            <li key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- our own upload, already sized */}
              <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  start(async () => {
                    const r = await removePhoto(spotId, url, lang);
                    setError(r.error);
                  })
                }
                className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white disabled:opacity-50"
              >
                {labels.removePhoto}
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="mt-2 inline-block cursor-pointer rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent">
        {busy ? labels.uploading : labels.addPhoto}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (!armed) return setArmed(true);
          start(async () => {
            const r = await deleteSpot(spotId, lang);
            setArmed(false);
            setError(r?.error);
          });
        }}
        onBlur={() => setArmed(false)}
        className={`mt-8 block rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 ${
          armed ? "border-red-700 text-red-700" : "border-line text-muted hover:text-red-700"
        }`}
      >
        {armed ? labels.deleteConfirm : labels.deleteSpot}
      </button>
    </section>
  );
}
