import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { statusLabel, type ExhibitorRow, type EventRow } from "@/lib/types";
import { deleteExhibitor } from "../actions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 px-4 py-3 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{value}</dd>
    </div>
  );
}

type LinkedEvent = {
  id: string;
  event: Pick<EventRow, "id" | "name" | "status"> | null;
  stage: { name: string } | null;
};

export default async function ExpositorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: exhibitor } = await supabase
    .from("exhibitors")
    .select("*")
    .eq("id", id)
    .single<ExhibitorRow>();

  if (!exhibitor) notFound();

  const { data: links } = await supabase
    .from("event_exhibitors")
    .select("id, event:events(id, name, status), stage:pipeline_stages(name)")
    .eq("exhibitor_id", id)
    .order("created_at", { ascending: false });

  const linkedEvents = (links ?? []) as unknown as LinkedEvent[];
  const del = deleteExhibitor.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/expositores"
            className="text-sm text-neutral-500 hover:underline"
          >
            ← Expositores
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {exhibitor.company_name}
          </h1>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <dl className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        <Row label="CNPJ" value={exhibitor.cnpj || "—"} />
        <Row label="Contato" value={exhibitor.contact_name || "—"} />
        <Row label="E-mail" value={exhibitor.contact_email || "—"} />
        <Row label="Telefone" value={exhibitor.contact_phone || "—"} />
        <Row label="Observações" value={exhibitor.notes || "—"} />
      </dl>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-neutral-700">
          Eventos vinculados
        </h2>
        {linkedEvents.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Ainda não está em nenhum evento.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {linkedEvents.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between px-4 py-3"
              >
                {l.event ? (
                  <Link
                    href={`/eventos/${l.event.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {l.event.name}
                  </Link>
                ) : (
                  <span className="text-neutral-400">Evento removido</span>
                )}
                <span className="flex items-center gap-2 text-xs text-neutral-500">
                  {l.stage && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                      {l.stage.name}
                    </span>
                  )}
                  {l.event && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                      {statusLabel(l.event.status)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/expositores/${id}/editar`}
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
