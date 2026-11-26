"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { Button, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";

const MAX_BYTES = 2 * 1024 * 1024;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
}

function optimize(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      if (scale === 1 && dataUrl.length < 500_000) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
  square?: boolean;
};

export default function ImageUpload({ value, onChange, label, hint, square = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran gambar maksimal 2 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dataUrl = await readFile(file);
      onChange(await optimize(dataUrl));
    } catch {
      setError("Gagal memproses gambar. Coba file lain.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-[var(--muted)]">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 ${square ? "h-16 w-16" : "h-16 w-24"}`}>
          {value ? (
            <SafeImage src={value} alt={`Pratinjau ${label}`} className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <Icon name="image" size={22} />
            </span>
          )}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void handleChange(event)}
          aria-describedby={`${hint ? `${hintId} ` : ""}${error ? errorId : ""}`.trim() || undefined}
        />
        <Button type="button" variant="outline" size="sm" icon="image" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Memproses..." : value ? "Ganti foto" : "Pilih foto"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Hapus
          </Button>
        )}
      </div>
      {hint && <span id={hintId} className="mt-1 block text-[11px] text-[var(--muted)]">{hint}</span>}
      {error && <p id={errorId} role="alert" className="mt-2 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
