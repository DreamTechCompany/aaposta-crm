import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { statusLabel, type EventRow } from "@/lib/types";
import { deleteEvent } from "../actions";

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 px-4 py-3 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{value}</dd>
    </div>
  );
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<EventRow>();

  if (!event) notFound();

  const del = deleteEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/eventos"
            className="text-sm text-neutral-500 hover:underline"
          >
            ← Eventos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {event.name}
          </h1>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {statusLabel(event.status)}
        </span>
      </div>

      <dl className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        <Row label="Local" value={event.location || "—"} />
        <Row label="Início" value={formatDate(event.starts_at)} />
        <Row label="Fim" value={formatDate(event.ends_at)} />
        <Row label="Observações" value={event.notes || "—"} />
      </dl>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/eventos/${id}/editar`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Editar
        </Link>
        <form action={del}>
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir
          </button>
        </form>
      </div>
    </div>
  );
}
