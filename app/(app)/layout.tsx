import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-6">
            <Link href="/eventos" className="font-semibold tracking-tight">
              AAposta CRM
            </Link>
            <Link
              href="/eventos"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Eventos
            </Link>
            <Link
              href="/expositores"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Expositores
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user.email}</span>
            <form action={logout}>
              <button className="text-sm text-neutral-600 hover:text-neutral-900">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
