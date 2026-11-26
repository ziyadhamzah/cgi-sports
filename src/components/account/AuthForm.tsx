"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, SectionHeading, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store/StoreProvider";

type AuthFormProps = {
  mode: "login" | "register";
  next?: string;
};

export default function AuthForm({ mode, next = "" }: AuthFormProps) {
  const router = useRouter();
  const { login, toast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const switchHref = `${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(destination)}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setError("");
    login(name.trim(), email.trim());
    toast(isRegister ? "Registrasi berhasil, mengalihkan ke akun." : "Login berhasil, mengalihkan ke akun.", "success");
    router.push(destination);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="surface-card rounded-3xl p-6 md:p-8">
        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
          <Icon name={isRegister ? "plus" : "user"} size={22} />
        </div>
        <SectionHeading
          title={isRegister ? "Buat akun baru" : "Masuk ke akun"}
          description={isRegister
            ? "Daftar untuk menyimpan alamat, wishlist, dan riwayat layanan kamu."
            : "Masuk dengan nama dan email untuk melanjutkan ke halaman akun."}
        />
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <Field label="Nama lengkap">
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama kamu"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Kata sandi" hint="Gunakan minimal 6 karakter.">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </Field>
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <Button type="submit" icon="arrow-right" full>
            {isRegister ? "Daftar sekarang" : "Masuk"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <Link href={switchHref} className="font-semibold text-[var(--accent)] transition hover:brightness-110">
            {isRegister ? "Masuk" : "Daftar"}
          </Link>
        </p>
      </div>
    </div>
  );
}
