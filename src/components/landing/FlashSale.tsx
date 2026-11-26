"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Badge, Button, EmptyState, Rating, SectionHeading, Stars } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { summaryRating } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
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
  const { reviews } = useStore();
  const [countdown, setCountdown] = useState("--:--:--");

  useEffect(() => {
    const update = () => setCountdown(nextMidnightCountdown());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const saleReviews = useMemo(() => {
    const ids = new Set(products.map((product) => product.id));
    return reviews.filter((review) => ids.has(review.productId));
  }, [reviews, products]);
  const summary = summaryRating(saleReviews, 0, 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: saleReviews.filter((review) => review.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((item) => item.count));

  return (
    <section className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Flash sale"
            title="Promo pilihan katalog"
            description="Promo pilihan dengan harga spesial sebelum pergantian hari, lengkap dengan rating pembeli."
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] px-5 py-3">
              <Icon name="clock" size={18} className="text-[var(--accent)]" />
              <div role="timer" aria-label="Hitungan mundur promo" aria-live="off">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  Berakhir dalam
                </p>
                <p className="font-mono text-lg font-semibold tabular-nums text-[var(--foreground)]">
                  {countdown}
                </p>
              </div>
            </div>
            <Button href="/promos" variant="outline" size="sm" icon="arrow-right">
              Semua promo
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Belum ada promo aktif" description="Promo baru akan segera hadir." />
          </div>
        ) : (
          <>
            {saleReviews.length > 0 && (
              <div className="mt-10 grid gap-6 rounded-3xl border border-[var(--line)] bg-[var(--background)] p-5 lg:grid-cols-[220px_1fr_1.2fr]">
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">Rating promo</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-semibold text-[var(--foreground)]">{summary.avg.toFixed(1)}</span>
                    <div className="pb-1">
                      <Stars value={Math.round(summary.avg)} size={13} />
                      <p className="mt-1 text-[11px] text-[var(--muted)]">{summary.total} ulasan terverifikasi</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {distribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                      <span className="w-8 shrink-0">{item.star} <Icon name="star" size={10} filled className="inline text-amber-400" /></span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${item.count / maxCount * 100}%` }} />
                      </span>
                      <span className="w-6 text-right tabular-nums">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {saleReviews.slice(0, 3).map((review) => {
                    const reviewProduct = products.find((product) => product.id === review.productId);
                    return (
                      <div key={review.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[var(--foreground)]">{review.name}</p>
                          <div className="flex items-center gap-2">
                            <Stars value={review.rating} size={11} />
                            <Badge tone="neutral">{formatDate(review.date)}</Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--accent)]">{reviewProduct?.name ?? "Produk promo"}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{review.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const productReviews = saleReviews.filter((review) => review.productId === product.id);
                const productRating = summaryRating(productReviews, product.rating, product.reviewCount);
                return (
                  <div key={product.id} className="space-y-2">
                    <ProductCard product={product} />
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--background)] px-3 py-2">
                      <Rating value={productRating.avg} count={productRating.total} size={12} />
                      <span className="text-[10px] text-[var(--muted)]">ulasan promo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
