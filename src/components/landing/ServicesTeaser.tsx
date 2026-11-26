import Link from "next/link";
import { Button, SafeImage, SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import type { Service } from "@/lib/types";

export default function ServicesTeaser({ services }: { services: Service[] }) {
  return (
    <section id="layanan" className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Layanan"
            title="Lebih dari sekadar belanja"
            description="Perawatan perlengkapan dan pendampingan latihan dalam satu marketplace."
          />
          <Button href="/services" variant="outline" icon="arrow-right">
            Semua layanan
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="surface-card group overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-[var(--accent)]/40"
            >
              <div className="relative h-36 overflow-hidden bg-[var(--surface-soft)]">
                <SafeImage src={service.image} alt={service.name} sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] text-[var(--accent)] shadow-lg">
                  <Icon name={(service.icon as IconName) || "sparkles"} size={20} />
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{service.description}</p>
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
                  <span className="text-sm font-semibold text-[var(--accent)]">
                    {formatRupiah(service.price)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{service.duration}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] transition group-hover:translate-x-0.5">
                  Lihat detail
                  <Icon name="arrow-right" size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
