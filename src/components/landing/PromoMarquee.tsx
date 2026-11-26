import { Fragment } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

const promos: { icon: IconName; text: string; href?: string; highlight?: boolean }[] = [
  { icon: "ticket", text: "Voucher CGI10: diskon 10% maks. Rp50.000, min. Rp150.000", href: "/promos", highlight: true },
  { icon: "truck", text: "Profil penjual lengkap dengan status pengiriman", href: "/sellers" },
  { icon: "sparkles", text: "Konsultan Produk berbasis kata kunci, gratis dicoba" },
  { icon: "scale", text: "Bandingkan hingga 4 produk sekaligus", href: "/bandingkan" },
  { icon: "shield", text: "Status pesanan dan pembayaran transparan", href: "/orders" },
];

export default function PromoMarquee() {
  return (
    <div className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6 lg:gap-x-8 lg:px-8">
        {promos.map((promo, index) => {
          const className = `group inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm transition ${
            promo.highlight
              ? "bg-[var(--accent)]/10 text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
          }`;
          const content = (
            <>
              <Icon name={promo.icon} size={16} className="shrink-0 text-[var(--accent)]" />
              <span>{promo.text}</span>
            </>
          );
          return (
            <Fragment key={promo.text}>
              {index > 0 && <span className="hidden h-4 w-px bg-[var(--line)] lg:block" aria-hidden="true" />}
              {promo.href ? (
                <Link href={promo.href} className={className}>{content}</Link>
              ) : (
                <span className={className}>{content}</span>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
