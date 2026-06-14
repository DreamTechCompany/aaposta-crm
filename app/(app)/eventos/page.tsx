import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { statusLabel, type EventRow } from "@/lib/types";

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <Link
          href="/eventos/novo"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Novo evento
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Erro ao carregar eventos: {error.message}
        </p>
      )}

      {!error && (!events || events.length === 0) && (
        <p className="mt-16 text-center text-sm text-neutral-500">
          Nenhum evento ainda. Crie o primeiro.
        </p>
      )}

      {events && events.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Início</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(events as EventRow[]).map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/eventos/${e.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {e.location || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDate(e.starts_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                      {statusLabel(e.status)}
                    </span>
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
