"use client";

import Link from "next/link";
import { useState } from "react";
import OpenStoreForm from "@/components/seller/OpenStoreForm";
import SellerProductForm from "@/components/seller/SellerProductForm";
import ImageUpload from "@/components/ui/ImageUpload";
import { Badge, Breadcrumbs, Button, Modal, SafeImage, SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

export default function SellerDashboardPage() {
  const { ready, seller, sellerProducts, allOrders, removeSellerProduct, closeSeller, updateSellerPhoto, toast } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [closing, setClosing] = useState(false);

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400 md:px-8">Memuat dashboard penjual...</div>;
  }

  if (!seller) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Dashboard Penjual" }]} />
        <div className="mt-10"><OpenStoreForm /></div>
      </main>
    );
  }

  const ownIds = new Set(sellerProducts.map((product) => product.id));
  const relevantOrders = allOrders.filter((order) => order.items.some((item) => ownIds.has(item.productId)));
  const revenue = relevantOrders.reduce((total, order) => total + order.items.reduce((sum, item) => (
    ownIds.has(item.productId) ? sum + item.price * item.quantity : sum
  ), 0), 0);

  const stats: { label: string; value: string; icon: IconName; note: string }[] = [
    { label: "Produk aktif", value: String(sellerProducts.length), icon: "box", note: "Produk yang kamu jual" },
    { label: "Pesanan masuk", value: String(relevantOrders.length), icon: "package", note: "Pesanan berisi produk tokomu" },
    { label: "Omzet", value: formatRupiah(revenue), icon: "chart", note: "Total dari pesanan terkait" },
  ];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Dashboard Penjual" }]} />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Dashboard Penjual"
          title={seller.name}
          description={`${seller.category} · ${seller.city} · ${seller.phone}`}
        />
        <div className="flex flex-wrap gap-2">
          <Button icon="plus" onClick={openCreate}>Tambah produk</Button>
          <Button variant="outline" icon="eye" href={`/products?seller=${seller.id}`}>Lihat di katalog</Button>
          <Button variant="ghost" icon="trash" onClick={() => setClosing(true)}>Tutup toko</Button>
        </div>
      </div>

      <section className="surface-card mt-10 max-w-xl rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon name="store" size={19} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Foto profil toko</h2>
            <p className="mt-1 text-xs text-zinc-400">Foto ini tampil di kartu toko dan halaman toko.</p>
          </div>
        </div>
        <div className="mt-5">
          <ImageUpload
            label="Foto profil toko"
            value={seller.photo ?? ""}
            onChange={updateSellerPhoto}
            hint="Gunakan gambar kotak agar tampil rapi. Maksimal 2 MB."
            square
          />
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="surface-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-[11px] text-zinc-500">{stat.note}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Icon name={stat.icon} size={19} />
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Produk toko</h2>
            <p className="mt-1 text-xs text-zinc-500">Kelola harga, stok, dan deskripsi produk kamu.</p>
          </div>
          <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            Lihat pesanan <Icon name="arrow-right" size={13} />
          </Link>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="surface-soft rounded-3xl px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">Toko kamu belum memiliki produk.</p>
            <Button size="sm" className="mt-4" icon="plus" onClick={openCreate}>Tambah produk pertama</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sellerProducts.map((product) => (
              <article key={product.id} className="surface-card overflow-hidden rounded-2xl">
                <div className="relative h-40 bg-zinc-900/60">
                  <SafeImage src={product.image} alt={product.name} className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">{product.name}</h3>
                    <Badge tone={product.stock > 0 ? "success" : "danger"}>{product.stock > 0 ? `${product.stock} stok` : "Habis"}</Badge>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[var(--accent)]">{formatRupiah(product.price)}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">Terjual {product.sold} unit · Rating {product.rating.toFixed(1)}</p>
                  <div className="mt-5 flex gap-2">
                    <Button size="sm" variant="outline" icon="edit" onClick={() => openEdit(product)}>Edit</Button>
                    <Button size="sm" variant="ghost" icon="trash" onClick={() => setDeleting(product)}>Hapus</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit produk" : "Tambah produk baru"}>
        <SellerProductForm key={editing?.id ?? "new"} product={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Hapus produk">
        <p className="text-sm leading-6 text-zinc-400">
          Produk {deleting?.name} akan dihapus dari toko kamu. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            icon="trash"
            onClick={() => {
              if (!deleting) return;
              removeSellerProduct(deleting.id);
              toast("Produk berhasil dihapus.", "info");
              setDeleting(null);
            }}
          >
            Hapus produk
          </Button>
          <Button variant="outline" onClick={() => setDeleting(null)}>Batal</Button>
        </div>
      </Modal>

      <Modal open={closing} onClose={() => setClosing(false)} title="Tutup toko">
        <p className="text-sm leading-6 text-zinc-400">
          Menutup toko akan menghapus profil toko dan seluruh produk yang kamu tambahkan. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-6 flex gap-2">
          <Button
            icon="trash"
            onClick={() => {
              closeSeller();
              toast("Toko kamu berhasil ditutup.", "info");
              setClosing(false);
            }}
          >
            Tetap tutup toko
          </Button>
          <Button variant="outline" onClick={() => setClosing(false)}>Batal</Button>
        </div>
      </Modal>
    </main>
  );
}
