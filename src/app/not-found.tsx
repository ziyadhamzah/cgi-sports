import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan | CGI Sports",
  description: "Halaman yang kamu cari tidak tersedia di CGI Sports.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
        <Icon name="target" size={30} />
      </span>
      <p className="mt-8 text-7xl font-semibold tracking-tight text-[var(--foreground)]">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
        Halaman ini tidak tersedia
      </h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
        Rute yang kamu tuju tidak ditemukan. Kembali ke beranda untuk menjelajahi katalog dan
        layanan CGI Sports.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-110"
      >
        <Icon name="home" size={16} />
        Kembali ke beranda
      </Link>
      <Link
        href="/products"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        Lihat semua produk
        <Icon name="arrow-right" size={14} />
      </Link>
    </div>
  );
}
