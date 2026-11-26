"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useStore } from "@/lib/store/StoreProvider";

type NavLink = { href: string; label: string; group?: "more" };

const navLinks: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/promos", label: "Promo" },
  { href: "/sellers", label: "Penjual" },
  { href: "/services", label: "Layanan" },
  { href: "/bandingkan", label: "Bandingkan", group: "more" },
  { href: "/orders", label: "Pesanan", group: "more" },
  { href: "/lacak", label: "Lacak", group: "more" },
  { href: "/seller/dashboard", label: "Buka Toko", group: "more" },
];

const primaryLinks = navLinks.filter((link) => !link.group);
const secondaryLinks = navLinks.filter((link) => link.group === "more");

const subscribeNoop = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-[var(--accent-ink)]">
      {value > 99 ? "99+" : value}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const mounted = useSyncExternalStore(subscribeNoop, getMountedSnapshot, getServerMountedSnapshot);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
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
  const isReady = mounted && ready;
  const activeTheme = isReady ? theme : "dark";
  const activeUser = isReady ? user : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
      setMoreOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen && !menuOpen && !moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setMenuOpen(false);
      setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, menuOpen, moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

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
  const navItemClass = (active: boolean) => `rounded-full px-2.5 py-2 text-sm font-medium transition ${
    active
      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
      : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
  }`;
  const moreActive = secondaryLinks.some((link) => isActive(pathname, link.href));
  const quickLinks: { href: string; label: string; icon: IconName; value: number }[] = [
    { href: "/wishlist", label: "Wishlist", icon: "heart", value: isReady ? wishlist.length : 0 },
    { href: "/notifikasi", label: "Notifikasi", icon: "bell", value: isReady && activeUser ? unread : 0 },
    { href: "/cart", label: "Keranjang", icon: "cart", value: isReady ? itemCount : 0 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--background)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CGI Sports beranda">
          <Image src="/logo.webp" alt="CGI Sports" width={1536} height={1024} loading="eager" className="h-12 w-auto object-contain" />
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
          {primaryLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={navItemClass(active)}
              >
                {link.label}
              </Link>
            );
          })}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-controls="nav-more-menu"
              className={`flex items-center gap-1 ${navItemClass(moreActive)}`}
            >
              Lainnya
              <Icon name="chevron-down" size={13} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div
                id="nav-more-menu"
                className="absolute left-0 top-full z-50 mt-2 w-48 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-2xl shadow-black/40"
              >
                {secondaryLinks.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <form
            role="search"
            action="/products"
            method="get"
            className="hidden xl:block"
            onSubmit={(event) => {
              if (!navSearch.trim()) event.preventDefault();
            }}
          >
            <label htmlFor="navbar-search" className="sr-only">Cari produk</label>
            <div className="flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)]/70 pl-9 pr-1 transition focus-within:border-[var(--accent)]/60 focus-within:bg-[var(--surface)]">
              <Icon name="search" size={16} className="pointer-events-none -ml-1 mr-2 shrink-0 text-[var(--muted)]" />
              <input
                id="navbar-search"
                name="q"
                type="search"
                value={navSearch}
                onChange={(event) => setNavSearch(event.target.value)}
                placeholder="Cari alat olahraga atau toko"
                className="w-64 min-w-0 bg-transparent py-2 pr-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] 2xl:w-80"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch("")}
                  aria-label="Hapus pencarian"
                  className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Cari produk"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition hover:brightness-110"
              >
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </form>
          <button
            ref={searchToggleRef}
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className={`${iconButton} xl:hidden`}
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
            aria-label={activeTheme === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
          >
            <Icon name={activeTheme === "dark" ? "sun" : "moon"} size={17} />
          </button>
          <Link
            href="/account"
            aria-label={activeUser ? `Akun ${activeUser.name}` : "Masuk atau daftar"}
            className="hidden items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] sm:inline-flex"
          >
            {activeUser?.photo ? (
              <Image src={activeUser.photo} alt="" width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <Icon name="user" size={16} />
            )}
            <span className="max-w-24 truncate">{activeUser ? activeUser.name.split(" ")[0] : "Masuk"}</span>
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
        <form
          id="navbar-search-panel"
          role="search"
          action="/products"
          method="get"
          className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 xl:hidden"
          onSubmit={(event) => {
            if (!navSearch.trim()) event.preventDefault();
            setSearchOpen(false);
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            <label htmlFor="navbar-search-mobile" className="sr-only">Cari produk, kategori, atau penjual</label>
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-[var(--line)] bg-[var(--background)] pl-4 pr-1 transition focus-within:border-[var(--accent)]/60">
              <Icon name="search" size={17} className="shrink-0 text-[var(--muted)]" />
              <input
                ref={searchInputRef}
                id="navbar-search-mobile"
                name="q"
                type="search"
                value={navSearch}
                onChange={(event) => setNavSearch(event.target.value)}
                placeholder="Cari produk, kategori, atau toko"
                className="min-w-0 flex-1 bg-transparent py-3 pl-2 pr-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch("")}
                  aria-label="Hapus pencarian"
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              aria-label="Cari produk"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition hover:brightness-110"
            >
              <Icon name="arrow-right" size={18} />
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
            <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Menu utama
            </p>
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive(pathname, link.href)
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <p className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Lainnya
            </p>
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive(pathname, link.href)
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
                {link.href === "/bandingkan" && isReady && compare.length > 0 && (
                  <span className="text-xs">{compare.length} produk</span>
                )}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
            >
              {activeUser?.photo ? (
                <Image src={activeUser.photo} alt="" width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <Icon name="user" size={16} />
              )}
              {activeUser ? `Akun ${activeUser.name}` : "Masuk atau daftar"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
