import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type FormRow, type FormFieldRow } from "@/lib/types";
import { updateForm, deleteForm } from "../actions";
import { FieldBuilder } from "./field-builder";
import { PublicLink } from "./public-link";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

export default async function FormularioBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; formId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id, formId } = await params;
  const { error, saved } = await searchParams;
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

  const { count: submissionsCount } = await supabase
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId);

  const update = updateForm.bind(null, id, formId);
  const del = deleteForm.bind(null, id, formId);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/eventos/${id}/formularios`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Formulários
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        {form.title}
      </h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Formulário salvo.
        </p>
      )}

      <PublicLink slug={form.public_slug} isActive={form.is_active} />

      {/* Metadados do formulário */}
      <form action={update} className="mt-8 space-y-5">
        <div>
          <label className={labelClass} htmlFor="title">
            Título *
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={form.title}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={form.description ?? ""}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={form.is_active}
          />
          Formulário ativo (aceita respostas no link público)
        </label>
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Salvar dados do formulário
        </button>
      </form>

      {/* Construtor de campos */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Campos</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Monte os campos que o lead vai preencher. Arraste a ordem com as
          setas e clique em salvar.
        </p>
        <div className="mt-4">
          <FieldBuilder
            eventId={id}
            formId={formId}
            initialFields={fields}
          />
        </div>
      </div>

      {/* Submissões e exclusão */}
      <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link
          href={`/eventos/${id}/formularios/${formId}/submissoes`}
          className="text-sm font-medium text-neutral-900 hover:underline"
        >
          Ver respostas ({submissionsCount ?? 0})
        </Link>
        <form action={del}>
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Excluir formulário
          </button>
        </form>
      </div>
    </div>
  );
}
