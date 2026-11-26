import SellerCard from "@/components/products/SellerCard";
import { Button, SectionHeading } from "@/components/ui";
import type { Seller } from "@/lib/types";

export default function FeaturedSellers({ sellers }: { sellers: Seller[] }) {
  return (
    <section id="penjual" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Penjual"
          title="Toko olahraga pilihan"
          description="Lihat profil penjual, kota, dan katalog yang mereka tawarkan."
        />
        <Button href="/sellers" variant="outline" icon="arrow-right">
          Lihat semua penjual
        </Button>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}
