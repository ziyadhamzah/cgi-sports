"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { EmptyState, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/types";

function nextMidnightCountdown() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function FlashSale({ products }: { products: Product[] }) {
  const [countdown, setCountdown] = useState("--:--:--");

  useEffect(() => {
    const update = () => setCountdown(nextMidnightCountdown());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Flash sale"
            title="Promo pilihan katalog"
            description="Contoh promo demo. Harga tetap berlaku setelah hitungan mundur berakhir."
          />
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] px-5 py-3">
            <Icon name="clock" size={18} className="text-[var(--accent)]" />
            <div role="timer" aria-label="Contoh hitungan mundur" aria-live="off">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                Contoh hitungan
              </p>
              <p className="font-mono text-lg font-semibold tabular-nums text-[var(--foreground)]">
                {countdown}
              </p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Belum ada promo aktif" description="Promo baru akan segera hadir." />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
