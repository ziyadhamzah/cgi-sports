"use client";

import Link from "next/link";
import { EmptyState, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

export default function RecentlyViewed() {
  const { recent, clearRecent, track } = useStore();

  if (recent.length === 0) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-white">Dilihat Baru Saja</h2>
        <div className="mt-5">
          <EmptyState icon="eye" title="Belum ada produk yang dilihat" description="Produk yang kamu buka akan muncul di sini." />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-white">Dilihat Baru Saja</h2>
        <button
          type="button"
          onClick={clearRecent}
          className="inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white"
        >
          <Icon name="trash" size={14} /> Hapus riwayat
        </button>
      </div>
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
        {recent.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            onClick={() => track("product_click", { productId: item.id, productName: item.name })}
            className="surface-card flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl transition hover:border-[var(--accent)]/30"
          >
            <div className="relative aspect-square overflow-hidden bg-[var(--surface-soft)]">
              <SafeImage src={item.image} alt={item.name} sizes="176px" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-xs font-medium leading-5 text-white">{item.name}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--accent)]">{formatRupiah(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
