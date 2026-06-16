import { type SupabaseClient } from "@supabase/supabase-js";

// Nomes das etapas que a automação usa (seed em 0001_init.sql).
export const STAGE_DADOS_COLETADOS = "Dados coletados";
export const STAGE_CONTRATO_ENVIADO = "Contrato enviado";
export const STAGE_CONTRATO_ASSINADO = "Contrato assinado";

// Avança o card (event_exhibitor) para a etapa alvo — só para frente, nunca
// puxa de volta. Tolerante a falha: se a etapa não existir (renomeada) ou der
// erro, apenas ignora, sem quebrar o fluxo que disparou.
export async function advanceStage(
  supabase: SupabaseClient,
  eeId: string,
  targetStageName: string,
): Promise<void> {
  try {
    const { data: target } = await supabase
      .from("pipeline_stages")
      .select("id, position")
      .eq("name", targetStageName)
      .maybeSingle();
    if (!target) return;

    const { data: ee } = await supabase
      .from("event_exhibitors")
      .select("stage_id")
      .eq("id", eeId)
      .maybeSingle();
    if (!ee) return;

    let currentPosition = 0;
    if (ee.stage_id) {
      const { data: current } = await supabase
        .from("pipeline_stages")
        .select("position")
        .eq("id", ee.stage_id)
        .maybeSingle();
      currentPosition = current?.position ?? 0;
    }

    // Só avança se a etapa alvo for mais adiante que a atual.
    if (currentPosition < target.position) {
      await supabase
        .from("event_exhibitors")
        .update({ stage_id: target.id })
        .eq("id", eeId);
    }
  } catch {
    // automação é best-effort — não derruba o fluxo principal
  }
}
