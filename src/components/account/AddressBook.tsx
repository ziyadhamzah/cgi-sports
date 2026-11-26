"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Field, Modal, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { cities } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { SavedAddress } from "@/lib/types";
import { isValidPhone, isValidPostalCode } from "@/lib/validation";

type AddressForm = {
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  primary: boolean;
};

const emptyForm: AddressForm = {
  label: "Rumah",
  name: "",
  phone: "",
  address: "",
  city: cities[0],
  postalCode: "",
  primary: false,
};

export default function AddressBook() {
  const { ready, addresses, addAddress, updateAddress, removeAddress, setPrimaryAddress, toast } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<SavedAddress | null>(null);

  function update<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, primary: addresses.length === 0 });
    setError("");
    setFormOpen(true);
  }

  function openEdit(address: SavedAddress) {
    setEditing(address);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      primary: address.primary,
    });
    setError("");
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: AddressForm = {
      label: form.label.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city,
      postalCode: form.postalCode.trim(),
      primary: form.primary,
    };
    if (!payload.label || payload.name.length < 2 || !isValidPhone(payload.phone) || !payload.address || !payload.city) {
      setError("Lengkapi semua kolom alamat dengan benar.");
      return;
    }
    if (!isValidPostalCode(payload.postalCode)) {
      setError("Kode pos harus terdiri dari 5 angka.");
      return;
    }
    if (editing) {
      updateAddress(editing.id, payload);
      if (payload.primary) setPrimaryAddress(editing.id);
      toast("Alamat berhasil diperbarui.");
    } else {
      addAddress(payload);
      toast("Alamat baru berhasil disimpan.");
    }
    setFormOpen(false);
  }

  return (
    <section id="alamat" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Buku alamat</h2>
          <p className="mt-1 text-xs text-zinc-500">Alamat tersimpan bisa dipakai saat checkout.</p>
        </div>
        <Button size="sm" icon="plus" onClick={openCreate}>Tambah alamat</Button>
      </div>

      {!ready ? (
        <p className="text-sm text-zinc-500">Memuat alamat...</p>
      ) : addresses.length === 0 ? (
        <div className="surface-soft rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">Belum ada alamat tersimpan.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={openCreate}>Tambah alamat pertama</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="surface-soft rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{address.label}</h3>
                  {address.primary && <Badge tone="accent">Utama</Badge>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    aria-label={`Edit alamat ${address.label}`}
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(address)}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                    aria-label={`Hapus alamat ${address.label}`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-200">{address.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{address.phone}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {address.address}, {address.city} {address.postalCode}
              </p>
              {!address.primary && (
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryAddress(address.id);
                    toast(`${address.label} ditetapkan sebagai alamat utama.`);
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] transition hover:brightness-110"
                >
                  <Icon name="check" size={13} /> Jadikan utama
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit alamat" : "Tambah alamat baru"}>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Label alamat">
            <input className={inputClass} value={form.label} onChange={(event) => update("label", event.target.value)} placeholder="Rumah, Kantor" required />
          </Field>
          <Field label="Nama penerima">
            <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nama lengkap" required />
          </Field>
          <Field label="Nomor telepon">
            <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="08xxxxxxxxxx" required />
          </Field>
          <Field label="Kota">
            <select className={inputClass} value={form.city} onChange={(event) => update("city", event.target.value)} required>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Alamat lengkap">
              <textarea className={`${inputClass} min-h-24 resize-y`} value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW" required />
            </Field>
          </div>
          <Field label="Kode pos">
            <input className={inputClass} value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="12345" inputMode="numeric" required />
          </Field>
          <label className="flex items-end gap-2 pb-3 text-xs text-zinc-300">
            <input type="checkbox" checked={form.primary} onChange={(event) => update("primary", event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Jadikan alamat utama
          </label>
          {error && <p className="text-xs text-rose-300 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" icon="check" full>Simpan alamat</Button>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      <Modal open={pendingDelete !== null} onClose={() => setPendingDelete(null)} title="Hapus alamat">
        <p className="text-sm leading-6 text-zinc-400">
          Alamat {pendingDelete?.label} akan dihapus dari buku alamat kamu. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            icon="trash"
            onClick={() => {
              if (!pendingDelete) return;
              removeAddress(pendingDelete.id);
              toast("Alamat berhasil dihapus.", "info");
              setPendingDelete(null);
            }}
          >
            Hapus alamat
          </Button>
          <Button variant="outline" onClick={() => setPendingDelete(null)}>Batal</Button>
        </div>
      </Modal>
    </section>
  );
}
