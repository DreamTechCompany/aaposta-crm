import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  statusLabel,
  type EventRow,
  type ExhibitorRow,
} from "@/lib/types";
import { deleteEvent, linkExhibitor, unlinkExhibitor } from "../actions";

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

type LinkedExhibitor = {
  id: string;
  exhibitor: Pick<ExhibitorRow, "id" | "company_name" | "contact_name"> | null;
  stage: { name: string } | null;
};

// Indicador de status: verde quando feito, cinza quando pendente.
function StatusBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
        done ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          done ? "bg-green-500" : "bg-neutral-300"
        }`}
      />
      {label}
    </span>
  );
}

export default async function EventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<EventRow>();

  if (!event) notFound();

  // Expositores já vinculados a este evento (cards do pipeline).
  const { data: linksData } = await supabase
    .from("event_exhibitors")
    .select(
      "id, exhibitor:exhibitors(id, company_name, contact_name), stage:pipeline_stages(name)",
    )
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const links = (linksData ?? []) as unknown as LinkedExhibitor[];

  // Status por participação: já respondeu o formulário? já enviou o contrato
  // assinado? Substitui a notificação — dá pra ver de relance quem respondeu.
  const eeIds = links.map((l) => l.id);
  const respondedSet = new Set<string>();
  const signedSet = new Set<string>();
  if (eeIds.length > 0) {
    const { data: subs } = await supabase
      .from("form_submissions")
      .select("event_exhibitor_id")
      .in("event_exhibitor_id", eeIds);
    for (const s of (subs ?? []) as { event_exhibitor_id: string | null }[]) {
      if (s.event_exhibitor_id) respondedSet.add(s.event_exhibitor_id);
    }
    const { data: docs } = await supabase
      .from("documents")
      .select("event_exhibitor_id")
      .in("event_exhibitor_id", eeIds)
      .eq("direction", "recebido");
    for (const d of (docs ?? []) as { event_exhibitor_id: string }[]) {
      signedSet.add(d.event_exhibitor_id);
    }
  }

  // Expositores ainda não vinculados, pra alimentar o select de vínculo.
  const { data: allExhibitors } = await supabase
    .from("exhibitors")
    .select("id, company_name")
    .order("company_name", { ascending: true });

  const linkedIds = new Set(
    links.map((l) => l.exhibitor?.id).filter(Boolean) as string[],
  );
  const available = (
    (allExhibitors ?? []) as Pick<ExhibitorRow, "id" | "company_name">[]
  ).filter((x) => !linkedIds.has(x.id));

  const del = deleteEvent.bind(null, id);
  const link = linkExhibitor.bind(null, id);

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

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <dl className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        <Row label="Local" value={event.location || "—"} />
        <Row label="Início" value={formatDate(event.starts_at)} />
        <Row label="Fim" value={formatDate(event.ends_at)} />
        <Row label="Observações" value={event.notes || "—"} />
      </dl>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/eventos/${id}/pipeline`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Pipeline
        </Link>
        <Link
          href={`/eventos/${id}/formularios`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Formulários
        </Link>
        <Link
          href={`/eventos/${id}/editar`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
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

      {/* Expositores do evento */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Expositores</h2>
          <Link
            href="/expositores/novo"
            className="text-sm text-neutral-500 hover:underline"
          >
            Cadastrar novo
          </Link>
        </div>

        {links.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Nenhum expositor vinculado a este evento ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {links.map((l) => {
              const unlink = unlinkExhibitor.bind(null, id, l.id);
              return (
                <li
                  key={l.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <div>
                      {l.exhibitor ? (
                        <Link
                          href={`/expositores/${l.exhibitor.id}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {l.exhibitor.company_name}
                        </Link>
                      ) : (
                        <span className="text-neutral-400">
                          Expositor removido
                        </span>
                      )}
                      {l.exhibitor?.contact_name && (
                        <span className="ml-2 text-neutral-500">
                          · {l.exhibitor.contact_name}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge
                        label="Formulário"
                        done={respondedSet.has(l.id)}
                      />
                      <StatusBadge
                        label="Contrato assinado"
                        done={signedSet.has(l.id)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {l.stage && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                        {l.stage.name}
                      </span>
                    )}
                    <Link
                      href={`/eventos/${id}/participacao/${l.id}`}
                      className="text-xs font-medium text-neutral-600 hover:underline"
                    >
                      Documentos
                    </Link>
                    <form action={unlink}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Desvincular
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Vincular expositor existente */}
        {available.length > 0 ? (
          <form
            action={link}
            className="mt-4 flex items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="flex-1">
              <label
                htmlFor="exhibitor_id"
                className="block text-sm font-medium text-neutral-700"
              >
                Vincular expositor
              </label>
              <select
                id="exhibitor_id"
                name="exhibitor_id"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {available.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.company_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Vincular
            </button>
          </form>
        ) : (
          allExhibitors &&
          allExhibitors.length > 0 && (
            <p className="mt-4 text-sm text-neutral-500">
              Todos os expositores cadastrados já estão neste evento.
            </p>
          )
        )}
      </div>
    </div>
  );
}
