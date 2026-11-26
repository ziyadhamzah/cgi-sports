"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useStore } from "@/lib/store/StoreProvider";

type NavLink = { href: string; label: string };

const navLinks: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/promos", label: "Promo" },
  { href: "/sellers", label: "Penjual" },
  { href: "/services", label: "Layanan" },
  { href: "/bandingkan", label: "Bandingkan" },
  { href: "/orders", label: "Pesanan" },
  { href: "/lacak", label: "Lacak" },
  { href: "/seller/dashboard", label: "Buka Toko" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--accent-ink)]">
      {value > 99 ? "99+" : value}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);
  const wasSearchOpen = useRef(false);
  const {
    ready,
    wishlist,
    compare,
    notifications,
    itemCount,
    theme,
    user,
    toggleTheme,
  } = useStore();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, menuOpen]);

  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      wasSearchOpen.current = true;
      return () => window.clearTimeout(timer);
    }
    if (wasSearchOpen.current) searchToggleRef.current?.focus();
    wasSearchOpen.current = false;
  }, [searchOpen]);

  const unread = notifications.filter((item) => !item.read).length;
  const iconButton =
    "relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
  const quickLinks: { href: string; label: string; icon: IconName; value: number }[] = [
    { href: "/wishlist", label: "Wishlist", icon: "heart", value: ready ? wishlist.length : 0 },
    { href: "/notifikasi", label: "Notifikasi", icon: "bell", value: ready && user ? unread : 0 },
    { href: "/cart", label: "Keranjang", icon: "cart", value: ready ? itemCount : 0 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--background)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CGI Sports beranda">
          <Image src="/logo.webp" alt="CGI Sports" width={1536} height={1024} loading="eager" className="h-12 w-auto object-contain" />
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <form role="search" action="/products" method="get" className="hidden md:block">
            <label htmlFor="navbar-search" className="sr-only">Cari produk</label>
            <div className="relative">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                id="navbar-search"
                name="q"
                type="search"
                placeholder="Cari produk"
                className="w-36 rounded-full border border-[var(--line)] bg-[var(--background)] py-2 pl-9 pr-3 text-xs text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:w-52"
              />
            </div>
          </form>
          <button
            ref={searchToggleRef}
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className={`${iconButton} md:hidden`}
            aria-label={searchOpen ? "Tutup pencarian" : "Buka pencarian"}
            aria-expanded={searchOpen}
            aria-controls="navbar-search-panel"
          >
            <Icon name="search" size={17} />
          </button>
          {quickLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={`${link.label}, ${link.value} item`}
                className={`${iconButton} ${active ? "border-[var(--accent)]/40 text-[var(--accent)]" : ""}`}
              >
                <Icon name={link.icon} size={17} />
                <CountBadge value={link.value} />
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggleTheme}
            className={iconButton}
            aria-label={theme === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
          </button>
          <Link
            href="/account"
            aria-label={user ? `Akun ${user.name}` : "Masuk atau daftar"}
            className="hidden items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] sm:inline-flex"
          >
            {user?.photo ? (
              <Image src={user.photo} alt="" width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <Icon name="user" size={16} />
            )}
            <span className="max-w-24 truncate">{user ? user.name.split(" ")[0] : "Masuk"}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`${iconButton} lg:hidden`}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <form id="navbar-search-panel" role="search" action="/products" method="get" className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-2">
            <label htmlFor="navbar-search-mobile" className="sr-only">Cari produk, kategori, atau penjual</label>
            <input
              ref={searchInputRef}
              id="navbar-search-mobile"
              name="q"
              type="search"
              placeholder="Cari produk, kategori, atau penjual"
              className={inputClass}
            />
            <button
              type="submit"
              aria-label="Cari produk"
              className={`${iconButton} shrink-0 bg-[var(--accent)] text-[var(--accent-ink)]`}
            >
              <Icon name="search" size={17} />
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 lg:hidden"
          aria-label="Navigasi seluler"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                  {link.href === "/bandingkan" && ready && compare.length > 0 && (
                    <span className="text-xs">{compare.length} produk</span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
            >
              {user?.photo ? (
                <Image src={user.photo} alt="" width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <Icon name="user" size={16} />
              )}
              {user ? `Akun ${user.name}` : "Masuk atau daftar"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
