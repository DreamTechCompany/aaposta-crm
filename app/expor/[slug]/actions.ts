"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

// Auto-cadastro público de expositor por evento: cria a empresa e já vincula ao
// evento na 1ª etapa do pipeline. Roda com service role (sem sessão); a
// autorização é o slug do evento compartilhado pela AAposta.
export async function registerExhibitor(slug: string, formData: FormData) {
  const base = `/expor/${slug}`;
  const company_name = str(formData.get("company_name"));
  if (!company_name) {
    redirect(`${base}?error=` + encodeURIComponent("Nome da empresa é obrigatório"));
  }

  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (!event) {
    redirect(`${base}?error=` + encodeURIComponent("Evento não encontrado"));
  }

  // Cria o expositor.
  const { data: exhibitor, error: exhibitorError } = await supabase
    .from("exhibitors")
    .insert({
      company_name,
      cnpj: nullable(formData.get("cnpj")),
      contact_name: nullable(formData.get("contact_name")),
      contact_email: nullable(formData.get("contact_email")),
      contact_phone: nullable(formData.get("contact_phone")),
      notes: nullable(formData.get("notes")),
    })
    .select("id")
    .single();

  if (exhibitorError) {
    redirect(`${base}?error=` + encodeURIComponent(exhibitorError.message));
  }

  // Vincula ao evento na 1ª etapa do pipeline.
  const { data: stage } = await supabase
    .from("pipeline_stages")
    .select("id")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error: linkError } = await supabase.from("event_exhibitors").insert({
    event_id: event.id,
    exhibitor_id: exhibitor.id,
    stage_id: stage?.id ?? null,
  });

  if (linkError) {
    redirect(`${base}?error=` + encodeURIComponent(linkError.message));
  }

  redirect(`${base}?sent=1`);
}
