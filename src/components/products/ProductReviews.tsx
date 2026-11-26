"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Field, Stars, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { summaryRating } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

export default function ProductReviews({ product }: { product: Product }) {
  const { reviews, user, addReview, removeReview, toast } = useStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const productReviews = useMemo(
    () => reviews.filter((review) => review.productId === product.id),
    [reviews, product.id],
  );
  const summary = summaryRating(productReviews, product.rating, product.reviewCount);

  const submitReview = () => {
    if (!user) {
      toast("Masuk akun terlebih dahulu untuk mengirim ulasan.", "error");
      return;
    }
    if (rating === 0) {
      toast("Pilih jumlah bintang terlebih dahulu.", "error");
      return;
    }
    if (text.trim().length < 5) {
      toast("Tulis ulasan minimal 5 karakter.", "error");
      return;
    }
    addReview({
      productId: product.id,
      name: user.name,
      rating,
      text: text.trim(),
      verified: true,
    });
    setRating(0);
    setText("");
  };

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">Ulasan</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Pengalaman pembeli</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
          <Icon name="star" size={22} filled className="text-amber-400" />
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">{summary.avg.toFixed(1)}</p>
            <p className="text-[11px] text-[var(--muted)]">{summary.total} ulasan</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="surface-card h-fit rounded-3xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Tulis ulasan</h3>
          {user ? (
            <p className="mt-1 text-xs text-[var(--muted)]">Dikirim sebagai {user.name}</p>
          ) : (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Untuk mengirim ulasan, <Link href="/login" className="text-[var(--accent)] hover:underline">masuk akun</Link> terlebih dahulu.
            </p>
          )}
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">Nilai produk</p>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div className="mt-5">
            <Field label="Ulasan kamu">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                placeholder="Ceritakan kualitas, pengiriman, dan kesesuaian produk"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Button icon="edit" onClick={submitReview} full>
              Kirim Ulasan
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {productReviews.length === 0 ? (
            <div className="surface-soft rounded-3xl px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">Belum ada ulasan</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Jadilah pembeli pertama yang berbagi pengalaman.</p>
            </div>
          ) : (
            productReviews.map((review) => (
              <article key={review.id} className="surface-card rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-[var(--foreground)]">
                      {review.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                        {review.name}
                        {review.verified && <Badge tone="success">Ulasan demo</Badge>}
                      </p>
                      <p className="text-[11px] text-[var(--muted)]">
                        {formatDate(review.date)}{review.city ? ` · ${review.city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars value={review.rating} size={14} />
                    {review.userId && user?.id === review.userId && (
                      <button
                        type="button"
                        onClick={() => removeReview(review.id)}
                        aria-label="Hapus ulasan"
                        className="text-[var(--muted)] transition hover:text-rose-300"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{review.text}</p>
                {review.reply && (
                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                    <p className="text-xs font-semibold text-[var(--accent)]">Balasan penjual</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{review.reply}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
