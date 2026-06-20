import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Baixa um arquivo anexado numa resposta de formulário: checa a sessão, valida
// que o caminho realmente pertence a alguma submissão (evita IDOR — assinar um
// path arbitrário do bucket), gera um signed URL temporário e redireciona.
// O caminho vem na query porque esses arquivos vivem só no jsonb da submissão.
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

  // Uploads de formulário moram em `form-uploads/<formId>/...`. Restringe a esse
  // prefixo e extrai o formId pra limitar a busca de validação.
  const match = path.match(/^form-uploads\/([0-9a-f-]{36})\//i);
  if (!match) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }
  const formId = match[1];

  // Confere que esse path aparece de fato como anexo em alguma submissão do
  // formulário. Sem isso, qualquer autenticado assinaria qualquer objeto.
  const { data: submissions } = await supabase
    .from("form_submissions")
    .select("answers")
    .eq("form_id", formId);

  const known = (submissions ?? []).some((s) => {
    const answers = s.answers as Record<string, unknown> | null;
    if (!answers) return false;
    return Object.values(answers).some(
      (v) =>
        typeof v === "object" &&
        v !== null &&
        (v as { path?: unknown }).path === path,
    );
  });

  if (!known) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60, { download: true });

  if (error || !signed) {
    return NextResponse.json(
      { error: error?.message ?? "Falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
