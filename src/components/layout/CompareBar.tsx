"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

export default function CompareBar() {
  const pathname = usePathname();
  const { ready, compare, removeCompare, clearCompare } = useStore();

  if (
    !ready ||
    compare.length === 0 ||
    pathname === "/bandingkan" ||
    pathname === "/cart" ||
    pathname === "/checkout"
  ) {
    return null;
  }

  return (
    <div role="region" aria-label="Perbandingan produk" className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--line)] bg-[var(--surface)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon name="scale" size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {compare.length} produk siap dibandingkan
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              Maksimal 4 produk. Lihat perbedaan harga, rating, dan penjual.
            </p>
          </div>
        </div>

        <div
          className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto"
          role="region"
          aria-label="Daftar produk dibandingkan"
          tabIndex={0}
        >
          {compare.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] py-1.5 pl-1.5 pr-2"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/5"
                aria-label={`Lihat ${item.name}`}
              >
                <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
              </Link>
              <div className="max-w-32">
                <p className="truncate text-xs font-medium text-[var(--foreground)]">{item.name}</p>
                <p className="text-[11px] text-[var(--accent)]">{formatRupiah(item.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeCompare(item.id)}
                className="rounded-full text-[var(--muted)] transition hover:text-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label={`Hapus ${item.name} dari perbandingan`}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="rounded-full px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Hapus semua
          </button>
          <Button href="/bandingkan" size="sm" icon="arrow-right">
            Bandingkan
          </Button>
        </div>
      </div>
    </div>
  );
}
