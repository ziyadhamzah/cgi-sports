import { formatRupiah } from "./format";
import type { SellerChatContext } from "./types";

export function sellerChatKey(context: SellerChatContext) {
  return [context.sellerId, context.product?.id ?? "umum", context.orderNumber ?? ""].join(":");
}

export function openSellerChat(context: SellerChatContext) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cgi:open-seller-chat", { detail: context }));
}

export function sellerChatGreeting(context: SellerChatContext) {
  if (context.orderNumber) {
    return `Halo, saya ${context.sellerName}. Ada yang bisa dibantu terkait pesanan ${context.orderNumber}?`;
  }
  if (context.product) {
    return `Halo, saya ${context.sellerName}. Tertarik dengan ${context.product.name}? Silakan tanya stok, ukuran, atau pengiriman.`;
  }
  return `Halo, saya ${context.sellerName}. Ada yang bisa saya bantu hari ini?`;
}

export function sellerChatReply(context: SellerChatContext, text: string) {
  const query = text.toLowerCase();
  const product = context.product;

  if (/stok|ready|tersedia|habis/.test(query)) {
    return product
      ? `Stok ${product.name} saat ini tersedia dan siap dikirim dari ${context.sellerName}.`
      : `Produk di toko ${context.sellerName} umumnya tersedia. Sebutkan nama produk agar saya cek lebih spesifik.`;
  }
  if (/harga|diskon|promo|murah|potong/.test(query)) {
    return product
      ? `${product.name} saat ini ${formatRupiah(product.price)}. Cek halaman Promo untuk voucher yang bisa dipakai.`
      : `Harga produk bisa dilihat di etalase toko kami, dan voucher aktif ada di halaman Promo.`;
  }
  if (/kirim|ongkir|pengiriman|sampai|lama|ekspedisi/.test(query)) {
    return context.orderNumber
      ? `Pesanan ${context.orderNumber} diproses sesuai status di halaman Lacak. Estimasi tiba tertera di sana.`
      : `Kami kirim setiap hari kerja. Ongkir dihitung saat checkout berdasarkan kota tujuan.`;
  }
  if (/ukuran|size|varian|warna|model/.test(query)) {
    return `Silakan sebutkan ukuran atau varian yang kamu inginkan${product ? ` untuk ${product.name}` : ""}, nanti saya konfirmasi ketersediaannya.`;
  }
  if (/garansi|original|resmi|asli/.test(query)) {
    return `Semua produk di ${context.sellerName} berasal dari sumber resmi dan disertai garansi sesuai ketentuan produk.`;
  }
  if (/terima kasih|makasih|thanks/.test(query)) {
    return `Sama-sama. Senang bisa membantu. Jika ada pertanyaan lain, langsung tulis di sini ya.`;
  }
  return `Terima kasih sudah menghubungi ${context.sellerName}. Saya bantu jawab ya${product ? ` terkait ${product.name}` : ""}.`;
}
