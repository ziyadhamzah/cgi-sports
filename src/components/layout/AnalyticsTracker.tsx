"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store/StoreProvider";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { ready, track } = useStore();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || lastPath.current === pathname) return;
    lastPath.current = pathname;
    track("page_view", { path: pathname });
  }, [ready, pathname, track]);

  return null;
}
