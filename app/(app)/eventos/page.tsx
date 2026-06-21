import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type EventRow } from "@/lib/types";
import { EventsList, type EventCard } from "./events-list";

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: eventsData, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const events = (eventsData ?? []) as EventRow[];
  const eventIds = events.map((e) => e.id);

  // Total de etapas do pipeline (global) — usado pra desenhar o progresso.
  const { data: stagesData } = await supabase
    .from("pipeline_stages")
    .select("position");
  const totalStages = Math.max(
    1,
    ...((stagesData ?? []) as { position: number }[]).map((s) => s.position + 1),
  );

  // Status do evento no pipeline = etapa mais atrasada (gargalo) entre os
  // expositores, com quem está segurando o avanço.
  const byEvent = new Map<string, EventCard["bottleneck"]>();
  if (eventIds.length > 0) {
    const { data: eeData } = await supabase
      .from("event_exhibitors")
      .select(
        "event_id, stage:pipeline_stages(position, name), exhibitor:exhibitors(company_name)",
      )
      .in("event_id", eventIds);

    type Row = {
      event_id: string;
      stage: { position: number; name: string } | null;
      exhibitor: { company_name: string } | null;
    };
    const rows = (eeData ?? []) as unknown as Row[];

    for (const e of events) {
      const mine = rows.filter((r) => r.event_id === e.id);
      if (mine.length === 0) {
        byEvent.set(e.id, null);
        continue;
      }
      // Etapa menos avançada (menor position). Stage nulo conta como "início".
      const minPos = Math.min(...mine.map((r) => r.stage?.position ?? 0));
      const atMin = mine.filter((r) => (r.stage?.position ?? 0) === minPos);
      const stageName = atMin[0].stage?.name ?? "Interesse";
      const holding = atMin.map((r) => r.exhibitor?.company_name ?? "Cliente");
      byEvent.set(e.id, {
        stageName,
        done: stageName === "Concluído",
        holding,
        position: minPos,
        exhibitorCount: mine.length,
      });
    }
  }

  const cards: EventCard[] = events.map((e) => ({
    id: e.id,
    name: e.name,
    location: e.location,
    startsAt: e.starts_at,
    bottleneck: byEvent.get(e.id) ?? null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Eventos
        </h1>
        <Link
          href="/eventos/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Novo evento
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Erro ao carregar eventos: {error.message}
        </p>
      )}

      {!error && events.length === 0 && (
        <p className="mt-16 text-center text-sm text-slate-500">
          Nenhum evento ainda. Crie o primeiro.
        </p>
      )}

      {cards.length > 0 && (
        <EventsList cards={cards} totalStages={totalStages} />
      )}
    </div>
  );
}
