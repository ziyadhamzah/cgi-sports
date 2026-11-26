import { Suspense } from "react";
import AuthForm from "@/components/account/AuthForm";
import { Breadcrumbs } from "@/components/ui";

async function RegisterContent({ searchParams }: PageProps<"/register">) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : "";

  return (
    <div className="mt-10">
      <AuthForm mode="register" next={next} />
    </div>
  );
}

export default function RegisterPage(props: PageProps<"/register">) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Daftar" }]} />
      <Suspense fallback={<div className="surface-card mt-10 rounded-3xl p-10 text-sm text-zinc-400">Memuat formulir daftar...</div>}>
        <RegisterContent {...props} />
      </Suspense>
    </main>
  );
}
