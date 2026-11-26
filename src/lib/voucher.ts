import { useSyncExternalStore } from "react";

const KEY = "cgi_sports_voucher";

let snapshot = "";
let loaded = false;
const listeners = new Set<() => void>();

function read(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return "";
  if (!loaded) {
    loaded = true;
    snapshot = read();
  }
  return snapshot;
}

function getServerSnapshot() {
  return "";
}

function saveVoucher(value: string) {
  snapshot = value;
  if (typeof window !== "undefined") {
    try {
      if (value) window.sessionStorage.setItem(KEY, value);
      else window.sessionStorage.removeItem(KEY);
    } catch {
      return;
    }
  }
  listeners.forEach((listener) => listener());
}

export function useSavedVoucher() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, saveVoucher] as const;
}
