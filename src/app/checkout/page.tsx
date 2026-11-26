import type { Metadata } from "next";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import { Badge, Breadcrumbs, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Checkout | CGI Sports",
  description: "Periksa keranjang, isi alamat pengiriman, dan selesaikan pesanan CGI Sports kamu.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Keranjang", href: "/cart" }, { label: "Checkout" }]} />
      <div className="mt-8">
        <Badge tone="warning">Mode demo: pembayaran disimulasikan</Badge>
        <SectionHeading
          eyebrow="Checkout"
          title="Selesaikan pesanan kamu"
          description="Periksa keranjang, isi alamat, pilih metode pembayaran, lalu konfirmasi pesanan."
        />
      </div>
      <div className="mt-10">
        <CheckoutWizard />
      </div>
    </div>
  );
}
