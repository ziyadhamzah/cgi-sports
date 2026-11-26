"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import VoucherPromo from "@/components/checkout/VoucherPromo";
import { Button, EmptyState, Field, SafeImage, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { computeDiscount, discountLabel, validateVoucher } from "@/lib/catalog";
import { createId, formatRupiah, makeOrderNumber } from "@/lib/format";
import { cities, paymentMethods } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import { useSavedVoucher } from "@/lib/voucher";
import { isValidPhone, isValidPostalCode } from "@/lib/validation";
import type { Order } from "@/lib/types";

const SHIPPING_FEE = 15000;

const steps = [
  { value: 1, label: "Keranjang" },
  { value: 2, label: "Alamat" },
  { value: 3, label: "Pembayaran" },
  { value: 4, label: "Konfirmasi" },
] as const;

type Step = (typeof steps)[number]["value"];

type FormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CheckoutWizard() {
  const {
    ready,
    cartItems,
    cart,
    subtotal,
    itemCount,
    user,
    addresses,
    resolveProduct,
    addAddress,
    setPrimaryAddress,
    saveOrder,
    clearCart,
    track,
    toast,
  } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [overrides, setOverrides] = useState<Partial<FormState>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("qris");
  const [savedVoucher, setSavedVoucher] = useSavedVoucher();
  const [draftVoucher, setDraftVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const voucherInput = draftVoucher ?? savedVoucher;
  const appliedCode = savedVoucher;
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useMemo<FormState>(() => {
    const primary = addresses.find((address) => address.primary) ?? addresses[0];
    return {
      name: overrides.name ?? user?.name ?? primary?.name ?? "",
      phone: overrides.phone ?? primary?.phone ?? "",
      address: overrides.address ?? primary?.address ?? "",
      city: overrides.city ?? primary?.city ?? "",
      postalCode: overrides.postalCode ?? primary?.postalCode ?? "",
    };
  }, [addresses, overrides, user]);

  const validation = useMemo(
    () => (appliedCode ? validateVoucher(appliedCode, subtotal, cart, resolveProduct) : {}),
    [appliedCode, subtotal, cart, resolveProduct],
  );
  const voucher = validation.voucher;
  const discount = useMemo(
    () => computeDiscount(voucher, subtotal, cart, resolveProduct),
    [voucher, subtotal, cart, resolveProduct],
  );
  const total = Math.max(0, subtotal + SHIPPING_FEE - discount);

  const updateField = (key: keyof FormState, value: string) => {
    setOverrides((previous) => ({ ...previous, [key]: value }));
  };

  const applyVoucher = (code: string) => {
    const result = validateVoucher(code, subtotal, cart, resolveProduct);
    if (!result.voucher) {
      setSavedVoucher("");
      setDraftVoucher("");
      setVoucherError(result.error ?? "Voucher tidak dapat digunakan.");
      return;
    }
    const nextCode = result.voucher.code;
    setSavedVoucher(nextCode);
    setDraftVoucher(nextCode);
    setVoucherError("");
  };

  const validateAddress = () => {
    const nextErrors: FormErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Nama penerima wajib diisi.";
    if (!isValidPhone(form.phone)) nextErrors.phone = "Nomor telepon harus 10–15 digit.";
    if (form.address.trim().length < 10) nextErrors.address = "Alamat minimal 10 karakter.";
    if (!cities.includes(form.city)) nextErrors.city = "Pilih kota pengiriman yang tersedia.";
    if (!isValidPostalCode(form.postalCode)) nextErrors.postalCode = "Kode pos harus terdiri dari 5 angka.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToPayment = () => {
    if (!validateAddress()) return;
    if (saveAddress) {
      addAddress({
        label: "Alamat Pengiriman",
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city,
        postalCode: form.postalCode.trim(),
        primary: addresses.length === 0,
      });
    }
    setStep(3);
  };

  const submitOrder = () => {
    if (submitting) return;
    if (!validateAddress()) {
      setStep(2);
      return;
    }
    if (cartItems.length === 0) {
      toast("Keranjang kosong. Tambahkan produk terlebih dahulu.", "error");
      setStep(1);
      return;
    }
    const unavailable = cartItems.find(({ product, quantity }) => product.stock <= 0 || quantity > product.stock);
    if (unavailable) {
      toast(`Stok ${unavailable.product.name} berubah. Perbarui keranjang kamu.`, "error");
      setStep(1);
      return;
    }

    setSubmitting(true);
    track("begin_checkout");
    const order: Order = {
      id: createId("order"),
      number: makeOrderNumber(),
      status: "menunggu_pembayaran",
      items: cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      })),
      subtotal,
      shippingFee: SHIPPING_FEE,
      discount,
      total,
      ...(voucher ? { voucherCode: voucher.code } : {}),
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city,
      postalCode: form.postalCode.trim(),
      paymentMethod,
      createdAt: new Date().toISOString(),
      ...(user ? { userId: user.id } : {}),
    };

    saveOrder(order);
    clearCart();
    setPlacedOrder(order);
    setSavedVoucher("");
    setStep(4);
    setSubmitting(false);
    toast("Pesanan berhasil dibuat. Selesaikan pembayaran kamu.");
  };

  if (!ready) {
    return <div className="surface-card rounded-3xl p-8 text-sm text-[var(--muted)]">Memuat checkout...</div>;
  }

  return (
    <div>
      <div className="surface-card rounded-3xl p-4 sm:p-5">
        <ol className="grid gap-2 sm:grid-cols-4">
          {steps.map((item) => {
            const active = item.value === step;
            const done = item.value < step;
            return (
              <li key={item.value} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${active ? "bg-[var(--accent)]/10" : "bg-[var(--surface-soft)]"}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done || active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>
                  {done ? <Icon name="check" size={14} /> : item.value}
                </span>
                <span className={`text-xs font-medium ${active ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{item.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8">
        {step === 1 && (
          cartItems.length === 0 ? (
            <EmptyState
              icon="cart"
              title="Keranjang kosong"
              description="Tambahkan produk terlebih dahulu sebelum melanjutkan checkout."
              action={<Button href="/products" icon="arrow-right">Jelajahi Katalog</Button>}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
              <section className="surface-card rounded-3xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Review Keranjang</h2>
                  <Link href="/cart" className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]">Ubah keranjang</Link>
                </div>
                <div className="mt-5 divide-y divide-[var(--line)]">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                        <SafeImage src={product.image} alt={product.name} sizes="64px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">{product.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{quantity} x {formatRupiah(product.price)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{formatRupiah(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button icon="arrow-right" full onClick={() => setStep(2)}>Lanjut ke Alamat</Button>
                </div>
              </section>
              <aside className="surface-card h-fit rounded-3xl p-6">
                <h3 className="text-base font-semibold text-[var(--foreground)]">Ringkasan</h3>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-[var(--muted)]"><span>Subtotal ({itemCount} item)</span><span className="text-[var(--foreground)]">{formatRupiah(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-300"><span>Diskon {voucher ? discountLabel(voucher) : ""}</span><span>-{formatRupiah(discount)}</span></div>}
                  <div className="flex justify-between text-[var(--muted)]"><span>Ongkir</span><span className="text-[var(--foreground)]">{formatRupiah(SHIPPING_FEE)}</span></div>
                  <div className="flex items-end justify-between border-t border-[var(--line)] pt-4"><span className="text-sm text-[var(--foreground)]">Total</span><span className="text-xl font-semibold text-[var(--accent)]">{formatRupiah(total)}</span></div>
                </div>
              </aside>
            </div>
          )
        )}

        {step === 2 && (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <form
              className="surface-card rounded-3xl p-6"
              onSubmit={(event) => {
                event.preventDefault();
                goToPayment();
              }}
            >
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Alamat Pengiriman</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Pastikan data penerima benar agar pesanan sampai tepat.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Nama lengkap" hint={errors.name}>
                  <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} placeholder="Nama penerima" />
                </Field>
                <Field label="Nomor telepon" hint={errors.phone}>
                  <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClass} placeholder="08xxxxxxxxxx" inputMode="numeric" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Alamat lengkap" hint={errors.address}>
                    <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} className={`${inputClass} min-h-24 resize-none`} placeholder="Nama jalan, nomor rumah, patokan" />
                  </Field>
                </div>
                <Field label="Kota" hint={errors.city}>
                  <select value={form.city} onChange={(event) => updateField("city", event.target.value)} className={inputClass}>
                    <option value="">Pilih kota</option>
                    {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </Field>
                <Field label="Kode pos" hint={errors.postalCode}>
                  <input value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} className={inputClass} placeholder="12345" inputMode="numeric" />
                </Field>
              </div>
              <label className="mt-5 flex items-start gap-3 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                />
                <span>Simpan alamat ini untuk pengiriman berikutnya.</span>
              </label>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="outline" icon="arrow-left" onClick={() => setStep(1)}>Kembali</Button>
                <Button type="submit" icon="arrow-right">Lanjut ke Pembayaran</Button>
              </div>
            </form>

            <aside className="space-y-5">
              <section className="surface-card rounded-3xl p-6">
                <div className="flex items-center gap-2">
                  <Icon name="location" size={18} className="text-[var(--accent)]" />
                  <h3 className="text-base font-semibold text-[var(--foreground)]">Alamat Tersimpan</h3>
                </div>
                {addresses.length === 0 ? (
                  <p className="mt-4 text-xs text-[var(--muted)]">Belum ada alamat tersimpan. Centang opsi simpan alamat untuk menambahkannya.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => {
                          setOverrides({
                            name: address.name,
                            phone: address.phone,
                            address: address.address,
                            city: address.city,
                            postalCode: address.postalCode,
                          });
                          setPrimaryAddress(address.id);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition ${address.primary ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-[var(--line)] bg-white/[0.02] hover:border-[var(--accent)]/40"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-[var(--foreground)]">{address.label}</span>
                          {address.primary && <span className="text-[10px] text-[var(--accent)]">Utama</span>}
                        </div>
                        <p className="mt-2 text-xs text-[var(--foreground)]">{address.name}</p>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{address.address}, {address.city} {address.postalCode}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="surface-card rounded-3xl p-6">
                <h3 className="text-base font-semibold text-[var(--foreground)]">Dikirim ke</h3>
                <p className="mt-3 text-sm text-[var(--foreground)]">{form.name || "Nama penerima"}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{form.address || "Alamat belum diisi"}{form.city ? `, ${form.city} ${form.postalCode}` : ""}</p>
              </section>
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <section className="surface-card rounded-3xl p-6">
                <div className="flex items-center gap-2">
                  <Icon name="shield" size={18} className="text-[var(--accent)]" />
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Metode Pembayaran</h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const selected = paymentMethod === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : "border-[var(--line)] bg-white/[0.02] hover:border-[var(--accent)]/40"}`}
                      >
                        <Icon name={method.kind === "qris" ? "ticket" : method.kind === "va" ? "copy" : "refresh"} size={18} className={selected ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)]">{method.label}</p>
                          <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{method.description}</p>
                        </div>
                        {selected && <Icon name="check" size={16} className="shrink-0 text-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="surface-card rounded-3xl p-6">
                <div className="flex items-center gap-2">
                  <Icon name="ticket" size={18} className="text-[var(--accent)]" />
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Voucher Promo</h2>
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={voucherInput}
                    onChange={(event) => setDraftVoucher(event.target.value.toUpperCase())}
                    placeholder="Masukkan kode voucher"
                    className={inputClass}
                    aria-label="Kode voucher checkout"
                  />
                  <Button size="sm" onClick={() => applyVoucher(voucherInput)} disabled={!voucherInput.trim()}>Pakai</Button>
                </div>
                {voucher && !voucherError && !validation.error && <p className="mt-3 text-xs text-emerald-300">Voucher {voucher.code} aktif, hemat {formatRupiah(discount)}.</p>}
                {(voucherError || validation.error) && <p className="mt-3 text-xs text-rose-300">{voucherError || validation.error}</p>}
                <VoucherPromo onApply={applyVoucher} appliedCode={appliedCode} />
              </section>
            </div>

            <aside className="surface-card h-fit rounded-3xl p-6">
              <h3 className="text-base font-semibold text-[var(--foreground)]">Ringkasan Pesanan</h3>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-[var(--muted)]"><span>Subtotal ({itemCount} item)</span><span className="text-[var(--foreground)]">{formatRupiah(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-300"><span>Diskon {voucher ? discountLabel(voucher) : ""}</span><span>-{formatRupiah(discount)}</span></div>}
                <div className="flex justify-between text-[var(--muted)]"><span>Ongkir</span><span className="text-[var(--foreground)]">{formatRupiah(SHIPPING_FEE)}</span></div>
                <div className="flex items-end justify-between border-t border-[var(--line)] pt-4"><span className="text-sm text-[var(--foreground)]">Total bayar</span><span className="text-2xl font-semibold text-[var(--accent)]">{formatRupiah(total)}</span></div>
              </div>
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white/[0.02] p-4 text-xs text-[var(--muted)]">
                <p className="text-[var(--foreground)]">{form.name}</p>
                <p className="mt-1">{form.address}, {form.city} {form.postalCode}</p>
                <p className="mt-1">{form.phone}</p>
              </div>
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[var(--muted)]">
                <Icon name="info" size={14} className="mt-0.5 shrink-0" />
                Mode demo: tidak ada pembayaran atau pengiriman nyata. Nomor resi dibuat setelah pembayaran dikonfirmasi.
              </p>
              <div className="mt-6">
                <Button icon="check" full onClick={submitOrder} disabled={submitting || cartItems.length === 0}>
                  {submitting ? "Memproses pesanan..." : "Buat Pesanan"}
                </Button>
              </div>
              <div className="mt-3 text-center">
                <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => setStep(2)}>Ubah Alamat</Button>
              </div>
            </aside>
          </div>
        )}

        {step === 4 && placedOrder && (
          <section className="surface-card mx-auto max-w-2xl rounded-3xl p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]">
              <Icon name="check" size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[var(--foreground)]">Pesanan berhasil dibuat</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">Nomor pesanan kamu: <span className="font-semibold text-[var(--foreground)]">{placedOrder.number}</span></p>
            <p className="mt-2 text-sm text-[var(--muted)]">Selesaikan pembayaran untuk melanjutkan proses pesanan.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href={`/orders/${placedOrder.id}`} icon="arrow-right">Lihat Detail Pesanan</Button>
              <Button href={`/lacak?no=${encodeURIComponent(placedOrder.number)}`} variant="outline" icon="truck">Lacak Pesanan</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
