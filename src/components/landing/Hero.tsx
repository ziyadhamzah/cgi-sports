"use client";

import { useEffect, useState } from "react";
import { Button, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { discountPercent } from "@/lib/format";
import { categories, products, sellers } from "@/lib/mock-data";

const maxDiscount = Math.max(0, ...products.map((product) => discountPercent(product.price, product.originalPrice)));

const stats = [
  { value: String(products.length), label: "Produk" },
  { value: String(sellers.length), label: "Penjual" },
  { value: String(categories.length), label: "Kategori" },
];

const heroSlides = [
  { src: "/images/hero/hero-store.jpg", alt: "Etalase toko olahraga dengan papan selancar dan pakaian olahraga" },
  { src: "/images/hero/hero-skates.jpg", alt: "Deretan sepatu skating tersusun rapi di rak toko" },
  { src: "/images/hero/hero-storefront.jpg", alt: "Tampak depan toko perlengkapan olahraga" },
  { src: "/images/hero/hero-sportswear.jpg", alt: "Display pakaian olahraga dan bola di dalam toko" },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  function openChat() {
    window.dispatchEvent(new Event("cgi:open-chat"));
    window.setTimeout(() => document.getElementById("chat-input")?.focus(), 0);
  }

  return (
    <section className="relative min-h-[92vh] overflow-hidden border-b border-[var(--line)]">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <SafeImage
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-4 pb-32 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="max-w-2xl">
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              Latihan lebih serius,
              <br className="hidden sm:block" /> perlengkapan lebih tepat.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              CGI Sports menghadirkan katalog alat olahraga terkurasi, perbandingan produk yang jelas,
              dan Konsultan Produk untuk membantu kamu memilih perlengkapan yang tepat.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/products" size="lg" icon="arrow-right">
                Jelajahi Katalog
              </Button>
              <Button onClick={openChat} size="lg" variant="outline" icon="chat">
                Tanya Konsultan Produk
              </Button>
            </div>
          </div>

          <div className="w-full max-w-sm lg:justify-self-end">
            <div className="rounded-3xl border border-white/15 bg-black/45 p-6 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Promo pilihan
              </p>
              <p className="mt-4 text-5xl font-semibold leading-none tracking-tight text-white">{maxDiscount}%</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Diskon maksimal dari katalog perlengkapan olahraga pilihan kami.
              </p>
              <Button href="/promos" size="sm" icon="arrow-right" className="mt-6">
                Lihat promo
              </Button>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 pt-4 text-[11px] text-white/60">
                {stats.map((stat) => (
                  <span key={stat.label}>
                    <strong className="font-semibold text-white">{stat.value}</strong> {stat.label.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-4 right-4 z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 sm:bottom-8 sm:left-6 sm:right-6 lg:left-8 lg:right-8"
        role="group"
        aria-label="Kontrol slider hero"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Tampilkan foto hero ${index + 1}`}
              aria-current={index === activeSlide}
              className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-white/40 hover:bg-white/75"}`}
            />
          ))}
          <span className="ml-2 font-mono text-[11px] tabular-nums text-white/70">
            {String(activeSlide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Foto hero sebelumnya"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Icon name="arrow-left" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}
            aria-label="Foto hero berikutnya"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
