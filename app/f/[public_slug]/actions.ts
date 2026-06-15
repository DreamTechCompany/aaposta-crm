"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type FormFieldRow } from "@/lib/types";

// Recebe a submissão pública (expositor anônimo). O RLS libera leitura de form
// ativo + insert de submissão pra role anon.
export async function submitPublicForm(slug: string, formData: FormData) {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id, is_active")
    .eq("public_slug", slug)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (!form || !form.is_active) {
    redirect(`/f/${slug}?error=` + encodeURIComponent("Formulário indisponível"));
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
          `/f/${slug}?error=` +
            encodeURIComponent(`Preencha o campo obrigatório: ${field.label}`),
        );
      }
    }

    answers[field.id] = value;
  }

  const { error } = await supabase.from("form_submissions").insert({
    form_id: form.id,
    answers,
  });

  if (error) {
    redirect(`/f/${slug}?error=` + encodeURIComponent(error.message));
  }

  redirect(`/f/${slug}?sent=1`);
}
