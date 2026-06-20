import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Baixa um documento: checa a sessão, gera um signed URL temporário do bucket
// privado e redireciona. O middleware já barra acesso sem login.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", docId)
    .single<{ storage_path: string }>();

  if (!doc) {
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
