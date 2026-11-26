import type {
  Category,
  NotificationItem,
  Order,
  Product,
  Seller,
  Service,
  Voucher,
} from "./types";
import { discountPercent, slugify } from "./format";

export const categories: Category[] = [
  { id: "c-fitness", name: "Fitness", slug: "fitness", icon: "dumbbell", description: "Alat latihan kekuatan dan home gym." },
  { id: "c-lari", name: "Lari", slug: "lari", icon: "activity", description: "Sepatu, apparel, dan aksesoris lari." },
  { id: "c-badminton", name: "Badminton", slug: "badminton", icon: "zap", description: "Raket, kok, dan perlengkapan lapangan." },
  { id: "c-sepak-bola", name: "Sepak Bola", slug: "sepak-bola", icon: "circle", description: "Bola, sepatu, dan perlengkapan tim." },
  { id: "c-basket", name: "Basket", slug: "basket", icon: "target", description: "Bola, ring, dan perlengkapan basket." },
  { id: "c-outdoor", name: "Outdoor", slug: "outdoor", icon: "mountain", description: "Camping, hiking, dan olahraga luar ruang." },
];

export const sellers: Seller[] = [
  {
    id: "s1",
    name: "CGI Official Store",
    slug: "cgi-official-store",
    description: "Perlengkapan olahraga pilihan dengan garansi resmi dan pengiriman cepat.",
    city: "Jakarta Pusat",
    address: "Jl. Olahraga No. 12, Jakarta Pusat",
    phone: "021-5550-1001",
    rating: 4.9,
    reviewCount: 1240,
    verified: true,
    isOfficial: true,
    joinedYear: 2021,
    banner: "/images/sellers/cgi-official-store.jpg",
  },
  {
    id: "s2",
    name: "SportLine Indonesia",
    slug: "sportline-indonesia",
    description: "Spesialis sepatu lari dan apparel performa untuk semua level.",
    city: "Bandung",
    address: "Jl. Dago No. 88, Bandung",
    phone: "022-5550-2022",
    rating: 4.8,
    reviewCount: 876,
    verified: true,
    isOfficial: false,
    joinedYear: 2022,
    banner: "/images/sellers/sportline-indonesia.jpg",
  },
  {
    id: "s3",
    name: "Raket & Rekan",
    slug: "raket-dan-rekan",
    description: "Raket, kok, dan service stringing dengan teknisi berpengalaman.",
    city: "Surabaya",
    address: "Jl. Tunjungan No. 45, Surabaya",
    phone: "031-5550-3033",
    rating: 4.7,
    reviewCount: 512,
    verified: true,
    isOfficial: false,
    joinedYear: 2023,
    banner: "/images/sellers/raket-dan-rekan.jpg",
  },
  {
    id: "s4",
    name: "Home Gym Corner",
    slug: "home-gym-corner",
    description: "Peralatan fitness rumahan lengkap, dari dumbbell hingga resistance band.",
    city: "Semarang",
    address: "Jl. Pandanaran No. 21, Semarang",
    phone: "024-5550-4044",
    rating: 4.6,
    reviewCount: 394,
    verified: false,
    isOfficial: false,
    joinedYear: 2023,
    banner: "/images/sellers/home-gym-corner.jpg",
  },
  {
    id: "s5",
    name: "Tim Jaya Store",
    slug: "tim-jaya-store",
    description: "Bola dan perlengkapan tim untuk sepak bola maupun basket.",
    city: "Medan",
    address: "Jl. Braga No. 7, Medan",
    phone: "061-5550-5055",
    rating: 4.5,
    reviewCount: 268,
    verified: false,
    isOfficial: false,
    joinedYear: 2024,
    banner: "/images/sellers/tim-jaya-store.jpg",
  },
  {
    id: "s6",
    name: "Trail & Camp",
    slug: "trail-and-camp",
    description: "Gear outdoor untuk hiking, camping, dan petualangan akhir pekan.",
    city: "Malang",
    address: "Jl. Bromo No. 33, Malang",
    phone: "0341-5550-6066",
    rating: 4.8,
    reviewCount: 431,
    verified: true,
    isOfficial: false,
    joinedYear: 2022,
    banner: "/images/sellers/trail-and-camp.jpg",
  },
];

type ProductSeed = {
  name: string;
  categorySlug: string;
  sellerId: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageId: string;
  description: string;
  tags: string[];
  stock: number;
  sold: number;
  isNew?: boolean;
  city?: string;
  weight?: number;
};

