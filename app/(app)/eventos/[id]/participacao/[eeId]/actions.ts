"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/types";

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

  revalidatePath(base);
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
