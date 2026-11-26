"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import type { Product } from "@/lib/types";

export default function ProductViewTracker({ product }: { product: Product }) {
  const { markViewed, track } = useStore();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (trackedRef.current === product.id) return;
    trackedRef.current = product.id;
    markViewed(product);
    track("product_view", { productId: product.id, productName: product.name });
  }, [product, markViewed, track]);

  return null;
}