const photo = (id: string) => `/images/products/${id}.jpg`;

const productSeeds: ProductSeed[] = [
  { name: "Dumbbell Adjustable 20kg", categorySlug: "fitness", sellerId: "s4", price: 899000, originalPrice: 1099000, rating: 4.8, imageId: "dumbbell-adjustable-20kg", description: "Dumbbell adjustable praktis untuk latihan kekuatan di rumah. Cocok untuk pemula hingga menengah.", tags: ["home gym", "strength", "pemula", "dumbbell"], stock: 18, sold: 124, weight: 20000 },
  { name: "Matras Yoga Anti Slip", categorySlug: "fitness", sellerId: "s4", price: 249000, rating: 4.7, imageId: "matras-yoga-anti-slip", description: "Matras yoga tebal dan anti slip untuk yoga, pilates, dan stretching.", tags: ["yoga", "stretching", "pemula", "matras"], stock: 42, sold: 310, weight: 1500 },
  { name: "Resistance Band Set 5 Level", categorySlug: "fitness", sellerId: "s4", price: 159000, originalPrice: 199000, rating: 4.6, imageId: "resistance-band-set-5-level", description: "Set resistance band 5 level untuk pemanasan, rehab, dan latihan full body.", tags: ["fitness", "pemula", "home gym", "stretching"], stock: 60, sold: 205, weight: 600 },
  { name: "Barbell Set 30kg Home Gym", categorySlug: "fitness", sellerId: "s1", price: 1450000, rating: 4.7, imageId: "barbell-set-30kg-home-gym", description: "Set barbell lengkap dengan piringan beban untuk latihan angkat beban di rumah.", tags: ["strength", "home gym", "barbell"], stock: 9, sold: 67, weight: 30000 },
  { name: "Kettlebell Cast Iron 12kg", categorySlug: "fitness", sellerId: "s1", price: 449000, rating: 4.5, imageId: "kettlebell-cast-iron-12kg", description: "Kettlebell besi cor dengan pegangan nyaman untuk latihan fungsional.", tags: ["strength", "kettlebell", "home gym"], stock: 15, sold: 88, weight: 12000 },
  { name: "Sepatu Lari Lightweight", categorySlug: "lari", sellerId: "s2", price: 759000, originalPrice: 899000, rating: 4.6, imageId: "sepatu-lari-lightweight", description: "Sepatu lari ringan dengan bantalan nyaman untuk jogging harian dan latihan kardio.", tags: ["lari", "jogging", "sepatu", "kardio"], stock: 24, sold: 412, weight: 900 },
  { name: "Sepatu Trail Grip Pro", categorySlug: "lari", sellerId: "s2", price: 999000, rating: 4.7, imageId: "sepatu-trail-grip-pro", description: "Sepatu trail dengan outsole agresif untuk medan berbatu dan licin.", tags: ["lari", "trail", "sepatu", "outdoor"], stock: 12, sold: 96, isNew: true, weight: 1000 },
  { name: "Jam Tangan GPS Running", categorySlug: "lari", sellerId: "s1", price: 1899000, rating: 4.8, imageId: "jam-tangan-gps-running", description: "Jam GPS untuk memantau pace, jarak, dan detak jantung selama latihan.", tags: ["lari", "gps", "kardio", "aksesoris"], stock: 7, sold: 54, weight: 200 },
  { name: "Botol Minum Sport 750ml", categorySlug: "lari", sellerId: "s6", price: 99000, rating: 4.4, imageId: "botol-minum-sport-750ml", description: "Botol minum ringan dengan tutup sedotan, pas untuk jogging dan hiking.", tags: ["hidrasi", "lari", "outdoor", "aksesoris"], stock: 80, sold: 520, weight: 150 },
  { name: "Raket Badminton Carbon Pro", categorySlug: "badminton", sellerId: "s3", price: 549000, originalPrice: 649000, rating: 4.7, imageId: "raket-badminton-carbon-pro", description: "Raket karbon ringan untuk smash cepat dan kontrol presisi di lapangan.", tags: ["badminton", "raket", "smash", "indoor"], stock: 16, sold: 189, weight: 400 },
  { name: "Raket Badminton Pemula", categorySlug: "badminton", sellerId: "s3", price: 279000, rating: 4.4, imageId: "raket-badminton-pemula", description: "Raket entry-level yang seimbang dan nyaman untuk pemula.", tags: ["badminton", "raket", "pemula"], stock: 30, sold: 221, weight: 380 },
  { name: "Kok Bulu Tangkis Premier 12pcs", categorySlug: "badminton", sellerId: "s3", price: 189000, rating: 4.6, imageId: "kok-bulu-tangkis-premier-12pcs", description: "Paket 12 kok bulu tangkis dengan kualitas konsisten untuk latihan.", tags: ["badminton", "kok", "latihan"], stock: 45, sold: 340, weight: 500 },
  { name: "Sepatu Badminton Anti Slip", categorySlug: "badminton", sellerId: "s2", price: 429000, rating: 4.5, imageId: "sepatu-badminton-anti-slip", description: "Sepatu badminton dengan sol anti slip dan bantalan ringan.", tags: ["badminton", "sepatu", "indoor"], stock: 21, sold: 143, weight: 800 },
  { name: "Bola Sepak Match Grade", categorySlug: "sepak-bola", sellerId: "s5", price: 329000, rating: 4.5, imageId: "bola-sepak-match-grade", description: "Bola sepak kualitas match dengan jahitan kuat dan kontrol bola stabil.", tags: ["sepak bola", "bola", "team", "outdoor"], stock: 28, sold: 267, weight: 450 },
  { name: "Sepatu Futsal Indoor", categorySlug: "sepak-bola", sellerId: "s5", price: 389000, originalPrice: 459000, rating: 4.6, imageId: "sepatu-futsal-indoor", description: "Sepatu futsal dengan sol karet untuk cengkeraman maksimal di lapangan indoor.", tags: ["futsal", "sepatu", "indoor", "sepak bola"], stock: 19, sold: 176, weight: 850 },
  { name: "Kaus Tim Sepak Bola", categorySlug: "sepak-bola", sellerId: "s5", price: 149000, rating: 4.3, imageId: "kaus-tim-sepak-bola", description: "Kaus tim breathable dengan bahan cepat kering untuk latihan dan pertandingan.", tags: ["sepak bola", "jersey", "team", "apparel"], stock: 50, sold: 198, weight: 200 },
  { name: "Bola Basket Outdoor Grip", categorySlug: "basket", sellerId: "s5", price: 289000, rating: 4.4, imageId: "bola-basket-outdoor-grip", description: "Bola basket dengan grip kuat, cocok untuk permainan indoor maupun outdoor.", tags: ["basket", "bola", "outdoor", "team"], stock: 26, sold: 154, weight: 600 },
  { name: "Ring Basket Portable", categorySlug: "basket", sellerId: "s1", price: 1299000, rating: 4.6, imageId: "ring-basket-portable", description: "Ring basket portabel dengan papan acrylic dan roda untuk mudah dipindahkan.", tags: ["basket", "ring", "home"], stock: 8, sold: 45, isNew: true, weight: 15000 },
  { name: "Sepatu Basket Cushion", categorySlug: "basket", sellerId: "s2", price: 679000, rating: 4.5, imageId: "sepatu-basket-cushion", description: "Sepatu basket dengan bantalan empuk dan traksi tinggi untuk lompatan.", tags: ["basket", "sepatu", "indoor"], stock: 17, sold: 112, weight: 950 },
  { name: "Tenda Camping 2 Orang", categorySlug: "outdoor", sellerId: "s6", price: 749000, originalPrice: 899000, rating: 4.7, imageId: "tenda-camping-2-orang", description: "Tenda dua orang anti air dengan pemasangan cepat untuk camping.", tags: ["camping", "outdoor", "tenda"], stock: 14, sold: 98, weight: 2500 },
  { name: "Ransel Hiking 40L", categorySlug: "outdoor", sellerId: "s6", price: 599000, rating: 4.8, imageId: "ransel-hiking-40l", description: "Ransel hiking 40 liter dengan kompartemen laptop dan penyangga punggung.", tags: ["hiking", "outdoor", "ransel"], stock: 11, sold: 76, weight: 1300 },
  { name: "Jersey Training Breathable", categorySlug: "outdoor", sellerId: "s6", price: 199000, rating: 4.5, imageId: "jersey-training-breathable", description: "Jersey training bahan breathable yang cepat kering untuk berbagai aktivitas.", tags: ["apparel", "training", "outdoor", "nyaman"], stock: 65, sold: 410, weight: 180 },
  { name: "Headlamp LED Rechargeable", categorySlug: "outdoor", sellerId: "s6", price: 179000, rating: 4.4, imageId: "headlamp-led-rechargeable", description: "Headlamp LED dengan tiga mode cahaya dan baterai isi ulang.", tags: ["hiking", "camping", "aksesoris", "outdoor"], stock: 38, sold: 132, isNew: true, weight: 120 },
  { name: "Yoga Block Foam Set", categorySlug: "fitness", sellerId: "s4", price: 119000, rating: 4.5, imageId: "yoga-block-foam-set", description: "Sepasang balok yoga ringan untuk membantu posisi dan keseimbangan.", tags: ["yoga", "stretching", "pemula"], stock: 55, sold: 167, weight: 700 },
];

