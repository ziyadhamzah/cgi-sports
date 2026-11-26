"use client";

import { useState, type FormEvent } from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { Button, Field, inputClass } from "@/components/ui";
import { createId, slugify } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

type SellerProductFormProps = {
  product?: Product | null;
  onDone: () => void;
};

export default function SellerProductForm({ product, onDone }: SellerProductFormProps) {
  const { seller, allProducts, saveSellerProduct, toast } = useStore();
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? categories[0].slug);
  const [image, setImage] = useState(product?.image ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [error, setError] = useState("");

  if (!seller) return null;
  const currentSeller = seller;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = categories.find((item) => item.slug === categorySlug) ?? categories[0];
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    if (name.trim().length < 3) {
      setError("Nama produk minimal 3 karakter.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Harga harus lebih besar dari nol.");
      return;
    }
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stok harus berupa bilangan bulat minimal nol.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Deskripsi produk minimal 10 karakter.");
      return;
    }
    setError("");

    const finalImage = image.trim() || "/images/products/produk-baru.jpg";
    const id = product?.id ?? createId("sp");
    const baseSlug = slugify(name.trim());
    const slug = allProducts.some((item) => item.slug === baseSlug && item.id !== id)
      ? `${baseSlug}-${id.slice(-4)}`
      : baseSlug;
    const productData: Product = {
      id,
      slug,
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      stock: numericStock,
      sold: 0,
      rating: 0,
      reviewCount: 0,
      image: finalImage,
      gallery: [finalImage],
      categoryId: category.id,
      categorySlug: category.slug,
      sellerId: currentSeller.id,
      sellerName: currentSeller.name,
      sellerSlug: currentSeller.slug,
      city: currentSeller.city,
      createdAt: product?.createdAt ?? new Date().toISOString(),
      tag: category.name,
      tags: [category.name.toLowerCase(), category.slug],
      isNew: !product,
    };

    saveSellerProduct(productData);
    toast(product ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nama produk">
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Matras Yoga Anti Slip" required />
        </Field>
      </div>
      <Field label="Harga (Rp)">
        <input className={inputClass} type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="150000" required />
      </Field>
      <Field label="Stok">
        <input className={inputClass} type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} placeholder="10" required />
      </Field>
      <Field label="Kategori">
        <select className={inputClass} value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <ImageUpload
          label="Foto produk"
          value={image}
          onChange={setImage}
          hint="Upload dari perangkat, atau isi URL gambar di bawah. Maksimal 2 MB."
        />
      </div>
      <Field label="Atau URL gambar" hint="Biarkan kosong untuk memakai gambar bawaan.">
        <input className={inputClass} type="url" value={image.startsWith("data:") ? "" : image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Deskripsi produk">
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Jelaskan spesifikasi dan keunggulan produk..."
            required
          />
        </Field>
      </div>
      {error && <p className="text-xs text-rose-300 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" icon="check" full>Simpan produk</Button>
        <Button variant="outline" onClick={onDone}>Batal</Button>
      </div>
    </form>
  );
}
