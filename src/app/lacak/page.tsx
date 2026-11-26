import { Suspense } from "react";
import LacakForm from "@/components/orders/LacakForm";
import { Breadcrumbs, SectionHeading } from "@/components/ui";

export default function LacakPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Lacak Pesanan" }]} />
      <div className="mt-8">
        <SectionHeading
          eyebrow="Lacak Pesanan"
          title="Cek status pengiriman"
          description="Masukkan nomor pesanan atau nomor resi untuk melihat perkembangan pengiriman kamu."
        />
      </div>
      <div className="mt-10">
        <Suspense fallback={<div className="surface-card rounded-3xl p-8 text-sm text-zinc-400">Memuat formulir pelacakan...</div>}>
          <LacakForm />
        </Suspense>
      </div>
    </div>
  );
}