export const products: Product[] = productSeeds.map((seed, index) => {
  const category = categories.find((c) => c.slug === seed.categorySlug)!;
  const seller = sellers.find((s) => s.id === seed.sellerId)!;
  const slug = slugify(seed.name);
  const image = photo(seed.imageId);
  const isBestseller = seed.sold >= 300;
  return {
    id: `p${index + 1}`,
    slug,
    name: seed.name,
    description: seed.description,
    price: seed.price,
    originalPrice: seed.originalPrice,
    stock: seed.stock,
    sold: seed.sold,
    rating: seed.rating,
    reviewCount: Math.max(12, Math.round(seed.sold / 3)),
    image,
    gallery: [image, image, image],
    categoryId: category.id,
    categorySlug: category.slug,
    sellerId: seller.id,
    sellerName: seller.name,
    sellerSlug: seller.slug,
    city: seed.city ?? seller.city,
    createdAt: new Date(Date.UTC(2026, 8, 20 - index)).toISOString(),
    isPromo: Boolean(seed.originalPrice),
    promoLabel: seed.originalPrice
      ? `Hemat ${discountPercent(seed.price, seed.originalPrice)}%`
      : isBestseller
        ? "Terlaris"
        : undefined,
    isNew: seed.isNew,
    isBestseller,
    tags: seed.tags,
    weight: seed.weight,
  };
});

