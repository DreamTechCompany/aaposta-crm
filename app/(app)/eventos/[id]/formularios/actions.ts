"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { FIELD_TYPES, fieldHasOptions, type FieldType } from "@/lib/types";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

const FIELD_TYPE_SET = new Set<string>(FIELD_TYPES);

// Cria um formulário para o evento e gera um public_slug único.
export async function createForm(eventId: string, formData: FormData) {
  const title = str(formData.get("title"));
  const description = nullable(formData.get("description"));
  const base = `/eventos/${eventId}/formularios`;

  if (!title) {
    redirect(`${base}/novo?error=` + encodeURIComponent("Título é obrigatório"));
  }

  const supabase = await createClient();
  const slugBase = slugify(title) || "formulario";
  let slug = slugBase;
  let formId: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("forms")
      .insert({
        event_id: eventId,
        title,
        description,
        public_slug: slug,
      })
      .select("id")
      .single();

    if (!error) {
      formId = data.id;
      break;
    }
    // 23505 = unique_violation (public_slug repetido) → tenta com sufixo
    if (error.code === "23505") {
      slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    redirect(`${base}/novo?error=` + encodeURIComponent(error.message));
  }

  if (!formId) {
    redirect(
      `${base}/novo?error=` +
        encodeURIComponent("Não foi possível criar o formulário"),
    );
  }

  revalidatePath(base);
  redirect(`${base}/${formId}`);
}

// Atualiza os metadados do formulário (título, descrição, ativo).
export async function updateForm(
  eventId: string,
  formId: string,
  formData: FormData,
) {
  const title = str(formData.get("title"));
  const description = nullable(formData.get("description"));
  const isActive = formData.get("is_active") === "on";
  const base = `/eventos/${eventId}/formularios/${formId}`;

  if (!title) {
    redirect(`${base}?error=` + encodeURIComponent("Título é obrigatório"));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("forms")
    .update({ title, description, is_active: isActive })
    .eq("id", formId);

  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(base);
  redirect(`${base}?saved=1`);
}

export async function deleteForm(eventId: string, formId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("forms").delete().eq("id", formId);

  const list = `/eventos/${eventId}/formularios`;
  if (error) {
    redirect(`${list}/${formId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(list);
  redirect(list);
}

export type FieldInput = {
  id?: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  is_required: boolean;
};

// Salva a lista de campos do formulário de uma vez (diff por id):
// atualiza os existentes, insere os novos, apaga os removidos. Preserva o id
// dos campos não mexidos pra não invalidar submissões já gravadas.
export async function saveFields(
  eventId: string,
  formId: string,
  fields: FieldInput[],
) {
  const base = `/eventos/${eventId}/formularios/${formId}`;
  const supabase = await createClient();

  // Sanitiza e valida.
  const clean = fields
    .map((f, index) => ({
      id: f.id,
      label: (f.label ?? "").trim(),
      field_type: f.field_type,
      options: fieldHasOptions(f.field_type)
        ? (f.options ?? []).map((o) => o.trim()).filter(Boolean)
        : null,
      is_required: Boolean(f.is_required),
      position: index,
    }))
    .filter((f) => f.label !== "");

  for (const f of clean) {
    if (!FIELD_TYPE_SET.has(f.field_type)) {
      return { error: `Tipo de campo inválido: ${f.field_type}` };
    }
    if (
      fieldHasOptions(f.field_type) &&
      (!f.options || f.options.length === 0)
    ) {
      return {
        error: `O campo "${f.label}" precisa de ao menos uma opção`,
      };
    }
  }

  // Apaga os campos que não estão mais na lista.
  const keepIds = clean.map((f) => f.id).filter(Boolean) as string[];
  const delQuery = supabase.from("form_fields").delete().eq("form_id", formId);
  const { error: delError } =
    keepIds.length > 0
      ? await delQuery.not("id", "in", `(${keepIds.join(",")})`)
      : await delQuery;

  if (delError) return { error: delError.message };

  // Atualiza existentes e insere novos.
  const toUpdate = clean.filter((f) => f.id);
  const toInsert = clean.filter((f) => !f.id);

  for (const f of toUpdate) {
    const { error } = await supabase
      .from("form_fields")
      .update({
        label: f.label,
        field_type: f.field_type,
        options: f.options,
        is_required: f.is_required,
        position: f.position,
      })
      .eq("id", f.id!);
    if (error) return { error: error.message };
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("form_fields").insert(
      toInsert.map((f) => ({
        form_id: formId,
        label: f.label,
        field_type: f.field_type,
        options: f.options,
        is_required: f.is_required,
        position: f.position,
      })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath(base);
  return { error: null };
}
