import type { Metadata } from "next";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import SellerDirectory from "@/components/seller/SellerDirectory";

export const metadata: Metadata = {
  title: "Daftar Penjual | CGI Sports",
  description: "Temukan profil penjual perlengkapan olahraga di CGI Sports.",
};

export default function SellersPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Penjual" }]} />
      <SectionHeading
        className="mt-8"
        eyebrow="Penjual"
        title="Belanja dari penjual pilihan"
        description="Setiap toko memiliki keahlian dan katalog berbeda sesuai cabang olahraga."
      />
      <SellerDirectory />
    </main>
  );
}
