"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

type EventInput = {
  name: string;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
  notes: string | null;
};

function readForm(formData: FormData): EventInput {
  return {
    name: str(formData.get("name")),
    location: nullable(formData.get("location")),
    starts_at: nullable(formData.get("starts_at")),
    ends_at: nullable(formData.get("ends_at")),
    status: str(formData.get("status")) || "planejamento",
    notes: nullable(formData.get("notes")),
  };
}

export async function createEvent(formData: FormData) {
  const input = readForm(formData);
  if (!input.name) {
    redirect("/eventos/novo?error=" + encodeURIComponent("Nome é obrigatório"));
  }

  const supabase = await createClient();
  const base = slugify(input.name) || "evento";
  let slug = base;
  let id: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...input, slug })
      .select("id")
      .single();

    if (!error) {
      id = data.id;
      break;
    }
    // 23505 = unique_violation (slug repetido) → tenta com sufixo
    if (error.code === "23505") {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    redirect("/eventos/novo?error=" + encodeURIComponent(error.message));
  }

  if (!id) {
    redirect(
      "/eventos/novo?error=" +
        encodeURIComponent("Não foi possível criar o evento"),
    );
  }

  revalidatePath("/eventos");
  redirect(`/eventos/${id}`);
}

export async function updateEvent(id: string, formData: FormData) {
  const input = readForm(formData);
  if (!input.name) {
    redirect(
      `/eventos/${id}/editar?error=` +
        encodeURIComponent("Nome é obrigatório"),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(input).eq("id", id);

  if (error) {
    redirect(`/eventos/${id}/editar?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    redirect(`/eventos/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/eventos");
  redirect("/eventos");
}

// Vincula um expositor ao evento (cria o card do pipeline na 1ª etapa).
export async function linkExhibitor(eventId: string, formData: FormData) {
  const exhibitorId = str(formData.get("exhibitor_id"));
  if (!exhibitorId) {
    redirect(
      `/eventos/${eventId}?error=` +
        encodeURIComponent("Selecione um lead"),
    );
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
        ? "Esse lead já está vinculado ao evento"
        : error.message;
    redirect(`/eventos/${eventId}?error=` + encodeURIComponent(msg));
  }

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
}

// Remove o vínculo de um expositor com o evento (apaga o card do pipeline).
export async function unlinkExhibitor(
  eventId: string,
  eventExhibitorId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_exhibitors")
    .delete()
    .eq("id", eventExhibitorId);

  if (error) {
    redirect(`/eventos/${eventId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/eventos/${eventId}`);
  redirect(`/eventos/${eventId}`);
}
