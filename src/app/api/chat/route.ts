import { filterProducts, statusLabel } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { categories, products, sellers, services, vouchers } from "@/lib/mock-data";
import type { Product, ProductFilters, Seller, Service, SortOption } from "@/lib/types";

type ChatCard = {
  type: "product" | "seller" | "service";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
};

type ChatReply = {
  reply: string;
  cards?: ChatCard[];
};

type ChatOrder = {
  id: string;
  number: string;
  status: string;
  total: number;
  resi?: string;
  items: string[];
};

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const attempts = new Map<string, number[]>();

function clientKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
  const agent = request.headers.get("user-agent")?.slice(0, 80) ?? "";
  return `${ip}|${agent}`;
}

function rateLimited(key: string) {
  const now = Date.now();
  if (attempts.size > 1000) {
    for (const [entry, times] of attempts) {
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) attempts.delete(entry);
    }
  }
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

const stopWords = new Set([
  "ada", "aja", "aku", "bantu", "barang", "bisa", "cari", "carikan", "dari", "dengan", "di", "dong",
  "gimana", "hai", "halo", "help", "ingin", "ini", "itu", "kamu", "kategori", "mau", "min", "olahraga",
  "paling", "pilih", "pilihan", "produk", "rekomendasi", "rekomendasikan", "saya", "sesuai", "sport",
  "terbaik", "terlaris", "termahal", "termurah", "murah", "hemat", "budget", "premium", "rating", "bagus", "tolong", "untuk", "yang",
]);

function keywords(message: string) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function parseAmount(value: string, unit?: string) {
  const numeric = Number(value.replace(/[.,]/g, ""));
  if (!Number.isFinite(numeric)) return undefined;
  if (/^(juta|jt)$/i.test(unit ?? "")) return numeric * 1_000_000;
  if (/^(ribu|rb|k)$/i.test(unit ?? "")) return numeric * 1_000;
  return numeric;
}

function parseBudget(message: string): { text: string; minPrice?: number; maxPrice?: number } {
  let text = message;
  const amount = "(\\d[\\d.,]*)\\s*(ribu|rb|k|juta|jt)?";
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  const under = new RegExp(`(?:di\\s*bawah|dibawah|kurang\\s*dari|maks(?:imal)?|below|under)\\s*${amount}`, "i");
  const underMatch = text.match(under);
  if (underMatch) {
    maxPrice = parseAmount(underMatch[1], underMatch[2]);
    text = text.replace(underMatch[0], " ");
  }

  const over = new RegExp(`(?:di\\s*atas|diatas|lebih\\s*dari|min(?:imal)?|above|over)\\s*${amount}`, "i");
  const overMatch = text.match(over);
  if (overMatch) {
    minPrice = parseAmount(overMatch[1], overMatch[2]);
    text = text.replace(overMatch[0], " ");
  }

  const belowSuffix = new RegExp(`${amount}\\s*(?:ke\\s*bawah|kebawah)`, "i");
  const belowMatch = text.match(belowSuffix);
  if (belowMatch) {
    maxPrice = parseAmount(belowMatch[1], belowMatch[2]);
    text = text.replace(belowMatch[0], " ");
  }

  const aboveSuffix = new RegExp(`${amount}\\s*(?:ke\\s*atas|keatas)`, "i");
  const aboveMatch = text.match(aboveSuffix);
  if (aboveMatch) {
    minPrice = parseAmount(aboveMatch[1], aboveMatch[2]);
    text = text.replace(aboveMatch[0], " ");
  }

  return { text, minPrice, maxPrice };
}

function isChatOrder(value: unknown): value is ChatOrder {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.number === "string" &&
    typeof order.status === "string" &&
    typeof order.total === "number" &&
    (order.resi === undefined || typeof order.resi === "string") &&
    Array.isArray(order.items) &&
    order.items.every((item) => typeof item === "string")
  );
}

function productCards(list: Product[]): ChatCard[] {
  return list.slice(0, 5).map((product) => ({
    type: "product",
    id: product.id,
    title: product.name,
    subtitle: formatRupiah(product.price),
    href: `/products/${product.slug}`,
    image: product.image,
  }));
}

function sellerCards(list: Seller[]): ChatCard[] {
  return list.slice(0, 5).map((seller) => ({
    type: "seller",
    id: seller.id,
    title: seller.name,
    subtitle: `${seller.city} · Rating ${seller.rating.toFixed(1)} (${seller.reviewCount} ulasan)`,
    href: `/sellers/${seller.slug}`,
  }));
}

