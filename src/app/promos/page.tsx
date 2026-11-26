import FlashSale from "@/components/landing/FlashSale";
import VoucherCenter from "@/components/promos/VoucherCenter";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import { products } from "@/lib/mock-data";

export const metadata = {
  title: "Promo & Voucher | CGI Sports",
  description: "Klaim voucher dan lihat promo pilihan CGI Sports.",
};

export default function PromosPage() {
  const promoProducts = products.filter((product) => product.isPromo);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Promo & voucher" }]} />
        <div className="mt-8">
          <SectionHeading
            eyebrow="Promo & voucher"
            title="Hemat tanpa ribet"
            description="Klaim voucher sekali klik, lalu pakai di keranjang. Promo pilihan dengan harga spesial juga tersedia di bawah."
          />
        </div>
        <VoucherCenter />
      </main>
      <FlashSale products={promoProducts} />
    </>
  );
}
