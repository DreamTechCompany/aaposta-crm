import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Baixa um arquivo anexado numa resposta de formulário: checa a sessão, gera um
// signed URL temporário do bucket privado e redireciona. O caminho vem na query
// porque esses arquivos vivem só no jsonb da submissão (sem linha em documents).
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Caminho ausente" }, { status: 400 });
  }

  const { data: signed, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60);

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