function serviceCards(list: Service[]): ChatCard[] {
  return list.slice(0, 5).map((service) => ({
    type: "service",
    id: service.id,
    title: service.name,
    subtitle: `${formatRupiah(service.price)} · ${service.duration}`,
    href: `/services/${service.slug}`,
  }));
}

function productReply(message: string): ChatReply {
  const lower = message.toLowerCase();
  const budget = parseBudget(message);
  const category = categories.find((item) =>
    lower.includes(item.name.toLowerCase())
    || lower.includes(item.slug)
    || lower.includes(item.slug.replace(/-/g, " ")),
  );
  const excluded = new Set<string>(
    category ? [category.slug, ...category.slug.split("-")] : [],
  );
  const tokens = keywords(budget.text).filter((word) => !excluded.has(word));
  const sort: SortOption = /murah|hemat|budget/.test(lower)
    ? "harga-terendah"
    : /termahal|premium/.test(lower)
      ? "harga-tertinggi"
      : /terlaris/.test(lower)
        ? "terlaris"
        : /rating/.test(lower)
          ? "rating"
          : "relevan";
  const filters: ProductFilters = { sort };
  if (category) filters.category = category.slug;
  if (tokens.length > 0) filters.q = tokens.join(" ");
  if (budget.minPrice !== undefined) filters.minPrice = budget.minPrice;
  if (budget.maxPrice !== undefined) filters.maxPrice = budget.maxPrice;

  const rangeLabel = budget.minPrice !== undefined && budget.maxPrice !== undefined
    ? `${formatRupiah(budget.minPrice)} - ${formatRupiah(budget.maxPrice)}`
    : budget.maxPrice !== undefined
      ? `di bawah ${formatRupiah(budget.maxPrice)}`
      : budget.minPrice !== undefined
        ? `di atas ${formatRupiah(budget.minPrice)}`
        : "";
  const found = filterProducts(products, filters).slice(0, 5);
  if (found.length === 0) {
    return {
      reply: `Maaf, saya belum menemukan produk${rangeLabel ? ` ${rangeLabel}` : ""} yang cocok di katalog CGI Sports. Coba sebutkan jenis olahraga atau kata kunci lain. Kamu juga bisa melihat semua produk di /products.`,
    };
  }
  const lines = found
    .map((product, index) => `${index + 1}. ${product.name} — ${formatRupiah(product.price)}, rating ${product.rating.toFixed(1)}`)
    .join("\n");
  return {
    reply: `Berikut produk CGI Sports${rangeLabel ? ` ${rangeLabel}` : ""} yang cocok:\n${lines}\n\nBuka detail produk untuk melihat stok dan deskripsi lengkap.`,
    cards: productCards(found),
  };
}

function sellerReply(message: string): ChatReply {
  const tokens = keywords(message);
  const matched = tokens.length > 0
    ? sellers.filter((seller) => {
      const haystack = `${seller.name} ${seller.city} ${seller.description}`.toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    })
    : [];
  const list = matched.length > 0 ? matched : sellers;
  const lines = list
    .map((seller) => `- ${seller.name} di ${seller.city}, rating ${seller.rating.toFixed(1)} (${seller.reviewCount} ulasan)`)
    .join("\n");
  return {
    reply: matched.length > 0
      ? `Toko yang sesuai dengan permintaanmu:\n${lines}`
      : `Berikut toko yang berjualan di CGI Sports:\n${lines}`,
    cards: sellerCards(list),
  };
}

function serviceReply(message: string): ChatReply {
  const tokens = keywords(message);
  const matched = tokens.length > 0
    ? services.filter((service) => {
      const haystack = `${service.name} ${service.description} ${service.requirements.join(" ")}`.toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    })
    : [];
  const list = matched.length > 0 ? matched : services;
  const lines = list
    .map((service) => `- ${service.name}: ${formatRupiah(service.price)}, ${service.duration}`)
    .join("\n");
  return {
    reply: matched.length > 0
      ? `Layanan yang sesuai dengan permintaanmu:\n${lines}`
      : `Berikut layanan yang tersedia di CGI Sports:\n${lines}`,
    cards: serviceCards(list),
  };
}

function voucherReply(): ChatReply {
  const lines = vouchers.map((voucher) => `- ${voucher.code} (${voucher.label}): ${voucher.description}`).join("\n");
  const promo = filterProducts(products, { sort: "harga-terendah" }).filter((product) => product.isPromo).slice(0, 4);
  return {
    reply: `Voucher yang tersedia saat ini:\n${lines}\n\nProduk dengan promo juga bisa kamu lihat di bawah ini.`,
    cards: productCards(promo),
  };
}

