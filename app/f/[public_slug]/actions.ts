"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceStage, STAGE_DADOS_COLETADOS } from "@/lib/pipeline";
import { type FormFieldRow } from "@/lib/types";

// Recebe a submissão pública. O RLS libera leitura de form ativo + insert pra
// role anon. Se vier o token de expositor (?e=), a submissão já nasce vinculada
// à participação e avança o pipeline — usando a service role pra resolver o
// token (anon não enxerga event_exhibitors).
export async function submitPublicForm(slug: string, formData: FormData) {
  const supabase = await createClient();
  const eToken = String(formData.get("e") ?? "").trim();

  // Monta URLs de retorno preservando o token (se houver).
  const base = eToken
    ? `/f/${slug}?e=${encodeURIComponent(eToken)}`
    : `/f/${slug}`;
  const sep = eToken ? "&" : "?";
  const back = (extra: string) => `${base}${sep}${extra}`;

  const { data: form } = await supabase
    .from("forms")
    .select("id, is_active, event_id")
    .eq("public_slug", slug)
    .maybeSingle<{ id: string; is_active: boolean; event_id: string }>();

  if (!form || !form.is_active) {
    redirect(back("error=" + encodeURIComponent("Formulário indisponível")));
  }

  const { data: fieldsData } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  const fields = (fieldsData ?? []) as FormFieldRow[];

  const answers: Record<string, unknown> = {};

  for (const field of fields) {
    const key = `field_${field.id}`;
    let value: unknown;

    if (field.field_type === "multiselect") {
      value = formData.getAll(key).map((v) => String(v));
    } else if (field.field_type === "checkbox") {
      value = formData.get(key) === "on";
    } else {
      value = String(formData.get(key) ?? "").trim();
    }

    if (field.is_required) {
      const empty =
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        redirect(
          back(
            "error=" +
              encodeURIComponent(`Preencha o campo obrigatório: ${field.label}`),
          ),
        );
      }
    }

    answers[field.id] = value;
  }

  // Resolve o token do expositor, se válido e do mesmo evento do formulário.
  let linkedEeId: string | null = null;
  if (eToken) {
    const admin = createAdminClient();
    const { data: ee } = await admin
      .from("event_exhibitors")
      .select("id, event_id")
      .eq("public_token", eToken)
      .maybeSingle<{ id: string; event_id: string }>();
    if (ee && ee.event_id === form.event_id) {
      linkedEeId = ee.id;
    }
  }

  if (linkedEeId) {
    // Submissão já vinculada ao expositor (via service role).
    const admin = createAdminClient();
    const { error } = await admin.from("form_submissions").insert({
      form_id: form.id,
      event_exhibitor_id: linkedEeId,
      answers,
    });
    if (error) {
      redirect(back("error=" + encodeURIComponent(error.message)));
    }
    // Preencher o formulário avança o card para "Dados coletados".
    await advanceStage(admin, linkedEeId, STAGE_DADOS_COLETADOS);
  } else {
    const { error } = await supabase.from("form_submissions").insert({
      form_id: form.id,
      answers,
    });
    if (error) {
      redirect(back("error=" + encodeURIComponent(error.message)));
    }
  }

  redirect(back("sent=1"));
}
