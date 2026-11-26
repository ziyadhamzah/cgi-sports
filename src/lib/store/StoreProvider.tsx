"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { cartSubtotal, summarizeAnalytics } from "@/lib/catalog";
import { createId, makeResi, slugify } from "@/lib/format";
import {
  demoClaimedVouchers,
  demoNotifications,
  demoOrders,
  demoReviews,
  products as baseProducts,
} from "@/lib/mock-data";
import { sellerChatKey, sellerChatReply } from "@/lib/seller-chat";
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  AppUser,
  CartItem,
  MySeller,
  NotificationItem,
  Order,
  OrderStatus,
  Product,
  ProductEntry,
  Review,
  SavedAddress,
  SellerChatContext,
  SellerChatMessage,
  Service,
  ServiceRequest,
  ToastVariant,
} from "@/lib/types";

type ToastItem = { id: string; message: string; variant: ToastVariant };

type StoreData = {
  ready: boolean;
  cart: CartItem[];
  wishlist: ProductEntry[];
  compare: ProductEntry[];
  orders: Order[];
  notifications: NotificationItem[];
  user: AppUser | null;
  addresses: SavedAddress[];
  reviews: Review[];
  recent: ProductEntry[];
  watched: ProductEntry[];
  seller: MySeller | null;
  sellerProducts: Product[];
  theme: "dark" | "light";
  analytics: AnalyticsEvent[];
  serviceRequests: ServiceRequest[];
  claimedVouchers: string[];
  sellerChats: Record<string, SellerChatMessage[]>;
  toasts: ToastItem[];
};

