import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type FormRow,
  type FormFieldRow,
  type FormSubmissionRow,
} from "@/lib/types";

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("pt-BR");
}

export default async function SubmissoesPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const { id, formId } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("event_id", id)
    .single<FormRow>();

  if (!form) notFound();

  const { data: fieldsData } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true });

  const fields = (fieldsData ?? []) as FormFieldRow[];

  const { data: subsData } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });

  const submissions = (subsData ?? []) as FormSubmissionRow[];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/eventos/${id}/formularios/${formId}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← {form.title}
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Respostas ({submissions.length})
      </h1>

      {submissions.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Nenhuma resposta recebida ainda.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <p className="text-xs text-neutral-400">
                {formatDateTime(sub.submitted_at)}
              </p>
              <dl className="mt-3 divide-y divide-neutral-100 text-sm">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex justify-between gap-6 py-2"
                  >
                    <dt className="text-neutral-500">{field.label}</dt>
                    <dd className="text-right text-neutral-900">
                      {formatAnswer(sub.answers[field.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
