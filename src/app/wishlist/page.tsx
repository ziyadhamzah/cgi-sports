"use client";

import Link from "next/link";
import { Badge, Breadcrumbs, Button, EmptyState, Rating, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

export default function WishlistPage() {
  const { ready, wishlist, resolveProduct, removeWishlist, clearWishlist, addToCart, toast } = useStore();

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400 md:px-8">Memuat wishlist...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Wishlist" }]} />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Favorit"
          title="Wishlist kamu"
          description="Simpan produk yang kamu minati, lalu tambahkan ke keranjang kapan saja."
        />
        {wishlist.length > 0 && (
          <Button
            variant="outline"
            icon="trash"
            onClick={() => {
              clearWishlist();
              toast("Wishlist berhasil dikosongkan.", "info");
            }}
          >
            Kosongkan wishlist
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="heart"
            title="Wishlist masih kosong"
            description="Tambahkan produk favorit dari katalog agar mudah ditemukan lagi nanti."
            action={<Button href="/products" icon="arrow-right">Jelajahi katalog</Button>}
          />
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((entry) => {
            const product = resolveProduct(entry.id);
            const price = product?.price ?? entry.price;
            const image = product?.image ?? entry.image;
            const available = Boolean(product && product.stock > 0);

            return (
              <article key={entry.id} className="surface-card overflow-hidden rounded-3xl">
                <div className="relative h-48 bg-zinc-900/60">
                  <SafeImage src={image} alt={entry.name} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        <Link href={`/products/${entry.slug}`} className="transition hover:text-[var(--accent)]">
                          {entry.name}
                        </Link>
                      </h3>
                      <div className="mt-2">
                        {product ? (
                          <Rating value={product.rating} count={product.reviewCount} />
                        ) : (
                          <Badge tone="warning">Produk tidak tersedia</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeWishlist(entry.id);
                        toast(`${entry.name} dihapus dari wishlist.`, "info");
                      }}
                      className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
                      aria-label={`Hapus ${entry.name} dari wishlist`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">{formatRupiah(price)}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {product ? (available ? `Stok tersedia: ${product.stock}` : "Stok habis") : "Data produk tidak ditemukan"}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      icon="cart"
                      disabled={!available || !product}
                      onClick={() => {
                        if (product) addToCart(product);
                      }}
                    >
                      Tambah ke keranjang
                    </Button>
                    <Button size="sm" variant="outline" href={`/products/${entry.slug}`}>
                      Lihat detail
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
