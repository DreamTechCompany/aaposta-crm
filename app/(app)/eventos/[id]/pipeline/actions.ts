"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Move um card (event_exhibitor) para outra etapa do pipeline.
export async function moveCard(
  eventExhibitorId: string,
  stageId: string,
  eventId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_exhibitors")
    .update({ stage_id: stageId })
    .eq("id", eventExhibitorId);

  if (error) throw new Error(error.message);

  revalidatePath(`/eventos/${eventId}/pipeline`);
  revalidatePath(`/eventos/${eventId}`);
}
