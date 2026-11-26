"use client";

import Link from "next/link";
import { Badge, Breadcrumbs, Button, EmptyState, Rating, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import ProductGrid from "@/components/products/ProductGrid";
import { initials } from "@/lib/format";
import { products } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { MySeller, Seller } from "@/lib/types";

function toSeller(local: MySeller, image?: string): Seller {
  return {
    id: local.id,
    name: local.name,
    slug: local.slug,
    description: local.description || `Toko ${local.name} yang berjualan di ${local.city}.`,
    city: local.city,
    address: local.city,
    phone: local.phone,
    rating: 0,
    reviewCount: 0,
    verified: false,
    isOfficial: false,
    joinedYear: new Date().getFullYear(),
    banner: image ?? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    photo: local.photo,
  };
}

export default function SellerStorefront({ slug, staticSeller }: { slug: string; staticSeller: Seller | null }) {
  const { ready, seller: localSeller, sellerProducts } = useStore();

  if (!staticSeller && !ready) {
    return <main className="mx-auto max-w-7xl px-6 py-20 text-center text-sm text-zinc-400">Memuat toko...</main>;
  }

  const matchedLocal = localSeller?.slug === slug ? localSeller : null;
  const seller = staticSeller ?? (matchedLocal ? toSeller(matchedLocal, sellerProducts.find((product) => product.sellerId === matchedLocal.id)?.image) : null);

  if (!seller) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <EmptyState
          icon="store"
          title="Toko tidak ditemukan"
          description="Toko yang kamu cari tidak tersedia. Jelajahi daftar penjual untuk menemukan toko lain."
          action={<Button href="/sellers" icon="arrow-right">Lihat semua penjual</Button>}
        />
      </main>
    );
  }

  const storeProducts = staticSeller
    ? products.filter((product) => product.sellerId === staticSeller.id)
    : sellerProducts.filter((product) => product.sellerId === seller.id);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Penjual", href: "/sellers" },
          { label: seller.name },
        ]}
      />

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)]">
        <div className="relative h-64 md:h-80">
          <SafeImage src={seller.banner} alt={`Banner ${seller.name}`} sizes="100vw" priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
        <div className="relative -mt-16 px-6 pb-8 md:px-10">
          {seller.photo ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-[var(--surface)] bg-[var(--surface)]">
              <SafeImage src={seller.photo} alt={`Foto ${seller.name}`} className="object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[var(--surface)] bg-[var(--accent)] text-2xl font-bold text-[#0a0a0a]">
              {initials(seller.name)}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {seller.verified && (
              <Badge tone="success">
                <Icon name="check" size={12} /> Terverifikasi
              </Badge>
            )}
            {seller.isOfficial && <Badge tone="accent">Toko Resmi</Badge>}
            <Badge tone="neutral">Bergabung sejak {seller.joinedYear}</Badge>
            {matchedLocal && <Badge tone="accent">Toko Kamu</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{seller.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{seller.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-400">
            <Rating value={seller.rating} count={seller.reviewCount} size={15} />
            <span className="inline-flex items-center gap-2"><Icon name="location" size={15} /> {seller.address}</span>
            <span className="inline-flex items-center gap-2"><Icon name="chat" size={15} /> {seller.phone}</span>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Etalase"
          title="Produk dari toko ini"
          description={`Tersedia ${storeProducts.length} produk dari ${seller.name}.`}
        />
        <div className="mt-6">
          <Link
            href={`/products?seller=${encodeURIComponent(seller.id)}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Lihat semua produk toko ini
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={storeProducts} />
        </div>
      </section>
    </main>
  );
}
