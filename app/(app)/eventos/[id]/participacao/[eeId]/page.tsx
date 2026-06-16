import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_KINDS,
  documentKindLabel,
  documentStatusLabel,
  type DocumentRow,
  type ExhibitorRow,
  type FormFieldRow,
  type FormSubmissionRow,
} from "@/lib/types";
import {
  uploadDocument,
  deleteDocument,
  linkSubmission,
  unlinkSubmission,
} from "./actions";
import { UploadLink } from "./upload-link";

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

const inputClass =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

type Participation = {
  id: string;
  public_token: string;
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
      "id, public_token, event:events(id, name), exhibitor:exhibitors(id, company_name, contact_name, contact_email), stage:pipeline_stages(name)",
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

  // Submissões dos formulários deste evento, pra origem dos dados operacionais.
  const { data: formsData } = await supabase
    .from("forms")
    .select("id, title")
    .eq("event_id", id);
  const forms = (formsData ?? []) as { id: string; title: string }[];
  const formIds = forms.map((f) => f.id);
  const formTitleById = new Map(forms.map((f) => [f.id, f.title]));

  let linkedSubmissions: FormSubmissionRow[] = [];
  let availableSubmissions: FormSubmissionRow[] = [];
  const fieldsByForm = new Map<string, FormFieldRow[]>();

  if (formIds.length > 0) {
    const { data: subsData } = await supabase
      .from("form_submissions")
      .select("*")
      .in("form_id", formIds)
      .order("submitted_at", { ascending: false });
    const subs = (subsData ?? []) as FormSubmissionRow[];
    linkedSubmissions = subs.filter((s) => s.event_exhibitor_id === eeId);
    availableSubmissions = subs.filter((s) => s.event_exhibitor_id === null);

    const { data: fieldsData } = await supabase
      .from("form_fields")
      .select("*")
      .in("form_id", formIds)
      .order("position", { ascending: true });
    for (const field of (fieldsData ?? []) as FormFieldRow[]) {
      const list = fieldsByForm.get(field.form_id) ?? [];
      list.push(field);
      fieldsByForm.set(field.form_id, list);
    }
  }

  const linkSub = linkSubmission.bind(null, id, eeId);

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

      <div className="mt-4">
        <Link
          href={`/contrato/${eeId}`}
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Gerar contrato
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <UploadLink token={participation.public_token} />

      {/* Dados do formulário (origem dos dados operacionais do contrato) */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Dados do formulário
        </h2>

        {linkedSubmissions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            Nenhuma submissão vinculada a este expositor ainda.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {linkedSubmissions.map((sub) => {
              const fields = fieldsByForm.get(sub.form_id) ?? [];
              const unlinkSub = unlinkSubmission.bind(null, id, eeId, sub.id);
              return (
                <div
                  key={sub.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400">
                      {formTitleById.get(sub.form_id) ?? "Formulário"} ·{" "}
                      {formatDateTime(sub.submitted_at)}
                    </p>
                    <form action={unlinkSub}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Desvincular
                      </button>
                    </form>
                  </div>
                  <dl className="mt-3 divide-y divide-neutral-100 text-sm">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex justify-between gap-6 py-2"
                      >
                        <dt className="text-neutral-500">{field.label}</dt>
                        <dd className="text-right text-neutral-900">
                          {formatAnswer(sub.answers[field.id])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        )}

        {availableSubmissions.length > 0 && (
          <form
            action={linkSub}
            className="mt-4 flex items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="flex-1">
              <label
                htmlFor="submission_id"
                className="block text-sm font-medium text-neutral-700"
              >
                Vincular submissão
              </label>
              <select
                id="submission_id"
                name="submission_id"
                defaultValue=""
                className={`mt-1 w-full ${inputClass}`}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {availableSubmissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {formTitleById.get(sub.form_id) ?? "Formulário"} ·{" "}
                    {formatDateTime(sub.submitted_at)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Vincular
            </button>
          </form>
        )}
      </div>

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
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          doc.direction === "recebido"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {doc.direction === "recebido"
                          ? "Recebido"
                          : "Enviado"}
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
