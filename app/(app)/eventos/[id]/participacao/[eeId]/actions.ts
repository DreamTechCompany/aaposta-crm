"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/types";
import {
  advanceStage,
  STAGE_DADOS_COLETADOS,
  STAGE_CONTRATO_ENVIADO,
} from "@/lib/pipeline";

const KIND_SET = new Set<string>(DOCUMENT_KINDS);

// Sanitiza o nome do arquivo pra um path de storage seguro.
function safeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 120);
}

// Upload de um documento da AAposta para o expositor (direction = enviado).
export async function uploadDocument(
  eventId: string,
  eeId: string,
  formData: FormData,
) {
  const base = `/eventos/${eventId}/participacao/${eeId}`;
  const kind = String(formData.get("kind") ?? "");
  const file = formData.get("file");

  if (!KIND_SET.has(kind)) {
    redirect(`${base}?error=` + encodeURIComponent("Tipo de documento inválido"));
  }
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione um arquivo"));
  }

  const supabase = await createClient();
  const path = `${eeId}/${Date.now()}-${safeName(file.name)}`;

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
    event_exhibitor_id: eeId,
    kind: kind as DocumentKind,
    direction: "enviado",
    storage_path: path,
    file_name: file.name,
    status: "enviado",
  });

  if (insertError) {
    // Limpa o arquivo órfão se a linha não gravou.
    await supabase.storage.from("documents").remove([path]);
    redirect(`${base}?error=` + encodeURIComponent(insertError.message));
  }

  // Enviar o contrato avança o card para "Contrato enviado".
  if (kind === "contrato") {
    await advanceStage(supabase, eeId, STAGE_CONTRATO_ENVIADO);
  }

  revalidatePath(base);
  revalidatePath(`/eventos/${eventId}`);
  redirect(base);
}

export async function deleteDocument(
  eventId: string,
  eeId: string,
  docId: string,
) {
  const base = `/eventos/${eventId}/participacao/${eeId}`;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", docId)
    .single<{ storage_path: string }>();

  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error.message));
  }

  if (doc?.storage_path) {
    await supabase.storage.from("documents").remove([doc.storage_path]);
  }

  revalidatePath(base);
  redirect(base);
}

// Liga uma submissão do formulário a esta participação (preenche
// event_exhibitor_id). É a origem dos dados operacionais do contrato.
export async function linkSubmission(
  eventId: string,
  eeId: string,
  formData: FormData,
) {
  const base = `/eventos/${eventId}/participacao/${eeId}`;
  const submissionId = String(formData.get("submission_id") ?? "").trim();
  if (!submissionId) {
    redirect(`${base}?error=` + encodeURIComponent("Selecione uma submissão"));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("form_submissions")
    .update({ event_exhibitor_id: eeId })
    .eq("id", submissionId);

  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error.message));
  }

  // Vincular a submissão (dados do formulário) avança para "Dados coletados".
  await advanceStage(supabase, eeId, STAGE_DADOS_COLETADOS);

  revalidatePath(base);
  revalidatePath(`/eventos/${eventId}`);
  redirect(base);
}

export async function unlinkSubmission(
  eventId: string,
  eeId: string,
  submissionId: string,
) {
  const base = `/eventos/${eventId}/participacao/${eeId}`;
  const supabase = await createClient();
  const { error } = await supabase
    .from("form_submissions")
    .update({ event_exhibitor_id: null })
    .eq("id", submissionId);

  if (error) {
    redirect(`${base}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(base);
  redirect(base);
}
