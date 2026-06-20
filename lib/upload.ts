// Validação de uploads vindos de origem anônima (formulário público e link de
// contrato). Só aceitamos PDF e imagens comuns — evita que um expositor suba
// um .html/.svg que vire XSS armazenado ao ser aberto via signed URL.

// Tamanho máximo defensivo: 15 MB.
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// content-type → extensão canônica permitida.
const ALLOWED: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const ALLOWED_EXTENSIONS = new Set(Object.values(ALLOWED));

export type UploadCheck =
  | { ok: true }
  | { ok: false; reason: string };

// Valida tamanho, content-type e extensão de um arquivo enviado.
export function validateUpload(file: File): UploadCheck {
  if (file.size === 0) {
    return { ok: false, reason: "Arquivo vazio" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "Arquivo acima de 15 MB" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk = file.type in ALLOWED;
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  // Exige que tipo e extensão sejam permitidos e coerentes entre si.
  if (!typeOk || !extOk) {
    return {
      ok: false,
      reason: "Formato não permitido. Envie PDF ou imagem (png, jpg, webp, gif).",
    };
  }

  return { ok: true };
}
