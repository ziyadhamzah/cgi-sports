"use client";

import { Button, SectionHeading } from "@/components/ui";

export default function CtaSection() {
  function openChat() {
    const fab = document.getElementById("chat-fab");
    if (fab instanceof HTMLButtonElement && fab.getAttribute("aria-expanded") !== "true") {
      fab.click();
    }
    window.setTimeout(() => document.getElementById("chat-input")?.focus(), 0);
  }

  return (
    <section id="konsultasi" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-8 py-14 md:px-14 md:py-20">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--accent)] opacity-10 blur-[100px]" />
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative max-w-2xl">
          <SectionHeading
            eyebrow="Mulai sekarang"
            title="Bingung memilih alat olahraga? Tanya saja."
            description="Konsultan Produk mencocokkan kata kunci kebutuhanmu dengan katalog CGI Sports. Gratis dan mudah dicoba."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={openChat} icon="sparkles" size="lg">
              Tanya Konsultan Produk
            </Button>
            <Button href="/products" variant="outline" icon="arrow-right" size="lg">
              Jelajahi Katalog
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
