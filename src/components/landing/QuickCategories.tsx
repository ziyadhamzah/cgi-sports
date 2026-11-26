import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Category } from "@/lib/types";

export default function QuickCategories({ categories }: { categories: Category[] }) {
  return (
    <section id="kategori" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Kategori"
        title="Pilih medan latihanmu"
        description="Dari home gym sampai hiking, semua perlengkapan ada di satu tempat."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="surface-card group rounded-2xl p-6 transition hover:border-[var(--accent)]/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Icon name={(category.icon as IconName) || "dumbbell"} size={20} />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)]">{category.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
              Jelajahi kategori
              <Icon
                name="arrow-right"
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
