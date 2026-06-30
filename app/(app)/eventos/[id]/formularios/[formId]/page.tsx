import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type FormRow, type FormFieldRow } from "@/lib/types";
import { deleteForm } from "../actions";
import { FieldBuilder } from "./field-builder";
import { PublicLink } from "./public-link";

export default async function FormularioBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; formId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, formId } = await params;
  const { error } = await searchParams;
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

      <PublicLink slug={form.public_slug} isActive={form.is_active} />

      {/* Editor do formulário: dados + campos, um único salvar */}
      <div className="mt-8">
        <p className="text-sm text-neutral-500">
          Edite os dados e monte os campos que o cliente vai preencher. Reordene
          com as setas e clique em <strong>Salvar formulário</strong> — salva
          tudo de uma vez.
        </p>
        <div className="mt-4">
          <FieldBuilder
            eventId={id}
            formId={formId}
            initialTitle={form.title}
            initialDescription={form.description ?? ""}
            initialIsActive={form.is_active}
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
