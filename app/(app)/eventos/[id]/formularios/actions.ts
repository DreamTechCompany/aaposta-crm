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

export type FormMeta = {
  title: string;
  description: string | null;
  is_active: boolean;
};

// Salva o formulário inteiro de uma vez: metadados (título, descrição, ativo) +
// a lista de campos (diff por id — atualiza existentes, insere novos, apaga
// removidos). Preserva o id dos campos não mexidos pra não invalidar submissões
// já gravadas. Um único save evita a confusão de dois botões separados.
export async function saveForm(
  eventId: string,
  formId: string,
  meta: FormMeta,
  fields: FieldInput[],
) {
  const base = `/eventos/${eventId}/formularios/${formId}`;
  const supabase = await createClient();

  const title = (meta.title ?? "").trim();
  if (!title) {
    return { error: "Título é obrigatório" };
  }

  const { error: metaError } = await supabase
    .from("forms")
    .update({
      title,
      description: (meta.description ?? "")?.trim() || null,
      is_active: Boolean(meta.is_active),
    })
    .eq("id", formId);

  if (metaError) return { error: metaError.message };

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
