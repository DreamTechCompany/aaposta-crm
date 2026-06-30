"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceStage, STAGE_CONTRATO_ASSINADO } from "@/lib/pipeline";
import { validateUpload } from "@/lib/upload";
import { EXHIBITOR_UPLOAD_KINDS } from "@/lib/types";

function safeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);
}

const KIND_SET = new Set<string>(EXHIBITOR_UPLOAD_KINDS);

// Recebe um documento do expositor anônimo pelo portal. Roda com a service role
// (ignora RLS); a autorização é o próprio token da participação. O expositor
// escolhe o tipo (contrato assinado, CPE, comprovante, outro) e pode subir
// vários — cada envio grava um documento com direction "recebido".
export async function submitDocument(token: string, formData: FormData) {
  const base = `/u/${token}`;
  const kindRaw = formData.get("kind");
  const kind = typeof kindRaw === "string" && KIND_SET.has(kindRaw)
    ? kindRaw
    : "outro";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione um arquivo"));
  }
  const check = validateUpload(file);
  if (!check.ok) {
    redirect(`${base}?error=` + encodeURIComponent(check.reason));
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

  const path = `${ee.id}/${kind}-${Date.now()}-${safeName(file.name)}`;

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
    kind,
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
  if (kind === "contrato_assinado") {
    await advanceStage(supabase, ee.id, STAGE_CONTRATO_ASSINADO);
  }

  redirect(`${base}?sent=1`);
}
