import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import { Badge, Breadcrumbs, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { getServiceBySlug, services } from "@/lib/mock-data";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Pick<PageProps<"/services/[slug]">, "params">): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  return {
    title: service ? `${service.name} | CGI Sports` : "Layanan | CGI Sports",
    description: service?.description,
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Layanan", href: "/services" }, { label: service.name }]} />
      <div className="mt-8">
        <SectionHeading eyebrow="Layanan CGI Sports" title={service.name} description={service.description} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="surface-card rounded-3xl p-6 md:p-8">
          <div className="relative h-56 overflow-hidden rounded-2xl bg-[var(--surface-soft)]">
            <SafeImage src={service.image} alt={service.name} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="accent">{formatRupiah(service.price)}</Badge>
            <Badge tone="neutral">Durasi {service.duration}</Badge>
          </div>
          <h2 className="mt-7 text-lg font-semibold text-white">Syarat dan ketentuan</h2>
          <ul className="mt-5 space-y-3">
            {service.requirements.map((requirement, index) => (
              <li key={requirement} className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[11px] font-semibold text-[var(--accent)]">
                  {index + 1}
                </span>
                {requirement}
              </li>
            ))}
          </ul>
          <div className="surface-soft mt-8 flex items-start gap-3 rounded-2xl p-5">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <p className="text-xs leading-6 text-zinc-400">
              Pengajuan diproses oleh tim CGI Sports. Kamu akan melihat nomor pengajuan setelah form berhasil dikirim.
            </p>
          </div>
        </section>

        <ServiceRequestForm service={service} />
      </div>
    </main>
  );
}
