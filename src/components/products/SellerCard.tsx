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
      <div className="relative h-36 overflow-hidden bg-[var(--surface-soft)]">
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
          <div className="relative -mt-8 mb-4 h-16 w-16 overflow-hidden rounded-2xl border-4 border-[var(--surface)] bg-[var(--surface)]">
            <SafeImage src={seller.photo} alt={`Foto ${seller.name}`} className="object-cover" />
          </div>
        ) : (
          <div className="-mt-8 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[var(--surface)] bg-[var(--accent)] text-lg font-bold text-[#0a0a0a]">
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
        <h3 className="mt-3 text-base font-semibold text-white transition group-hover:text-[var(--accent)]">{seller.name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-zinc-400">{seller.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Rating value={seller.rating} count={seller.reviewCount} />
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Icon name="location" size={13} /> {seller.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