const servicePhoto = (id: string) => `/images/services/${id}.jpg`;

export const services: Service[] = [
  { id: "sv1", slug: "service-raket", name: "Stringing Raket Profesional", icon: "zap", description: "Pasang senar raket dengan tension sesuai gaya main, selesai dalam 1x24 jam.", price: 85000, duration: "1x24 jam", requirements: ["Raket dikirim ke toko", "Tulis tension yang diinginkan", "Konfirmasi via WhatsApp"], image: servicePhoto("service-raket") },
  { id: "sv2", slug: "personal-trainer", name: "Sesi Personal Trainer", icon: "dumbbell", description: "Pendampingan latihan 60 menit oleh trainer bersertifikat, online atau di gym.", price: 250000, duration: "60 menit", requirements: ["Isi form tujuan latihan", "Pilih lokasi atau online", "Jadwal dikonfirmasi trainer"], image: servicePhoto("personal-trainer") },
  { id: "sv3", slug: "servis-sepatu", name: "Servis & Bersih Sepatu", icon: "activity", description: "Pembersihan mendalam, waterproofing, dan perbaikan sol ringan.", price: 120000, duration: "2-3 hari", requirements: ["Sepatu dikirim ke toko", "Foto kondisi sepatu", "Cantumkan ukuran"], image: servicePhoto("servis-sepatu") },
  { id: "sv4", slug: "booking-lapangan", name: "Booking Lapangan", icon: "target", description: "Bantu cari dan reservasi lapangan badminton, futsal, atau basket di kotamu.", price: 50000, duration: "Konfirmasi 2 jam", requirements: ["Pilih jenis lapangan", "Tanggal dan jam main", "Jumlah pemain"], image: servicePhoto("booking-lapangan") },
];

export const vouchers: Voucher[] = [
  { code: "CGI10", label: "Diskon 10%", description: "Potongan 10% maksimal Rp50.000, minimal belanja Rp150.000.", type: "percent", value: 10, minSpend: 150000, maxDiscount: 50000 },
  { code: "LARI15", label: "Diskon 15%", description: "Khusus produk kategori Lari, minimal belanja Rp250.000.", type: "percent", value: 15, minSpend: 250000, categorySlug: "lari" },
  { code: "HEMAT20K", label: "Potongan Rp20.000", description: "Potongan tetap untuk belanja minimal Rp100.000.", type: "fixed", value: 20000, minSpend: 100000 },
];

