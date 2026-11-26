"use client";

import { Badge, Button, SafeImage } from "@/components/ui";
import { discountPercent } from "@/lib/format";
import { categories, products, sellers } from "@/lib/mock-data";

const maxDiscount = Math.max(0, ...products.map((product) => discountPercent(product.price, product.originalPrice)));

const stats = [
  { value: String(products.length), label: "Produk bawaan" },
  { value: String(sellers.length), label: "Penjual" },
  { value: String(categories.length), label: "Kategori olahraga" },
];

export default function Hero() {
  function openChat() {
    window.dispatchEvent(new Event("cgi:open-chat"));
    window.setTimeout(() => document.getElementById("chat-input")?.focus(), 0);
  }

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-[var(--line)]">
      <div className="absolute inset-0">
        <SafeImage
          src="/images/hero/hero-gym.jpg"
          alt="Suasana gym dengan peralatan latihan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-medium tracking-[0.14em] uppercase text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Marketplace Olahraga Interaktif
          </span>
          <h1 className="mt-6 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-tight text-white">
            Latihan lebih serius,
            <br />
            perlengkapan lebih tepat.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/75">
            CGI Sports menghadirkan katalog alat olahraga terkurasi, perbandingan produk yang jelas,
            dan Konsultan Produk untuk membantu kamu memilih perlengkapan yang benar-benar sesuai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/products" size="lg" icon="arrow-right">
              Jelajahi Katalog
            </Button>
            <Button onClick={openChat} size="lg" variant="outline" icon="chat">
              Tanya Konsultan Produk
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-2xl border border-white/15 bg-black/45 p-5 backdrop-blur-md sm:max-w-md">
            <Badge tone="accent">Promo contoh</Badge>
            <p className="mt-3 text-sm font-medium text-white">
              Diskon hingga {maxDiscount}% dari katalog bawaan.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 backdrop-blur-md sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-black/45 px-6 py-5">
                <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-white/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
