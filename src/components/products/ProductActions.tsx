"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { clamp, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { wishlist, compare, watched, addToCart, toggleWishlist, toggleCompare, toggleWatch, toast } = useStore();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock);
  const inWishlist = wishlist.some((item) => item.id === product.id);
  const inCompare = compare.some((item) => item.id === product.id);
  const isWatched = watched.some((item) => item.id === product.id);
  const safeQuantity = clamp(quantity, 1, maxQuantity);

  const buyNow = () => {
    if (outOfStock) return;
    addToCart(product, safeQuantity);
    router.push("/checkout");
  };

  const handleWatch = () => {
    toggleWatch(product);
    toast(isWatched ? "Pemantauan harga dihapus." : "Harga produk akan dipantau.", "info");
  };

  return (
    <div className="surface-card rounded-3xl p-5">
      <p className="text-xs font-medium text-[var(--muted)]">Jumlah</p>
      <div className="mt-2 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)]">
        <button
          type="button"
          onClick={() => setQuantity((current) => clamp(current - 1, 1, maxQuantity))}
          disabled={outOfStock || safeQuantity <= 1}
          aria-label="Kurangi jumlah"
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/10 disabled:opacity-30"
        >
          <Icon name="minus" size={16} />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-[var(--foreground)]">{safeQuantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((current) => clamp(current + 1, 1, maxQuantity))}
          disabled={outOfStock || safeQuantity >= maxQuantity}
          aria-label="Tambah jumlah"
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/10 disabled:opacity-30"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {outOfStock ? "Stok sedang habis" : `Stok tersedia: ${product.stock} unit`}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button icon="cart" full onClick={() => addToCart(product, safeQuantity)} disabled={outOfStock}>
          Tambah ke Keranjang
        </Button>
        <Button variant="outline" icon="arrow-right" full onClick={buyNow} disabled={outOfStock}>
          Beli Sekarang
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] transition ${
            inWishlist ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
          }`}
        >
          <Icon name="heart" size={16} filled={inWishlist} /> Wishlist
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product)}
          className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] transition ${
            inCompare ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
          }`}
        >
          <Icon name="scale" size={16} /> Bandingkan
        </button>
        <button
          type="button"
          onClick={handleWatch}
          className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] transition ${
            isWatched ? "border-sky-400/40 bg-sky-400/10 text-sky-300" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
          }`}
        >
          <Icon name="eye" size={16} /> Pantau Harga
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
        <span>Estimasi subtotal</span>
        <span className="text-sm font-semibold text-[var(--foreground)]">{formatRupiah(product.price * safeQuantity)}</span>
      </div>
    </div>
  );
}