type StoreContextValue = StoreData & {
  allProducts: Product[];
  allOrders: Order[];
  cartItems: { product: Product; quantity: number }[];
  itemCount: number;
  subtotal: number;
  analyticsSummary: ReturnType<typeof summarizeAnalytics>;
  resolveProduct: (id: string) => Product | undefined;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  removeWishlist: (id: string) => void;
  clearWishlist: () => void;
  toggleCompare: (product: Product) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  saveOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  notify: (title: string, body: string, href?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateUserPhoto: (photo: string) => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  updateAddress: (id: string, patch: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setPrimaryAddress: (id: string) => void;
  addReview: (review: Omit<Review, "id" | "date" | "userId">) => void;
  removeReview: (id: string) => void;
  markViewed: (product: Product) => void;
  clearRecent: () => void;
  toggleWatch: (product: Product) => void;
  openSeller: (data: Omit<MySeller, "id" | "slug">) => void;
  updateSellerPhoto: (photo: string) => void;
  closeSeller: () => void;
  saveSellerProduct: (product: Product) => void;
  removeSellerProduct: (id: string) => void;
  toggleTheme: () => void;
  track: (type: AnalyticsEventType, meta?: Partial<AnalyticsEvent>) => void;
  clearAnalytics: () => void;
  toast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
  createServiceRequest: (service: Service, notes: string) => ServiceRequest;
  claimVoucher: (code: string) => void;
  sendSellerChat: (context: SellerChatContext, text: string) => void;
  clearSellerChat: (key: string) => void;
};

const emptyData: StoreData = {
  ready: false,
  cart: [],
  wishlist: [],
  compare: [],
  orders: [],
  notifications: [],
  user: null,
  addresses: [],
  reviews: [],
  recent: [],
  watched: [],
  seller: null,
  sellerProducts: [],
  theme: "dark",
  analytics: [],
  serviceRequests: [],
  claimedVouchers: [],
  sellerChats: {},
  toasts: [],
};

const KEYS: Record<string, string> = {
  cart: "cgi_sports_cart",
  wishlist: "cgi_sports_wishlist",
  compare: "cgi_sports_compare",
  orders: "cgi_sports_orders",
  notifications: "cgi_sports_notifications",
  user: "cgi_sports_user",
  addresses: "cgi_sports_addresses",
  reviews: "cgi_sports_reviews",
  recent: "cgi_sports_recent",
  watched: "cgi_sports_watched",
  seller: "cgi_sports_seller",
  sellerProducts: "cgi_sports_seller_products",
  theme: "cgi_sports_theme",
  analytics: "cgi_sports_analytics",
  serviceRequests: "cgi_sports_service_requests",
  claimedVouchers: "cgi_sports_claimed_vouchers",
  sellerChats: "cgi_sports_seller_chats",
};

type SetStore = (next: StoreData | ((prev: StoreData) => StoreData)) => void;

let snapshot: StoreData = emptyData;
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return emptyData;
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const storedOrders = read<Order[]>(KEYS.orders, []);
  const savedDemoOrders = demoOrders().filter((demo) => !storedOrders.some((order) => order.id === demo.id));
  setStore({
    ...emptyData,
    ready: true,
    cart: read<CartItem[]>(KEYS.cart, []),
    wishlist: read<ProductEntry[]>(KEYS.wishlist, []),
    compare: read<ProductEntry[]>(KEYS.compare, []),
    orders: [...storedOrders, ...savedDemoOrders],
    notifications: read<NotificationItem[]>(KEYS.notifications, demoNotifications),
    user: read<AppUser | null>(KEYS.user, null),
    addresses: read<SavedAddress[]>(KEYS.addresses, []),
    reviews: read<Review[]>(KEYS.reviews, demoReviews),
    recent: read<ProductEntry[]>(KEYS.recent, []),
    watched: read<ProductEntry[]>(KEYS.watched, []),
    seller: read<MySeller | null>(KEYS.seller, null),
    sellerProducts: read<Product[]>(KEYS.sellerProducts, []),
    theme: read<"dark" | "light">(KEYS.theme, "dark"),
    analytics: read<AnalyticsEvent[]>(KEYS.analytics, []),
    serviceRequests: read<ServiceRequest[]>(KEYS.serviceRequests, []),
    claimedVouchers: read<string[]>(KEYS.claimedVouchers, demoClaimedVouchers),
    sellerChats: read<Record<string, SellerChatMessage[]>>(KEYS.sellerChats, {}),
  });
}

const setStore: SetStore = (next) => {
  snapshot = typeof next === "function" ? next(snapshot) : next;
  listeners.forEach((listener) => listener());
};

const StoreContext = createContext<StoreContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function toEntry(product: Product): ProductEntry {
  return { id: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price };
}

function toggleEntry(list: ProductEntry[], product: Product) {
  return list.some((item) => item.id === product.id)
    ? list.filter((item) => item.id !== product.id)
    : [toEntry(product), ...list].slice(0, 100);
}

function getVisitorId() {
  let id = read<string>("cgi_sports_visitor", "");
  if (!id) {
    id = createId("visitor");
    write("cgi_sports_visitor", id);
  }
  return id;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!data.ready) return;
    document.documentElement.dataset.theme = data.theme;
  }, [data.ready, data.theme]);

  useEffect(() => {
    if (!data.ready) return;
    write(KEYS.cart, data.cart);
    write(KEYS.wishlist, data.wishlist);
    write(KEYS.compare, data.compare);
    write(KEYS.orders, data.orders);
    write(KEYS.notifications, data.notifications);
    write(KEYS.user, data.user);
    write(KEYS.addresses, data.addresses);
    write(KEYS.reviews, data.reviews);
    write(KEYS.recent, data.recent);
    write(KEYS.watched, data.watched);
    write(KEYS.seller, data.seller);
    write(KEYS.sellerProducts, data.sellerProducts);
    write(KEYS.theme, data.theme);
    write(KEYS.analytics, data.analytics);
    write(KEYS.serviceRequests, data.serviceRequests);
    write(KEYS.claimedVouchers, data.claimedVouchers);
    write(KEYS.sellerChats, data.sellerChats);
  }, [data.ready, data.cart, data.wishlist, data.compare, data.orders, data.notifications, data.user, data.addresses, data.reviews, data.recent, data.watched, data.seller, data.sellerProducts, data.theme, data.analytics, data.serviceRequests, data.claimedVouchers, data.sellerChats]);

  const dismissToast = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, toasts: prev.toasts.filter((t) => t.id !== id) }));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = createId("toast");
    setStore((prev) => ({ ...prev, toasts: [...prev.toasts.slice(-2), { id, message, variant }] }));
    window.setTimeout(() => {
      setStore((prev) => ({ ...prev, toasts: prev.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  }, []);

  const allProducts = useMemo(() => [...data.sellerProducts, ...baseProducts], [data.sellerProducts]);
  const resolveProduct = useCallback((id: string) => allProducts.find((p) => p.id === id), [allProducts]);
  const cartItems = useMemo(
    () => data.cart.flatMap((item) => {
      const product = resolveProduct(item.productId);
      return product ? [{ product, quantity: item.quantity }] : [];
    }),
    [data.cart, resolveProduct],
  );
  const subtotal = useMemo(() => cartSubtotal(data.cart, resolveProduct), [data.cart, resolveProduct]);
  const itemCount = useMemo(() => data.cart.reduce((sum, item) => sum + item.quantity, 0), [data.cart]);
  const allOrders = useMemo(
    () => [...data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data.orders],
  );
  const analyticsSummary = useMemo(() => summarizeAnalytics(data.analytics), [data.analytics]);

  const track = useCallback((type: AnalyticsEventType, meta: Partial<AnalyticsEvent> = {}) => {
    const event: AnalyticsEvent = {
      id: createId("evt"),
      type,
      path: typeof window === "undefined" ? "/" : window.location.pathname,
      at: new Date().toISOString(),
      visitorId: getVisitorId(),
      ...meta,
    };
    setStore((prev) => ({ ...prev, analytics: [...prev.analytics.slice(-2999), event] }));
  }, []);

  const value: StoreContextValue = {
    ...data,
    allProducts,
    allOrders,
    cartItems,
    itemCount,
    subtotal,
    analyticsSummary,
    resolveProduct,
    addToCart: (product, quantity = 1) => {
      setStore((prev) => {
        const existing = prev.cart.find((item) => item.productId === product.id);
        const cart = existing
          ? prev.cart.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item)
          : [...prev.cart, { productId: product.id, quantity: Math.min(quantity, product.stock) }];
        return { ...prev, cart };
      });
      track("add_to_cart", { productId: product.id, productName: product.name });
      toast(`${product.name} ditambahkan ke keranjang.`);
    },
    removeFromCart: (id) => setStore((prev) => ({ ...prev, cart: prev.cart.filter((item) => item.productId !== id) })),
    updateQuantity: (id, quantity) => setStore((prev) => ({
      ...prev,
      cart: prev.cart.map((item) => {
        if (item.productId !== id) return item;
        const product = prev.sellerProducts.find((p) => p.id === id) ?? baseProducts.find((p) => p.id === id);
        return { ...item, quantity: Math.min(Math.max(1, quantity), product?.stock ?? 99) };
      }),
    })),
    clearCart: () => setStore((prev) => ({ ...prev, cart: [] })),
    toggleWishlist: (product) => {
      const has = data.wishlist.some((item) => item.id === product.id);
      setStore((prev) => ({ ...prev, wishlist: toggleEntry(prev.wishlist, product) }));
      toast(has ? `${product.name} dihapus dari wishlist.` : `${product.name} ditambahkan ke wishlist.`);
    },
    removeWishlist: (id) => setStore((prev) => ({ ...prev, wishlist: prev.wishlist.filter((item) => item.id !== id) })),
    clearWishlist: () => setStore((prev) => ({ ...prev, wishlist: [] })),
    toggleCompare: (product) => {
      const has = data.compare.some((item) => item.id === product.id);
      if (!has && data.compare.length >= 4) {
        toast("Maksimal 4 produk untuk dibandingkan.", "error");
        return;
      }
      setStore((prev) => ({ ...prev, compare: toggleEntry(prev.compare, product) }));
      toast(has ? `${product.name} dihapus dari perbandingan.` : `${product.name} ditambahkan ke perbandingan.`);
    },
    removeCompare: (id) => setStore((prev) => ({ ...prev, compare: prev.compare.filter((item) => item.id !== id) })),
    clearCompare: () => setStore((prev) => ({ ...prev, compare: [] })),
    saveOrder: (order) => {
      setStore((prev) => ({ ...prev, orders: [order, ...prev.orders].slice(0, 100) }));
      track("order_created", { orderRef: order.number, amount: order.total });
      notifySafe(setStore, "Pesanan berhasil dibuat", `Nomor pesanan ${order.number} menunggu pembayaran.`, `/orders/${order.id}`);
    },
    updateOrderStatus: (id, status) => {
      const previous = snapshot.orders.find((item) => item.id === id);
      const paidNow = status === "diproses" && previous?.status === "menunggu_pembayaran";
      const shippedNow = status === "dikirim" && previous?.status === "diproses";
      const completedNow = status === "selesai" && previous?.status === "dikirim";
      setStore((prev) => ({
        ...prev,
        orders: prev.orders.map((order) => order.id === id
          ? {
              ...order,
              status,
              ...(paidNow && !order.resi ? { resi: makeResi(), courier: "CGI Reguler", paidAt: new Date().toISOString() } : {}),
              ...(shippedNow && !order.courier ? { courier: "CGI Reguler" } : {}),
            }
          : order),
      }));
      if (paidNow && previous) {
        track("payment_confirmed", { orderRef: previous.number, amount: previous.total });
        notifySafe(
          setStore,
          "Pembayaran dikonfirmasi",
          `Pesanan ${previous.number} sedang diproses. Nomor resi tersedia di detail pesanan.`,
          `/orders/${previous.id}`,
        );
      }
      if (shippedNow && previous) {
        notifySafe(
          setStore,
          "Pesanan dikirim",
          `Pesanan ${previous.number} sedang dalam pengiriman. Lacak statusnya kapan saja.`,
          `/orders/${previous.id}`,
        );
      }
      if (completedNow && previous) {
        notifySafe(
          setStore,
          "Pesanan selesai",
          `Pesanan ${previous.number} diterima. Terima kasih sudah berbelanja di CGI Sports.`,
          `/orders/${previous.id}`,
        );
      }
      if (status === "selesai") track("order_completed");
      if (status === "dibatalkan") track("order_cancelled");
    },
    notify: (title, body, href) => setStore((prev) => ({
      ...prev,
      notifications: [{ id: createId("notif"), title, body, href, at: new Date().toISOString(), read: false }, ...prev.notifications].slice(0, 40),
    })),
    markNotificationRead: (id) => setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => item.id === id ? { ...item, read: true } : item),
    })),
    markAllNotificationsRead: () => setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true })),
    })),
    clearNotifications: () => setStore((prev) => ({ ...prev, notifications: [] })),
    login: (name, email) => {
      const user: AppUser = { id: createId("user"), name, email, role: "user" };
      setStore((prev) => ({ ...prev, user }));
      toast(`Selamat datang, ${name}.`);
    },
    logout: () => {
      setStore((prev) => ({ ...prev, user: null }));
      toast("Kamu telah keluar dari akun.");
    },
    updateUserPhoto: (photo) => {
      setStore((prev) => ({ ...prev, user: prev.user ? { ...prev.user, photo: photo || undefined } : prev.user }));
      toast(photo ? "Foto profil berhasil diperbarui." : "Foto profil dihapus.");
    },
    addAddress: (address) => setStore((prev) => {
      const list = prev.addresses.map((item) => ({ ...item, primary: false }));
      return { ...prev, addresses: [...list, { ...address, id: createId("addr") }] };
    }),
    updateAddress: (id, patch) => setStore((prev) => ({
      ...prev,
      addresses: prev.addresses.map((item) => item.id === id ? { ...item, ...patch } : item),
    })),
    removeAddress: (id) => setStore((prev) => ({ ...prev, addresses: prev.addresses.filter((item) => item.id !== id) })),
    setPrimaryAddress: (id) => setStore((prev) => ({
      ...prev,
      addresses: prev.addresses.map((item) => ({ ...item, primary: item.id === id })),
    })),
    addReview: (review) => {
      setStore((prev) => ({
        ...prev,
        reviews: [{ ...review, userId: prev.user?.id, id: createId("review"), date: new Date().toISOString() }, ...prev.reviews],
      }));
      toast("Ulasan kamu berhasil dikirim.");
    },
    removeReview: (id) => setStore((prev) => ({ ...prev, reviews: prev.reviews.filter((item) => item.id !== id) })),
    markViewed: (product) => setStore((prev) => ({
      ...prev,
      recent: [toEntry(product), ...prev.recent.filter((item) => item.id !== product.id)].slice(0, 24),
    })),
    clearRecent: () => setStore((prev) => ({ ...prev, recent: [] })),
    toggleWatch: (product) => setStore((prev) => ({
      ...prev,
      watched: toggleEntry(prev.watched, product),
    })),
    openSeller: (sellerData) => {
      const seller: MySeller = { ...sellerData, id: createId("seller"), slug: slugify(sellerData.name) };
      setStore((prev) => ({ ...prev, seller }));
      toast("Toko kamu berhasil dibuka.");
    },
    updateSellerPhoto: (photo) => {
      setStore((prev) => ({ ...prev, seller: prev.seller ? { ...prev.seller, photo: photo || undefined } : prev.seller }));
      toast(photo ? "Foto toko berhasil diperbarui." : "Foto toko dihapus.");
    },
    closeSeller: () => setStore((prev) => ({ ...prev, seller: null, sellerProducts: [] })),
    saveSellerProduct: (product) => setStore((prev) => ({
      ...prev,
      sellerProducts: prev.sellerProducts.some((item) => item.id === product.id)
        ? prev.sellerProducts.map((item) => item.id === product.id ? product : item)
        : [product, ...prev.sellerProducts],
    })),
    removeSellerProduct: (id) => setStore((prev) => ({ ...prev, sellerProducts: prev.sellerProducts.filter((item) => item.id !== id) })),
    toggleTheme: () => setStore((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" })),
    track,
    clearAnalytics: () => setStore((prev) => ({ ...prev, analytics: [] })),
    toast,
    dismissToast,
    createServiceRequest: (service, notes) => {
      const request: ServiceRequest = {
        id: createId("srv"),
        number: `SRV-${String(new Date().getFullYear()).slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceId: service.id,
        serviceName: service.name,
        status: "menunggu",
        notes,
        createdAt: new Date().toISOString(),
      };
      setStore((prev) => ({ ...prev, serviceRequests: [request, ...prev.serviceRequests] }));
      notifySafe(setStore, "Pengajuan layanan diterima", `${service.name} dengan nomor ${request.number} akan segera diproses.`, "/account");
      return request;
    },
    claimVoucher: (code) => {
      const normalized = code.trim().toUpperCase();
      setStore((prev) => prev.claimedVouchers.includes(normalized)
        ? prev
        : { ...prev, claimedVouchers: [...prev.claimedVouchers, normalized] });
      toast("Voucher berhasil diklaim dan siap dipakai.");
    },
    sendSellerChat: (context, text) => {
      const key = sellerChatKey(context);
      const trimmed = text.trim();
      if (!trimmed) return;
      const at = new Date().toISOString();
      const buyerMessage: SellerChatMessage = { id: createId("msg"), key, sellerName: context.sellerName, role: "buyer", text: trimmed, at };
      const sellerMessage: SellerChatMessage = { id: createId("msg"), key, sellerName: context.sellerName, role: "seller", text: sellerChatReply(context, trimmed), at };
      setStore((prev) => ({
        ...prev,
        sellerChats: {
          ...prev.sellerChats,
          [key]: [...(prev.sellerChats[key] ?? []), buyerMessage, sellerMessage].slice(-60),
        },
      }));
    },
    clearSellerChat: (key) => setStore((prev) => {
      const chats = { ...prev.sellerChats };
      delete chats[key];
      return { ...prev, sellerChats: chats };
    }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function notifySafe(
  setStore: React.Dispatch<React.SetStateAction<StoreData>>,
  title: string,
  body: string,
  href?: string,
) {
  setStore((prev) => ({
    ...prev,
    notifications: [
      { id: createId("notif"), title, body, href, at: new Date().toISOString(), read: false },
      ...prev.notifications,
    ].slice(0, 40),
  }));
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