export const paymentMethods = [
  { key: "qris", label: "QRIS", kind: "qris", description: "Scan dengan aplikasi pembayaran apa pun" },
  { key: "bca", label: "BCA Virtual Account", kind: "va", description: "Transfer ke nomor VA BCA" },
  { key: "mandiri", label: "Mandiri Virtual Account", kind: "va", description: "Transfer ke nomor VA Mandiri" },
  { key: "bni", label: "BNI Virtual Account", kind: "va", description: "Transfer ke nomor VA BNI" },
  { key: "bri", label: "BRI Virtual Account", kind: "va", description: "Transfer ke nomor VA BRI" },
  { key: "gopay", label: "GoPay", kind: "ewallet", description: "Bayar lewat saldo GoPay" },
  { key: "ovo", label: "OVO", kind: "ewallet", description: "Bayar lewat saldo OVO" },
  { key: "dana", label: "DANA", kind: "ewallet", description: "Bayar lewat saldo DANA" },
] as const;

export const cities = ["Jakarta Pusat", "Bandung", "Surabaya", "Semarang", "Medan", "Malang", "Yogyakarta", "Bekasi"];

export const faqs = [
  { q: "Bagaimana cara memilih alat olahraga yang tepat?", a: "Ceritakan tujuan, level, dan kendala kamu lewat Konsultan Produk. Saya akan mencocokkan kebutuhan itu dengan produk yang tersedia di katalog." },
  { q: "Apakah bisa membandingkan beberapa produk?", a: "Bisa. Tambahkan hingga empat produk ke halaman Bandingkan untuk melihat perbedaan harga, rating, stok, dan penjual." },
  { q: "Bagaimana cara melacak pesanan?", a: "Buka halaman Pesanan atau Lacak, lalu masukkan nomor pesanan atau nomor resi. Status dan perkiraan tiba akan ditampilkan." },
  { q: "Apakah pembayaran bisa langsung selesai?", a: "Dalam mode demo, pembayaran disimulasikan. Pilih metode pembayaran lalu klik konfirmasi pembayaran pada halaman pesanan." },
  { q: "Bisakah saya membuka toko sendiri?", a: "Bisa. Buka menu Dashboard Penjual, isi profil toko, lalu tambahkan produk. Semua data tersimpan di browser kamu." },
];

export const demoNotifications: NotificationItem[] = [
  { id: "n1", title: "Selamat datang di CGI Sports", body: "Jelajahi katalog dan coba Konsultan Produk untuk rekomendasi personal.", href: "/products", at: "2026-11-24T12:00:00.000Z", read: false },
  { id: "n2", title: "Voucher CGI10 aktif", body: "Diskon 10% maksimal Rp50.000 untuk belanja minimal Rp150.000.", href: "/cart", at: "2026-11-24T11:00:00.000Z", read: false },
];

export function demoOrders(): Order[] {
  return [
    {
      id: "demo-tracking",
      number: "CGI-20261120-4821",
      status: "dikirim",
      items: [
        { productId: "p6", name: "Sepatu Lari Lightweight", image: products[5].image, price: 759000, quantity: 1 },
        { productId: "p9", name: "Botol Minum Sport 750ml", image: products[8].image, price: 99000, quantity: 1 },
      ],
      subtotal: 858000,
      shippingFee: 15000,
      discount: 0,
      total: 873000,
      customerName: "Pengguna Demo",
      phone: "081234567890",
      address: "Jl. Contoh No. 10",
      city: "Bandung",
      postalCode: "40111",
      paymentMethod: "qris",
      createdAt: "2026-11-20T09:30:00.000Z",
      resi: "CGI8248219041821",
    },
    {
      id: "demo-tracking-2",
      number: "CGI-20261122-1907",
      status: "diproses",
      items: [
        { productId: "p10", name: "Raket Badminton Carbon Pro", image: products[9].image, price: 549000, quantity: 1 },
      ],
      subtotal: 549000,
      shippingFee: 15000,
      discount: 0,
      total: 564000,
      customerName: "Pengguna Demo",
      phone: "081234567890",
      address: "Jl. Contoh No. 10",
      city: "Surabaya",
      postalCode: "60211",
      paymentMethod: "bca",
      createdAt: "2026-11-22T14:15:00.000Z",
      resi: "CGI8219076623190",
    },
  ];
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSellerBySlug(slug: string) {
  return sellers.find((s) => s.slug === slug);
}

export function getProductBySlug(slug: string, extra: Product[] = []) {
  return [...extra, ...products].find((p) => p.slug === slug);
}

export function getProductById(id: string, extra: Product[] = []) {
  return [...extra, ...products].find((p) => p.id === id);
}

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getCategoryName(slug: string) {
  return getCategoryBySlug(slug)?.name ?? "Lainnya";
}
