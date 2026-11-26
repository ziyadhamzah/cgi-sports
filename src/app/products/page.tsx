import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import ProductsBrowser from "@/components/products/ProductsBrowser";

export const metadata: Metadata = {
  title: "Katalog Produk | CGI Sports",
  description: "Jelajahi dan filter perlengkapan olahraga dari berbagai kategori dan penjual.",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Produk" }]} />
      <SectionHeading
        className="mt-8"
        eyebrow="Katalog"
        title="Temukan perlengkapan olahraga yang tepat"
        description="Saring produk berdasarkan kategori, kota, harga, dan rating sesuai kebutuhanmu."
      />
      <div className="mt-12">
        <Suspense fallback={<div className="surface-card rounded-3xl px-6 py-16 text-center text-sm text-zinc-400">Memuat katalog produk...</div>}>
          <ProductsBrowser />
        </Suspense>
      </div>
    </main>
  );
}
