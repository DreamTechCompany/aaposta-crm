import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type EventRow, type FormRow } from "@/lib/types";

export default async function FormulariosPage({
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

  const { data: formsData } = await supabase
    .from("forms")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const forms = (formsData ?? []) as FormRow[];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/eventos/${id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← {event.name}
      </Link>

      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Formulários</h1>
        <Link
          href={`/eventos/${id}/formularios/novo`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Novo formulário
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Nenhum formulário criado para este evento ainda.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
          {forms.map((form) => (
            <li
              key={form.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <Link
                  href={`/eventos/${id}/formularios/${form.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {form.title}
                </Link>
                <span className="ml-2 text-xs text-neutral-400">
                  /f/{form.public_slug}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  form.is_active
                    ? "bg-green-50 text-green-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {form.is_active ? "Ativo" : "Inativo"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
