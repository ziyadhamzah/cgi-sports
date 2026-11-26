import { Breadcrumbs, Button, SafeImage, SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { services } from "@/lib/mock-data";

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Layanan" }]} />
      <div className="mt-8">
        <SectionHeading
          eyebrow="Layanan"
          title="Layanan olahraga untuk kamu"
          description="Stringing raket, personal trainer, perawatan sepatu, hingga booking lapangan dalam satu tempat."
        />
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="surface-card flex flex-col rounded-3xl p-6 md:p-7">
            <div className="relative h-40 overflow-hidden rounded-2xl bg-[var(--surface-soft)]">
              <SafeImage
                src={service.image}
                alt={service.name}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-zinc-200 backdrop-blur">
                {service.duration}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <Icon name={service.icon as IconName} size={21} />
              </span>
              <h2 className="text-lg font-semibold text-white">{service.name}</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{service.description}</p>
            <ul className="mt-5 space-y-2">
              {service.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-2 text-xs text-zinc-500">
                  <Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  {requirement}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
              <div>
                <p className="text-[11px] text-zinc-500">Mulai dari</p>
                <p className="text-lg font-semibold text-[var(--accent)]">{formatRupiah(service.price)}</p>
              </div>
              <Button href={`/services/${service.slug}`} icon="arrow-right">Detail layanan</Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
