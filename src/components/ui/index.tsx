"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Icon, type IconName } from "./Icon";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  full?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  target?: string;
};

export function Button({ children, href, variant = "primary", size = "md", icon, full, className = "", onClick, disabled, type = "button", target }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40";
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-5 py-3 text-sm", lg: "px-7 py-3.5 text-sm" };
  const variants = {
    primary: "bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110",
    secondary: "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)]",
    outline: "border border-[var(--line)] text-[var(--foreground)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface)]",
    ghost: "text-[var(--muted)] hover:text-[var(--foreground)]",
  };
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  const content = <>{icon && <Icon name={icon} size={16} />}{children}</>;
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : undefined}
      >
        {content}
      </Link>
    );
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={classes}>{content}</button>;
}

export function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: "accent" | "success" | "warning" | "danger" | "neutral"; className?: string }) {
  const tones = {
    accent: "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    danger: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    neutral: "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
      <Icon name="star" size={size} filled className="text-amber-400" />
      <span className="font-medium text-[var(--foreground)]">{value.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  );
}

export function Stars({ value, onChange, size = 24 }: { value: number; onChange?: (value: number) => void; size?: number }) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={onChange ? "rounded-full transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-40" : "cursor-default"}
          aria-label={`${star} dari 5 bintang`}
          aria-pressed={star <= value}
        >
          <Icon name="star" size={size} filled={star <= value} className={star <= value ? "text-amber-500" : "text-[var(--muted)]"} />
        </button>
      ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, center = false, className = "" }: { eyebrow?: string; title: string; description?: string; center?: boolean; className?: string }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{description}</p>}
    </div>
  );
}

export function SafeImage({ src, alt, fill = true, width, height, sizes, className = "", priority = false }: { src?: string; alt: string; fill?: boolean; width?: number; height?: number; sizes?: string; className?: string; priority?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = src !== undefined && src === failedSrc;
  if (!src || failed) {
    return <div className={`flex items-center justify-center bg-[var(--surface-soft)] text-[var(--muted)] ${className}`}><Icon name="image" size={28} /></div>;
  }
  const sizeProps = fill ? { fill: true as const } : { width: width ?? 1, height: height ?? 1 };
  return (
    <Image
      src={src}
      alt={alt}
      {...sizeProps}
      sizes={sizes}
      loading={priority ? "eager" : undefined}
      unoptimized={src.startsWith("data:") || src.endsWith(".svg")}
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}

export function EmptyState({ icon = "box", title, description, action }: { icon?: IconName; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--muted)]"><Icon name={icon} size={26} /></div>
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <Icon name="chevron-right" size={12} />}
          {item.href ? <Link href={item.href} className="transition hover:text-[var(--foreground)]">{item.label}</Link> : <span className="text-[var(--foreground)]">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus(), 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full text-[var(--muted)] transition hover:text-[var(--foreground)]" aria-label="Tutup"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex w-[min(360px,calc(100vw-3rem))] flex-col gap-2">
      {toasts.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => dismissToast(item.id)}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm shadow-xl backdrop-blur-xl ${
            item.variant === "error" ? "border-rose-400/40 bg-[var(--surface)] text-[var(--foreground)]" : item.variant === "info" ? "border-sky-400/40 bg-[var(--surface)] text-[var(--foreground)]" : "border-[var(--accent)]/40 bg-[var(--surface)] text-[var(--foreground)]"
          }`}
        >
          <Icon name={item.variant === "error" ? "info" : "check"} size={16} className="mt-0.5 shrink-0" />
          <span>{item.message}</span>
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

export const inputClass = "w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/60 focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
