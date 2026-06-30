import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Download público de um documento pelo portal do expositor. Sem login: a
// autorização é o token da participação. Só libera documentos enviados PELA
// organização (direction "enviado") que pertençam àquela participação — nunca
// expõe um path arbitrário do bucket.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string; docId: string }> },
) {
  const { token, docId } = await params;
  const supabase = createAdminClient();

  const { data: ee } = await supabase
    .from("event_exhibitors")
    .select("id")
    .eq("public_token", token)
    .maybeSingle<{ id: string }>();

  if (!ee) {
    return NextResponse.json({ error: "Link inválido" }, { status: 404 });
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path, direction, event_exhibitor_id")
    .eq("id", docId)
    .maybeSingle<{
      storage_path: string;
      direction: string;
      event_exhibitor_id: string;
    }>();

  if (!doc || doc.event_exhibitor_id !== ee.id || doc.direction !== "enviado") {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 },
    );
  }

  const { data: signed, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60, { download: true });

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
