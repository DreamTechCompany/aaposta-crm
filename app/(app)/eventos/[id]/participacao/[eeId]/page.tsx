import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_KINDS,
  documentKindLabel,
  documentStatusLabel,
  type DocumentRow,
  type ExhibitorRow,
} from "@/lib/types";
import { uploadDocument, deleteDocument } from "./actions";

const inputClass =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

type Participation = {
  id: string;
  event: { id: string; name: string } | null;
  exhibitor: Pick<
    ExhibitorRow,
    "id" | "company_name" | "contact_name" | "contact_email"
  > | null;
  stage: { name: string } | null;
};

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("pt-BR");
}

export default async function ParticipacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; eeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, eeId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: ee } = await supabase
    .from("event_exhibitors")
    .select(
      "id, event:events(id, name), exhibitor:exhibitors(id, company_name, contact_name, contact_email), stage:pipeline_stages(name)",
    )
    .eq("id", eeId)
    .eq("event_id", id)
    .single();

  const participation = ee as unknown as Participation | null;
  if (!participation) notFound();

  const { data: docsData } = await supabase
    .from("documents")
    .select("*")
    .eq("event_exhibitor_id", eeId)
    .order("uploaded_at", { ascending: false });

  const documents = (docsData ?? []) as DocumentRow[];
  const upload = uploadDocument.bind(null, id, eeId);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/eventos/${id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← {participation.event?.name ?? "Evento"}
      </Link>

      <div className="mt-1 flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {participation.exhibitor?.company_name ?? "Expositor removido"}
        </h1>
        {participation.stage && (
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
            {participation.stage.name}
          </span>
        )}
      </div>
      {participation.exhibitor?.contact_name && (
        <p className="mt-1 text-sm text-neutral-500">
          {participation.exhibitor.contact_name}
          {participation.exhibitor.contact_email &&
            ` · ${participation.exhibitor.contact_email}`}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Documentos */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Documentos</h2>

        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Nenhum documento enviado a este expositor ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {documents.map((doc) => {
              const del = deleteDocument.bind(null, id, eeId, doc.id);
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <a
                      href={`/api/documentos/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {doc.file_name ?? doc.storage_path}
                    </a>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                        {documentKindLabel(doc.kind)}
                      </span>
                      <span>{documentStatusLabel(doc.status)}</span>
                      <span>· {formatDateTime(doc.uploaded_at)}</span>
                    </div>
                  </div>
                  <form action={del}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        {/* Enviar novo documento */}
        <form
          action={upload}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <div>
            <label
              htmlFor="kind"
              className="block text-sm font-medium text-neutral-700"
            >
              Tipo
            </label>
            <select
              id="kind"
              name="kind"
              defaultValue="contrato"
              className={`mt-1 ${inputClass}`}
            >
              {DOCUMENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {documentKindLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-neutral-700"
            >
              Arquivo
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              className={`mt-1 w-full ${inputClass}`}
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
