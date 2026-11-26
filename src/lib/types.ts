export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type Seller = {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  isOfficial: boolean;
  joinedYear: number;
  banner: string;
  photo?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  categoryId: string;
  categorySlug: string;
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
  city: string;
  createdAt: string;
  isPromo?: boolean;
  promoLabel?: string;
  tag?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  tags: string[];
  weight?: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus =
  | "menunggu_pembayaran"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  voucherCode?: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  createdAt: string;
  resi?: string;
  courier?: string;
  paidAt?: string;
  userId?: string;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  duration: string;
  requirements: string[];
  image: string;
};

export type ServiceRequestStatus = "menunggu" | "diproses" | "selesai" | "ditolak";

export type ServiceRequest = {
  id: string;
  number: string;
  serviceId: string;
  serviceName: string;
  status: ServiceRequestStatus;
  notes: string;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string;
  userId?: string;
  name: string;
  city?: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
  verified?: boolean;
};

export type SellerChatContext = {
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  product?: { id: string; slug?: string; name: string; price: number; image?: string };
  orderNumber?: string;
};

export type SellerChatMessage = {
  id: string;
  key: string;
  sellerName: string;
  role: "buyer" | "seller";
  text: string;
  at: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href?: string;
  at: string;
  read: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  primary: boolean;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  photo?: string;
};

export type ProductEntry = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

export type Voucher = {
  code: string;
  label: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  maxDiscount?: number;
  categorySlug?: string;
  badge?: string;
  expiresAt?: string;
};

export type MySeller = {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  phone: string;
  description: string;
  photo?: string;
};

export type AnalyticsEventType =
  | "page_view"
  | "product_click"
  | "product_view"
  | "add_to_cart"
  | "begin_checkout"
  | "order_created"
  | "payment_confirmed"
  | "order_completed"
  | "order_cancelled";

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  path: string;
  at: string;
  visitorId: string;
  productId?: string;
  productName?: string;
  orderRef?: string;
  amount?: number;
};

export type SortOption =
  | "relevan"
  | "harga-terendah"
  | "harga-tertinggi"
  | "terbaru"
  | "terlaris"
  | "rating";

export type ProductFilters = {
  q?: string;
  category?: string;
  seller?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: SortOption;
};

export type ToastVariant = "success" | "error" | "info";
