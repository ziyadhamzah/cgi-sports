"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge, Breadcrumbs, Button, EmptyState, Rating, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { getRelatedProducts } from "@/lib/catalog";
import { formatDiscountLabel, formatRupiah } from "@/lib/format";
import { getCategoryName, getSellerBySlug } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import ProductActions from "./ProductActions";
import ProductGrid from "./ProductGrid";
import ProductReviews from "./ProductReviews";
import ProductViewTracker from "./ProductViewTracker";
import RecentlyViewed from "./RecentlyViewed";
import SellerCard from "./SellerCard";

export default function LocalProductDetail({ slug }: { slug: string }) {
  const { allProducts, ready } = useStore();
  const product = useMemo(() => allProducts.find((item) => item.slug === slug), [allProducts, slug]);

  if (!ready) {
    return <div className="surface-card rounded-3xl px-6 py-16 text-center text-sm text-[var(--muted)]">Memuat produk dari toko lokal...</div>;
  }

  if (!product) {
    return (
      <EmptyState
        icon="box"
        title="Produk tidak ditemukan"
        description="Produk penjual lokal dengan tautan ini tidak tersedia di browser ini."
        action={<Button href="/products" icon="arrow-left">Kembali ke katalog</Button>}
      />
    );
  }

  const seller = getSellerBySlug(product.sellerSlug);
  const related = getRelatedProducts(product, allProducts, 4);
  const gallery = Array.from(new Set(product.gallery));

  return (
    <>
      <ProductViewTracker product={product} />
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Produk", href: "/products" },
          { label: product.name },
        ]}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
            <SafeImage src={product.image} alt={product.name} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                  <SafeImage src={image} alt={`${product.name} tampilan ${index + 1}`} sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">{getCategoryName(product.categorySlug)}</Badge>
            {product.isPromo && <Badge tone="accent">{formatDiscountLabel(product.price, product.originalPrice) || "Promo"}</Badge>}
            {product.isNew && <Badge tone="success">Produk baru</Badge>}
            {product.isBestseller && <Badge tone="warning">Terlaris</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{product.name}</h1>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{product.description}</p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-semibold text-[var(--accent)]">{formatRupiah(product.price)}</span>
            {product.originalPrice && (
              <span className="pb-1 text-sm text-[var(--muted)] line-through">{formatRupiah(product.originalPrice)}</span>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-2"><Icon name="box" size={15} /> Stok {product.stock} unit</span>
            <span className="inline-flex items-center gap-2"><Icon name="check" size={15} /> Terjual {product.sold}</span>
            <span className="inline-flex items-center gap-2"><Icon name="location" size={15} /> {product.city}</span>
            <span className="inline-flex items-center gap-2"><Icon name="package" size={15} /> {product.weight ? `${product.weight} gram` : "Berat tidak tersedia"}</span>
          </div>
          <div className="mt-7">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">Detail produk</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="truck" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Pengiriman cepat</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Dikirim dari {product.city}</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="shield" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Transaksi aman</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Pembayaran simulasi di mode demo</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="refresh" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Pantau harga</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Simpan produk untuk memantau perubahan</p>
            </div>
          </div>
        </section>
        <aside>
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Informasi penjual</h2>
          {seller ? (
            <SellerCard seller={seller} />
          ) : (
            <div className="surface-card rounded-3xl p-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">{product.sellerName}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--muted)]">
                <Icon name="location" size={14} /> {product.city}
              </p>
              <Link href={`/sellers/${product.sellerSlug}`} className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--accent)] hover:underline">
                Lihat toko penjual <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          )}
        </aside>
      </div>

      <ProductReviews product={product} />

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Produk serupa</h2>
        <div className="mt-6">
          <ProductGrid products={related} />
        </div>
      </section>

      <RecentlyViewed />
    </>
  );
}
