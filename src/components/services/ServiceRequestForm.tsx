"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { Service, ServiceRequest } from "@/lib/types";

export default function ServiceRequestForm({ service }: { service: Service }) {
  const { createServiceRequest, toast } = useStore();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [request, setRequest] = useState<ServiceRequest | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (notes.trim().length < 5) {
      setError("Tulis catatan singkat minimal 5 karakter.");
      return;
    }
    setError("");
    const created = createServiceRequest(service, notes.trim());
    setRequest(created);
    toast(`Pengajuan ${created.number} berhasil dibuat.`);
  }

  async function copyNumber() {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(request.number);
      toast("Nomor pengajuan berhasil disalin.");
    } catch {
      toast("Nomor pengajuan gagal disalin.", "error");
    }
  }

  return (
    <section className="surface-card h-fit rounded-3xl p-6 md:p-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
        <Icon name="ticket" size={21} />
      </div>
      <div className="mt-6">
        <Badge tone="warning">Mode demo</Badge>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">Ajukan layanan</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Isi detail kebutuhanmu untuk {service.name}. Pengajuan hanya disimpan di browser kamu; tidak ada tim yang akan menghubungi secara otomatis.
      </p>

      {request ? (
        <div className="mt-7 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] p-5">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Icon name="check" size={17} />
            <span className="text-sm font-semibold">Pengajuan berhasil dibuat</span>
          </div>
          <p className="mt-4 text-[11px] text-zinc-500">Nomor pengajuan</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-semibold text-white">{request.number}</span>
            <Button size="sm" variant="outline" icon="copy" onClick={copyNumber}>Salin</Button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Diajukan pada {formatDate(request.createdAt)}</p>
          <Link href="/account" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            Lihat riwayat di akun <Icon name="arrow-right" size={13} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="surface-soft flex items-center justify-between rounded-2xl px-4 py-3">
            <span className="text-xs text-zinc-400">{service.name}</span>
            <span className="text-sm font-semibold text-white">{service.duration}</span>
          </div>
          <Field label="Catatan untuk tim" hint="Contoh: ukuran sepatu, tension senar, atau jadwal yang kamu inginkan.">
            <textarea
              className={`${inputClass} min-h-36 resize-y`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ceritakan kebutuhanmu secara singkat..."
              required
            />
          </Field>
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <Button type="submit" icon="arrow-right" full>Kirim pengajuan</Button>
        </form>
      )}
    </section>
  );
}
