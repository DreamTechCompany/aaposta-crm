import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type EventRow } from "@/lib/types";
import { EventForm } from "../../event-form";
import { updateEvent } from "../../actions";

export default async function EditarEventoPage({
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

  const action = updateEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Editar evento</h1>
      <div className="mt-6">
        <EventForm
          action={action}
          event={event}
          submitLabel="Salvar"
          error={error}
        />
      </div>
    </div>
  );
}
