"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

type ExhibitorInput = {
  company_name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
};

function readForm(formData: FormData): ExhibitorInput {
  return {
    company_name: str(formData.get("company_name")),
    cnpj: nullable(formData.get("cnpj")),
    contact_name: nullable(formData.get("contact_name")),
    contact_email: nullable(formData.get("contact_email")),
    contact_phone: nullable(formData.get("contact_phone")),
    notes: nullable(formData.get("notes")),
  };
}

export async function createExhibitor(formData: FormData) {
  const input = readForm(formData);
  if (!input.company_name) {
    redirect(
      "/expositores/novo?error=" +
        encodeURIComponent("Nome da empresa é obrigatório"),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitors")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    redirect("/expositores/novo?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/expositores");
  redirect(`/expositores/${data.id}`);
}

export async function updateExhibitor(id: string, formData: FormData) {
  const input = readForm(formData);
  if (!input.company_name) {
    redirect(
      `/expositores/${id}/editar?error=` +
        encodeURIComponent("Nome da empresa é obrigatório"),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("exhibitors")
    .update(input)
    .eq("id", id);

  if (error) {
    redirect(
      `/expositores/${id}/editar?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath("/expositores");
  revalidatePath(`/expositores/${id}`);
  redirect(`/expositores/${id}`);
}

// Vincula este lead a um evento (cria o card do pipeline na 1ª etapa). Permite
// trazer um lead solto pra dentro de um evento sem passar pela tela do evento.
export async function linkExhibitorToEvent(
  exhibitorId: string,
  formData: FormData,
) {
  const base = `/expositores/${exhibitorId}`;
  const eventId = str(formData.get("event_id"));
  if (!eventId) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione um evento"));
  }

  const supabase = await createClient();
  const { data: stage } = await supabase
    .from("pipeline_stages")
    .select("id")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("event_exhibitors").insert({
    event_id: eventId,
    exhibitor_id: exhibitorId,
    stage_id: stage?.id ?? null,
  });

  if (error) {
    // 23505 = unique_violation (event_id, exhibitor_id) → já vinculado
    const msg =
      error.code === "23505"
        ? "Esse lead já está vinculado a esse evento"
        : error.message;
    redirect(`${base}?error=` + encodeURIComponent(msg));
  }

  revalidatePath(base);
  revalidatePath(`/eventos/${eventId}`);
  redirect(base);
}

export async function deleteExhibitor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exhibitors").delete().eq("id", id);

  if (error) {
    // FK on delete restrict: lead vinculado a evento não pode ser excluído.
    const msg =
      error.code === "23503"
        ? "Esse lead está vinculado a um ou mais eventos. Desvincule antes de excluir."
        : error.message;
    redirect(`/expositores/${id}?error=` + encodeURIComponent(msg));
  }

  revalidatePath("/expositores");
  redirect("/expositores");
}
