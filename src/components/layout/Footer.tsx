import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/mock-data";
import { Icon, type IconName } from "@/components/ui/Icon";

const footerLinks = [
  { href: "/products", label: "Semua produk" },
  { href: "/promos", label: "Promo & voucher" },
  { href: "/sellers", label: "Daftar penjual" },
  { href: "/services", label: "Layanan" },
  { href: "/bandingkan", label: "Bandingkan" },
  { href: "/orders", label: "Pesanan saya" },
  { href: "/lacak", label: "Lacak pesanan" },
  { href: "/account", label: "Akun saya" },
  { href: "/admin/analytics", label: "Analitik admin" },
];

const trustItems: { icon: IconName; title: string; text: string }[] = [
  { icon: "truck", title: "Pengiriman cepat", text: "Dari profil penjual lengkap di berbagai kota." },
  { icon: "shield", title: "Status pesanan jelas", text: "Pesanan dan status pembayaran tercatat jelas." },
  { icon: "sparkles", title: "Konsultan Produk", text: "Cocokkan alat olahraga dengan kebutuhanmu." },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="CGI Sports beranda">
              <Image src="/logo.webp" alt="CGI Sports" width={1536} height={1024} className="h-14 w-auto object-contain object-left" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
              Marketplace alat olahraga dengan katalog terkurasi, perbandingan produk, dan
              Konsultan Produk untuk membantu setiap langkah latihanmu.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--foreground)]">
              Kategori
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="transition hover:text-[var(--accent)]"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--foreground)]">
              Tautan
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[var(--accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--foreground)]">
              Kenapa CGI Sports
            </h3>
            <ul className="mt-4 space-y-4">
              {trustItems.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CGI Sports. Semua hak dilindungi.</p>
          <p>Belanja olahraga lebih pintar, mulai dari sini.</p>
        </div>
      </div>
    </footer>
  );
}
