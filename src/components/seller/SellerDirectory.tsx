"use client";

import SellerCard from "@/components/products/SellerCard";
import { sellers } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { MySeller, Seller } from "@/lib/types";

function toSeller(local: MySeller, image?: string): Seller {
  return {
    id: local.id,
    name: local.name,
    slug: local.slug,
    description: local.description || `Toko ${local.name} yang berjualan di ${local.city}.`,
    city: local.city,
    address: local.city,
    phone: local.phone,
    rating: 0,
    reviewCount: 0,
    verified: false,
    isOfficial: false,
    joinedYear: new Date().getFullYear(),
    banner: image ?? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    photo: local.photo,
  };
}

export default function SellerDirectory() {
  const { ready, seller, sellerProducts } = useStore();
  const own = ready && seller
    ? [toSeller(seller, sellerProducts.find((product) => product.sellerId === seller.id)?.image)]
    : [];
  const list = [...own, ...sellers];

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((item) => <SellerCard key={item.id} seller={item} />)}
    </div>
  );
}