function checkoutReply(): ChatReply {
  return {
    reply: `Untuk checkout, tambahkan produk ke keranjang, isi alamat pengiriman, lalu pilih metode pembayaran yang tersedia. Status pesanan dan nomor resi bisa kamu cek di halaman Pesanan. Kode voucher yang tersedia: ${vouchers.map((voucher) => voucher.code).join(", ")}.`,
  };
}

function orderReply(message: string, orders: ChatOrder[]): ChatReply {
  const lower = message.toLowerCase();
  const matched = orders.filter((order) =>
    lower.includes(order.number.toLowerCase())
    || (order.resi ? lower.includes(order.resi.toLowerCase()) : false),
  );
  const list = (matched.length > 0 ? matched : orders).slice(0, 3);
  if (list.length === 0) {
    return {
      reply: "Belum ada pesanan di browser ini. Buka /lacak dan masukkan nomor pesanan atau resi untuk melihat statusnya. Kamu juga bisa melihat pesanan di halaman Pesanan.",
    };
  }
  const lines = list.map((order) => {
    const items = order.items.length > 0 ? ` (${order.items.join(", ")})` : "";
    return `- ${order.number}: ${statusLabel(order.status)}, ${formatRupiah(order.total)}${items}, resi ${order.resi ?? "-"}`;
  }).join("\n");
  return {
    reply: `${matched.length > 0 ? "Berikut status pesanan yang kamu sebutkan:" : "Berikut pesanan terakhir di browser ini:"}\n${lines}\n\nBuka kartu pesanan di bawah untuk melihat detail dan pelacakan lengkap.`,
    cards: list.map((order) => ({
      type: "product" as const,
      id: order.id,
      title: order.number,
      subtitle: `${statusLabel(order.status)} · ${formatRupiah(order.total)}`,
      href: `/orders/${order.id}`,
    })),
  };
}

function helpReply(): ChatReply {
  return {
    reply: "Halo, saya asisten CGI Sports. Saya bisa membantu mencari produk, merekomendasikan perlengkapan olahraga, menjelaskan layanan, mengenalkan penjual, dan menginformasikan voucher. Silakan ceritakan kebutuhanmu.",
  };
}

function generateReply(message: string, orders: ChatOrder[]): ChatReply {
  const lower = message.toLowerCase();
  const trimmed = lower.trim();
  const hasKeywords = keywords(message).length > 0;

  if ((/^(halo|hai|hi|selamat|assalam|help|bantuan)\b/.test(trimmed) && !hasKeywords)
    || /^(bisa apa|apa yang bisa|apa bisa)\b/.test(trimmed)) {
    return helpReply();
  }
  if (/voucher|promo|diskon|potongan|kode promo/.test(lower)) return voucherReply();
  if (/lacak|resi|status pesanan|pesanan saya|pesanan aku|nomor pesanan|order saya|order aku/.test(lower)) return orderReply(message, orders);
  if (/checkout|pembayaran|bayar|ongkir|pengiriman|ekspedisi|keranjang|cara beli|cara pesan/.test(lower)) return checkoutReply();
  if (/layanan|service|servis|stringing|trainer|booking|lapangan|waterproof|perbaikan sol|bersih sepatu/.test(lower)) return serviceReply(message);
  if (/toko|seller|penjual|merchant|grosir/.test(lower)) return sellerReply(message);
  return productReply(message);
}

export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 32_000) {
    return Response.json({ reply: "Permintaan terlalu besar." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const body = typeof payload === "object" && payload !== null ? payload as { message?: unknown; orders?: unknown } : {};
  const rawMessage = body.message;
  const orders = Array.isArray(body.orders) ? body.orders.filter(isChatOrder).slice(0, 20) : [];

  if (typeof rawMessage !== "string" || rawMessage.trim().length === 0) {
    return Response.json({ reply: "Pesan masih kosong. Tulis pertanyaanmu agar saya bisa membantu." }, { status: 400 });
  }
  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ reply: `Pesan terlalu panjang. Maksimal ${MAX_MESSAGE_LENGTH} karakter.` }, { status: 413 });
  }
  if (rateLimited(clientKey(request))) {
    return Response.json(
      { reply: "Terlalu banyak pertanyaan. Tunggu sebentar sebelum mencoba lagi." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return Response.json(generateReply(rawMessage.trim(), orders));
}
