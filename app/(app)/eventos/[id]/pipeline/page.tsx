import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type EventRow, type ExhibitorRow } from "@/lib/types";
import { KanbanBoard } from "./kanban-board";

type CardRow = {
  id: string;
  stage_id: string | null;
  exhibitor: Pick<ExhibitorRow, "id" | "company_name" | "contact_name"> | null;
};

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", id)
    .single<Pick<EventRow, "id" | "name">>();

  if (!event) notFound();

  const { data: stagesData } = await supabase
    .from("pipeline_stages")
    .select("id, name, position")
    .order("position", { ascending: true });

  const stages = (stagesData ?? []).map((s) => ({ id: s.id, name: s.name }));

  const { data: cardsData } = await supabase
    .from("event_exhibitors")
    .select("id, stage_id, exhibitor:exhibitors(id, company_name, contact_name)")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const cards = ((cardsData ?? []) as unknown as CardRow[]).map((c) => ({
    id: c.id,
    stageId: c.stage_id,
    companyName: c.exhibitor?.company_name ?? "Expositor removido",
    contactName: c.exhibitor?.contact_name ?? null,
  }));

  return (
    <div>
      <Link
        href={`/eventos/${id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← {event.name}
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Arraste cada expositor entre as etapas para atualizar o status.
      </p>

      {cards.length === 0 ? (
        <p className="mt-16 text-center text-sm text-neutral-500">
          Nenhum expositor vinculado a este evento ainda. Vincule na{" "}
          <Link
            href={`/eventos/${id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            página do evento
          </Link>
          .
        </p>
      ) : (
        <KanbanBoard eventId={id} stages={stages} cards={cards} />
      )}
    </div>
  );
}
