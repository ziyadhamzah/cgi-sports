"use client";

import Link from "next/link";
import { Badge, Button, Rating, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah, formatDiscountLabel } from "@/lib/format";
import { getCategoryName } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { wishlist, compare, toggleWishlist, toggleCompare, addToCart, track } = useStore();
  const inWishlist = wishlist.some((item) => item.id === product.id);
  const inCompare = compare.some((item) => item.id === product.id);
  const href = `/products/${product.slug}`;
  const open = () => track("product_click", { productId: product.id, productName: product.name });

  return (
    <article className="group surface-card flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-[var(--accent)]/30">
      <Link href={href} onClick={open} className="relative block aspect-[4/3] overflow-hidden bg-[var(--surface-soft)]">
        <SafeImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="neutral">{getCategoryName(product.categorySlug)}</Badge>
          {(product.promoLabel || formatDiscountLabel(product.price, product.originalPrice)) && (
            <Badge tone="accent">{product.promoLabel || formatDiscountLabel(product.price, product.originalPrice)}</Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={href} onClick={open} className="block">
          <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[var(--foreground)] transition group-hover:text-[var(--accent)]">{product.name}</h3>
        </Link>
        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[var(--muted)]">
          <Icon name="store" size={12} />
          <span className="truncate">{product.sellerName}</span>
          <span className="text-[var(--muted)]">·</span>
          <Icon name="location" size={12} />
          <span>{product.city}</span>
        </p>
        <div className="mt-3">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-lg font-semibold text-[var(--accent)]">{formatRupiah(product.price)}</span>
          {product.originalPrice && (
            <span className="pb-0.5 text-xs text-[var(--muted)] line-through">{formatRupiah(product.originalPrice)}</span>
          )}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
          <span>Terjual {product.sold}</span>
          <span aria-hidden="true">·</span>
          <span className={product.stock <= 5 ? "text-amber-400" : undefined}>
            {product.stock > 0 ? `Sisa ${product.stock}` : "Stok habis"}
          </span>
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            icon="cart"
            className="flex-1"
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? "Tambah" : "Stok habis"}
          </Button>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={inWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              inWishlist ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            }`}
          >
            <Icon name="heart" size={16} filled={inWishlist} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            aria-label={inCompare ? "Hapus dari perbandingan" : "Tambah ke perbandingan"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              inCompare ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            }`}
          >
            <Icon name="scale" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
