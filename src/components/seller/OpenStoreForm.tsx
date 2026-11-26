"use client";

import { useState, type FormEvent } from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { Button, Field, SectionHeading, inputClass } from "@/components/ui";
import { categories, cities } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";

export default function OpenStoreForm() {
  const { openSeller } = useStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0].name);
  const [city, setCity] = useState(cities[0]);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("Nama toko minimal 3 karakter.");
      return;
    }
    if (phone.trim().length < 8) {
      setError("Nomor telepon minimal 8 karakter.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Deskripsi toko minimal 10 karakter.");
      return;
    }
    setError("");
    openSeller({
      name: name.trim(),
      category,
      city,
      phone: phone.trim(),
      description: description.trim(),
      photo: photo || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading
        eyebrow="Dashboard Penjual"
        title="Buka toko kamu"
        description="Isi profil toko untuk mulai menambahkan produk. Data toko tersimpan di browser kamu."
      />
      <form onSubmit={handleSubmit} className="surface-card mt-8 grid gap-5 rounded-3xl p-6 md:grid-cols-2 md:p-8">
        <Field label="Nama toko">
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama toko kamu" required />
        </Field>
        <Field label="Kategori utama">
          <select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Kota">
          <select className={inputClass} value={city} onChange={(event) => setCity(event.target.value)}>
            {cities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Nomor telepon">
          <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" required />
        </Field>
        <div className="md:col-span-2">
          <ImageUpload
            label="Foto profil toko"
            value={photo}
            onChange={setPhoto}
            hint="Tampil di kartu toko dan halaman toko. Gunakan gambar kotak. Maksimal 2 MB."
            square
          />
        </div>
        <div className="md:col-span-2">
          <Field label="Deskripsi toko">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ceritakan produk dan keunggulan toko kamu..."
              required
            />
          </Field>
        </div>
        {error && <p className="text-xs text-rose-300 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" icon="store" full>Buka toko sekarang</Button>
        </div>
      </form>
    </div>
  );
}
