import { EventForm } from "../event-form";
import { createEvent } from "../actions";

export default async function NovoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Novo evento</h1>
      <div className="mt-6">
        <EventForm action={createEvent} submitLabel="Criar evento" error={error} />
      </div>
    </div>
  );
}
