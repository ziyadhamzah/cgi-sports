"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Breadcrumbs, Button, EmptyState, Rating, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

function categoryName(product: Product) {
  return categories.find((category) => category.id === product.categoryId)?.name
    ?? categories.find((category) => category.slug === product.categorySlug)?.name
    ?? "-";
}

export default function BandingkanPage() {
  const { ready, compare, resolveProduct, removeCompare, clearCompare, addToCart, toast } = useStore();

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400 md:px-8">Memuat perbandingan...</div>;
  }

  const rows = compare.map((entry) => ({ entry, product: resolveProduct(entry.id) }));
  const available = rows.flatMap((row) => (row.product ? [row.product] : []));
  const bestPrice = available.length > 0 ? Math.min(...available.map((product) => product.price)) : null;
  const bestRating = available.length > 0 ? Math.max(...available.map((product) => product.rating)) : null;

  const cell = (children: ReactNode, highlight = false) => (
    <td className={`min-w-[190px] px-4 py-4 text-sm align-middle ${highlight ? "bg-[var(--accent)]/10 font-semibold text-[var(--accent)]" : "text-zinc-300"}`}>
      {children}
    </td>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Bandingkan" }]} />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Perbandingan"
          title="Bandingkan produk"
          description="Lihat perbedaan harga, rating, stok, dan penjual hingga empat produk sekaligus."
        />
        {compare.length > 0 && (
          <Button
            variant="outline"
            icon="trash"
            onClick={() => {
              clearCompare();
              toast("Perbandingan dikosongkan.", "info");
            }}
          >
            Kosongkan perbandingan
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="scale"
            title="Belum ada produk dibandingkan"
            description="Tambahkan hingga empat produk dari katalog untuk melihat perbedaannya di sini."
            action={<Button href="/products" icon="arrow-right">Cari produk</Button>}
          />
        </div>
      ) : (
        <div className="surface-card mt-12 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="sticky left-0 z-10 w-40 bg-[var(--surface)] px-4 py-5 text-left text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                    Produk
                  </th>
                  {rows.map(({ entry, product }) => (
                    <th key={entry.id} className="min-w-[190px] px-4 py-5 text-left align-top">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800/60">
                          <SafeImage src={product?.image ?? entry.image} alt={entry.name} className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/products/${entry.slug}`} className="line-clamp-2 text-left text-sm font-semibold text-white transition hover:text-[var(--accent)]">
                            {entry.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              removeCompare(entry.id);
                              toast(`${entry.name} dihapus dari perbandingan.`, "info");
                            }}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] text-zinc-500 transition hover:text-rose-300"
                          >
                            <Icon name="close" size={12} /> Hapus
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Harga</th>
                  {rows.map(({ product }) => cell(
                    <div className="space-y-2">
                      <span className="block text-base font-semibold text-white">{product ? formatRupiah(product.price) : "-"}</span>
                      {product && bestPrice === product.price && <Badge tone="accent">Harga terbaik</Badge>}
                    </div>,
                    Boolean(product && bestPrice === product.price),
                  ))}
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Rating</th>
                  {rows.map(({ product }) => cell(
                    <div className="space-y-2">
                      {product ? <Rating value={product.rating} count={product.reviewCount} /> : <span>-</span>}
                      {product && bestRating === product.rating && <Badge tone="accent">Rating tertinggi</Badge>}
                    </div>,
                    Boolean(product && bestRating === product.rating),
                  ))}
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Kategori</th>
                  {rows.map(({ product }) => cell(product ? categoryName(product) : "-"))}
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Stok</th>
                  {rows.map(({ product }) => cell(
                    product ? (product.stock > 0 ? `${product.stock} tersedia` : "Habis") : "-",
                  ))}
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Penjual</th>
                  {rows.map(({ product }) => cell(product ? product.sellerName : "-"))}
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Terjual</th>
                  {rows.map(({ product }) => cell(product ? `${product.sold} unit` : "-"))}
                </tr>
                <tr>
                  <th className="sticky left-0 z-10 bg-[var(--surface)] px-4 py-5 text-left text-xs font-medium text-zinc-500 uppercase">Aksi</th>
                  {rows.map(({ entry, product }) => cell(
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        icon="cart"
                        disabled={!product || product.stock === 0}
                        onClick={() => {
                          if (product) addToCart(product);
                        }}
                      >
                        Keranjang
                      </Button>
                      <Button size="sm" variant="outline" href={`/products/${entry.slug}`}>Detail</Button>
                    </div>,
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
