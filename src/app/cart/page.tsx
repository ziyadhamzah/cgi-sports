"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Breadcrumbs, Button, EmptyState, SafeImage, SectionHeading, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { computeDiscount, discountLabel, validateVoucher } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import { useSavedVoucher } from "@/lib/voucher";

export default function CartPage() {
  const { ready, cartItems, cart, subtotal, itemCount, allProducts, claimedVouchers, updateQuantity, removeFromCart, clearCart, resolveProduct } = useStore();
  const [savedVoucher, setSavedVoucher] = useSavedVoucher();
  const [draftVoucher, setDraftVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const voucherInput = draftVoucher ?? savedVoucher;
  const appliedCode = savedVoucher;

  const validation = useMemo(
    () => (appliedCode ? validateVoucher(appliedCode, subtotal, cart, resolveProduct, claimedVouchers) : {}),
    [appliedCode, subtotal, cart, resolveProduct, claimedVouchers],
  );
  const voucher = validation.voucher;
  const discount = useMemo(
    () => computeDiscount(voucher, subtotal, cart, resolveProduct),
    [voucher, subtotal, cart, resolveProduct],
  );
  const recommendations = useMemo(
    () => allProducts
      .filter((product) => !cart.some((item) => item.productId === product.id))
      .slice()
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4),
    [allProducts, cart],
  );

  const applyVoucher = () => {
    const result = validateVoucher(voucherInput, subtotal, cart, resolveProduct, claimedVouchers);
    if (!result.voucher) {
      setSavedVoucher("");
      setDraftVoucher("");
      setVoucherError(result.error ?? "Voucher tidak dapat digunakan.");
      return;
    }
    const code = result.voucher.code;
    setSavedVoucher(code);
    setDraftVoucher(code);
    setVoucherError("");
  };

  const removeVoucher = () => {
    setSavedVoucher("");
    setDraftVoucher("");
    setVoucherError("");
  };

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-[var(--muted)]">Memuat keranjang...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]} />
        <div className="mt-10">
          <SectionHeading eyebrow="Keranjang" title="Keranjang belanja kamu" description="Periksa produk yang ingin kamu beli sebelum melanjutkan checkout." />
        </div>
        <div className="mt-10">
          <EmptyState
            icon="cart"
            title="Keranjang masih kosong"
            description="Tambahkan alat olahraga favorit kamu dari katalog untuk mulai berbelanja."
            action={<Button href="/products" icon="arrow-right">Jelajahi Katalog</Button>}
          />
        </div>
      </div>
    );
  }

  const displayError = voucherError || validation.error;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]} />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Keranjang" title="Keranjang belanja kamu" description="Periksa jumlah produk dan gunakan voucher sebelum melanjutkan checkout." />
        <Badge tone="accent">{itemCount} item</Badge>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="surface-card rounded-3xl px-5 py-2 sm:px-7">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="flex flex-col gap-4 border-b border-[var(--line)] py-5 last:border-b-0 sm:flex-row">
              <Link href={`/products/${product.slug}`} className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-soft)] sm:h-28 sm:w-28">
                <SafeImage src={product.image} alt={product.name} sizes="(max-width: 640px) 100vw, 112px" className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--muted)]">{product.sellerName} · {product.city}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Hapus ${product.name}`}
                    className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)] transition hover:border-rose-400/40 hover:text-rose-300"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex items-center gap-1 rounded-full border border-[var(--line)] p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label={`Kurangi ${product.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-white/10 disabled:opacity-30"
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[var(--foreground)]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      aria-label={`Tambah ${product.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-white/10 disabled:opacity-30"
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted)]">{formatRupiah(product.price)} per item</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{formatRupiah(product.price * quantity)}</p>
                  </div>
                </div>
                {quantity >= product.stock && <p className="mt-2 text-[11px] text-amber-300">Stok maksimal tercapai.</p>}
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <section className="surface-card rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Ringkasan Belanja</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal ({itemCount} item)</span>
                <span className="text-[var(--foreground)]">{formatRupiah(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Diskon {voucher ? discountLabel(voucher) : ""}</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--muted)]">
                <span>Estimasi ongkir</span>
                <span className="text-[var(--foreground)]">{formatRupiah(15000)}</span>
              </div>
              <div className="border-t border-[var(--line)] pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-[var(--foreground)]">Total sementara</span>
                  <span className="text-xl font-semibold text-[var(--accent)]">{formatRupiah(subtotal - discount + 15000)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button href="/checkout" icon="arrow-right" full>Lanjut ke Checkout</Button>
            </div>
            <div className="mt-3 text-center">
              <Button variant="ghost" size="sm" icon="trash" onClick={() => { if (window.confirm("Kosongkan semua item dari keranjang?")) clearCart(); }}>Kosongkan Keranjang</Button>
            </div>
          </section>

          <section className="surface-card rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <Icon name="ticket" size={18} className="text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Gunakan Voucher</h2>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={voucherInput}
                onChange={(event) => setDraftVoucher(event.target.value.toUpperCase())}
                placeholder="Masukkan kode voucher"
                className={inputClass}
                aria-label="Kode voucher"
              />
              <Button size="sm" onClick={applyVoucher} disabled={!voucherInput.trim()}>Pakai</Button>
            </div>
            {voucher && !displayError && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                <span>{voucher.code} aktif</span>
                <button type="button" onClick={removeVoucher} className="transition hover:text-[var(--foreground)]">Hapus</button>
              </div>
            )}
            {displayError && <p className="mt-3 text-xs text-rose-300">{displayError}</p>}
            <p className="mt-3 text-[11px] text-[var(--muted)]">Kode voucher juga tersedia di halaman checkout.</p>
          </section>
        </aside>
      </div>

      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">Rekomendasi</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Mungkin kamu suka</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]">
            Lihat semua <Icon name="chevron-right" size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {recommendations.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group surface-card overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
            >
              <div className="relative h-28 overflow-hidden bg-[var(--surface-soft)]">
                <SafeImage src={product.image} alt={product.name} sizes="(max-width: 768px) 50vw, 220px" className="object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-[var(--foreground)]">{product.name}</p>
                <p className="mt-1 text-xs text-[var(--accent)]">{formatRupiah(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
