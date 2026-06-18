import { isFileAnswer } from "@/lib/types";

// Renderiza o valor de uma resposta de formulário. Campos 'file' viram um link
// de download (signed URL servido por /api/arquivo); o resto vira texto.
export function AnswerValue({ value }: { value: unknown }) {
  if (isFileAnswer(value)) {
    return (
      <a
        href={`/api/arquivo?path=${encodeURIComponent(value.path)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-900 underline hover:no-underline"
      >
        {value.name}
      </a>
    );
  }
  if (value === null || value === undefined || value === "") return <>—</>;
  if (Array.isArray(value)) return <>{value.join(", ")}</>;
  if (typeof value === "boolean") return <>{value ? "Sim" : "Não"}</>;
  return <>{String(value)}</>;
}
