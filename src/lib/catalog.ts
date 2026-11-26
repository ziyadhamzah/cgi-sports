import { categories, getCategoryName, products, vouchers } from "./mock-data";
import type { AnalyticsEvent, CartItem, Product, ProductFilters, SortOption, Voucher } from "./types";

export function filterProducts(list: Product[], filters: ProductFilters): Product[] {
  const q = (filters.q ?? "").toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  let result = list.filter((product) => {
    if (filters.category && product.categorySlug !== filters.category) return false;
    if (filters.seller && product.sellerId !== filters.seller) return false;
    if (filters.city && product.city !== filters.city) return false;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.rating !== undefined && product.rating < filters.rating) return false;
    if (tokens.length === 0) return true;
    const haystack = `${product.name} ${product.description} ${product.tags.join(" ")} ${getCategoryName(product.categorySlug)} ${product.sellerName}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });

  const sort: SortOption = filters.sort ?? "relevan";
  result = [...result].sort((a, b) => {
    switch (sort) {
      case "harga-terendah": return a.price - b.price;
      case "harga-tertinggi": return b.price - a.price;
      case "terbaru": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "terlaris": return b.sold - a.sold;
      case "rating": return b.rating - a.rating || b.reviewCount - a.reviewCount;
      default: {
        const scoreA = q ? relevanceScore(a, tokens) : 0;
        const scoreB = q ? relevanceScore(b, tokens) : 0;
        return scoreB - scoreA || b.sold - a.sold;
      }
    }
  });

  return result;
}

function relevanceScore(product: Product, tokens: string[]) {
  const name = product.name.toLowerCase();
  const tags = product.tags.join(" ").toLowerCase();
  const desc = product.description.toLowerCase();
  return tokens.reduce((score, token) => {
    if (name.includes(token)) score += 3;
    if (tags.includes(token)) score += 2;
    if (desc.includes(token)) score += 1;
    return score;
  }, 0);
}

export function getRelatedProducts(product: Product, list: Product[] = products, limit = 4) {
  return list
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function cartSubtotal(items: CartItem[], resolve: (id: string) => Product | undefined) {
  return items.reduce((total, item) => {
    const product = resolve(item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

export function findVoucher(code: string) {
  return vouchers.find((v) => v.code === code.trim().toUpperCase());
}

export function validateVoucher(code: string, subtotal: number, items: CartItem[], resolve: (id: string) => Product | undefined): { voucher?: Voucher; error?: string } {
  const voucher = findVoucher(code);
  if (!voucher) return { error: "Kode voucher tidak ditemukan." };
  const eligibleSubtotal = voucher.categorySlug
    ? items.reduce((sum, item) => {
        const product = resolve(item.productId);
        return product && product.categorySlug === voucher.categorySlug ? sum + product.price * item.quantity : sum;
      }, 0)
    : subtotal;
  if (voucher.categorySlug && eligibleSubtotal === 0) {
    return { error: `Voucher hanya berlaku untuk kategori ${getCategoryName(voucher.categorySlug)}.` };
  }
  if (eligibleSubtotal < voucher.minSpend) {
    return { error: `Minimal belanja kategori ini ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(voucher.minSpend)}.` };
  }
  return { voucher };
}

export function computeDiscount(voucher: Voucher | undefined, subtotal: number, items: CartItem[], resolve: (id: string) => Product | undefined) {
  if (!voucher) return 0;
  if (voucher.categorySlug) {
    const eligible = items.reduce((sum, item) => {
      const product = resolve(item.productId);
      return product && product.categorySlug === voucher.categorySlug ? sum + product.price * item.quantity : sum;
    }, 0);
    const raw = voucher.type === "percent" ? (eligible * voucher.value) / 100 : voucher.value;
    return Math.min(Math.round(raw), voucher.maxDiscount ?? eligible, subtotal);
  }
  const raw = voucher.type === "percent" ? (subtotal * voucher.value) / 100 : voucher.value;
  return Math.min(Math.round(raw), voucher.maxDiscount ?? subtotal, subtotal);
}

export function discountLabel(voucher?: Voucher) {
  if (!voucher) return "";
  return voucher.type === "percent" ? `${voucher.value}%` : `${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(voucher.value)}`;
}

export function summaryRating(reviews: { rating: number }[], fallbackRating: number, fallbackCount: number) {
  if (reviews.length === 0) return { avg: fallbackRating, total: fallbackCount };
  const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, total: reviews.length };
}

export function summarizeAnalytics(events: AnalyticsEvent[]) {
  const revenueTypes = new Set(["payment_confirmed"]);
  const orderTypes = new Set(["order_created", "payment_confirmed", "order_completed", "order_cancelled"]);
  const unique = new Map<string, AnalyticsEvent>();
  for (const event of events) {
    const key = orderTypes.has(event.type) && event.orderRef ? `${event.orderRef}:${event.type}` : event.id;
    if (!unique.has(key)) unique.set(key, event);
  }
  const list = [...unique.values()];
  const count = (type: string) => list.filter((e) => e.type === type).length;
  const revenue = list.filter((e) => revenueTypes.has(e.type)).reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const visitors = new Set(list.map((e) => e.visitorId)).size;
  const sessions = new Set(list.map((e) => `${e.visitorId}:${e.at.slice(0, 10)}`)).size;
  return {
    visitors,
    sessions,
    pageViews: count("page_view"),
    productViews: count("product_view"),
    productClicks: count("product_click"),
    addToCart: count("add_to_cart"),
    beginCheckout: count("begin_checkout"),
    ordersCreated: count("order_created"),
    paymentsConfirmed: count("payment_confirmed"),
    ordersCompleted: count("order_completed"),
    ordersCancelled: count("order_cancelled"),
    revenue,
    totalEvents: list.length,
  };
}

export function trackingStages(status: string) {
  const stages = [
    { key: "dibuat", label: "Pesanan dibuat" },
    { key: "dibayar", label: "Pembayaran dikonfirmasi" },
    { key: "dikirim", label: "Dalam pengiriman" },
    { key: "selesai", label: "Selesai" },
  ];
  if (status === "dibatalkan") return { stages, index: -1 };
  const map: Record<string, number> = {
    menunggu_pembayaran: 0,
    diproses: 1,
    dikirim: 2,
    selesai: 3,
  };
  return { stages, index: map[status] ?? 0 };
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    menunggu_pembayaran: "Menunggu Pembayaran",
    diproses: "Diproses",
    dikirim: "Dikirim",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  return labels[status] ?? status;
}

export function categoryOptions() {
  return [{ id: "all", name: "Semua", slug: "" }, ...categories];
}
