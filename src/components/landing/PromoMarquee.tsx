import { Icon, type IconName } from "@/components/ui/Icon";

const promos: { icon: IconName; text: string }[] = [
  { icon: "ticket", text: "Voucher CGI10: diskon 10% maksimal Rp50.000, minimal belanja Rp150.000" },
  { icon: "truck", text: "Profil penjual lengkap dengan status pengiriman" },
  { icon: "sparkles", text: "Konsultan Produk berbasis kata kunci, gratis untuk dicoba" },
  { icon: "scale", text: "Bandingkan hingga 4 produk sekaligus" },
  { icon: "shield", text: "Status pesanan dan pembayaran transparan" },
];

export default function PromoMarquee() {
  return (
    <div className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div
        className="no-scrollbar mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        role="region"
        aria-label="Promo dan layanan CGI Sports"
        tabIndex={0}
      >
        {promos.map((promo) => (
          <span
            key={promo.text}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--background)] px-4 py-2 text-xs text-[var(--muted)]"
          >
            <Icon name={promo.icon} size={14} className="text-[var(--accent)]" />
            {promo.text}
          </span>
        ))}
      </div>
    </div>
  );
}
