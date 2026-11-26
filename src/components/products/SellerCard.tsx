import Link from "next/link";
import { Badge, Rating, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { initials } from "@/lib/format";
import type { Seller } from "@/lib/types";

export default function SellerCard({ seller }: { seller: Seller }) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="group surface-card block overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-[var(--accent)]/30"
    >
      <div className="relative h-40 overflow-hidden bg-[var(--surface-soft)]">
        <SafeImage
          src={seller.banner}
          alt={`Banner ${seller.name}`}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>
      <div className="relative px-5 pb-5">
        {seller.photo ? (
          <div className="relative -mt-10 mb-4 h-20 w-20 overflow-hidden rounded-2xl border-4 border-[var(--surface)] bg-[var(--surface)] shadow-lg shadow-black/20 ring-2 ring-[var(--accent)]/30">
            <SafeImage src={seller.photo} alt={`Foto ${seller.name}`} className="object-cover" />
          </div>
        ) : (
          <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[var(--surface)] bg-[var(--accent)] text-xl font-bold text-[#0a0a0a] shadow-lg shadow-black/20 ring-2 ring-[var(--accent)]/30">
            {initials(seller.name)}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {seller.verified && (
            <Badge tone="success">
              <Icon name="check" size={12} /> Terverifikasi
            </Badge>
          )}
          {seller.isOfficial && <Badge tone="accent">Toko Resmi</Badge>}
        </div>
        <h3 className="mt-3 text-base font-semibold text-[var(--foreground)] transition group-hover:text-[var(--accent)]">{seller.name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-[var(--muted)]">{seller.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Rating value={seller.rating} count={seller.reviewCount} />
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Icon name="location" size={13} /> {seller.city}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <span className="text-xs text-[var(--muted)]">Lihat katalog toko</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] transition group-hover:translate-x-0.5">
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
