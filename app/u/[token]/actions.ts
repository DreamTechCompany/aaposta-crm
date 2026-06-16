"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceStage, STAGE_CONTRATO_ASSINADO } from "@/lib/pipeline";

function safeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);
}

// Recebe o contrato assinado do expositor anônimo. Roda com a service role
// (ignora RLS); a autorização é o próprio token da participação.
export async function submitSignedDocument(token: string, formData: FormData) {
  const base = `/u/${token}`;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione um arquivo"));
  }
  // Limite defensivo de 15 MB.
  if (file.size > 15 * 1024 * 1024) {
    redirect(`${base}?error=` + encodeURIComponent("Arquivo acima de 15 MB"));
  }

  const supabase = createAdminClient();

  const { data: ee } = await supabase
    .from("event_exhibitors")
    .select("id")
    .eq("public_token", token)
    .maybeSingle<{ id: string }>();

  if (!ee) {
    redirect(`${base}?error=` + encodeURIComponent("Link inválido"));
  }

  const path = `${ee.id}/signed-${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    redirect(`${base}?error=` + encodeURIComponent(uploadError.message));
  }

  const { error: insertError } = await supabase.from("documents").insert({
    event_exhibitor_id: ee.id,
    kind: "contrato_assinado",
    direction: "recebido",
    storage_path: path,
    file_name: file.name,
    status: "recebido",
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([path]);
    redirect(`${base}?error=` + encodeURIComponent(insertError.message));
  }

  // Receber o contrato assinado avança o card para "Contrato assinado".
  await advanceStage(supabase, ee.id, STAGE_CONTRATO_ASSINADO);

  redirect(`${base}?sent=1`);
}
