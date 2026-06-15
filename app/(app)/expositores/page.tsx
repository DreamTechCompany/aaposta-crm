import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type ExhibitorRow } from "@/lib/types";

export default async function ExpositoresPage() {
  const supabase = await createClient();
  const { data: exhibitors, error } = await supabase
    .from("exhibitors")
    .select("*")
    .order("company_name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Expositores</h1>
        <Link
          href="/expositores/novo"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Novo expositor
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Erro ao carregar expositores: {error.message}
        </p>
      )}

      {!error && (!exhibitors || exhibitors.length === 0) && (
        <p className="mt-16 text-center text-sm text-neutral-500">
          Nenhum expositor ainda. Cadastre o primeiro.
        </p>
      )}

      {exhibitors && exhibitors.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(exhibitors as ExhibitorRow[]).map((x) => (
                <tr key={x.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/expositores/${x.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {x.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {x.contact_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {x.contact_email || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {x.contact_phone || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
