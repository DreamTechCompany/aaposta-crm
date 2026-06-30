import { createAdminClient } from "@/lib/supabase/admin";
import {
  EXHIBITOR_UPLOAD_KINDS,
  documentKindLabel,
  type DocumentRow,
} from "@/lib/types";
import { submitDocument } from "./actions";

type Participation = {
  id: string;
  exhibitor: { company_name: string } | null;
  event: { name: string } | null;
};

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("pt-BR");
}

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { token } = await params;
  const { sent, error } = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("event_exhibitors")
    .select("id, exhibitor:exhibitors(company_name), event:events(name)")
    .eq("public_token", token)
    .maybeSingle();

  const participation = data as unknown as Participation | null;

  if (!participation) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Link inválido</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Este link não existe ou expirou.
        </p>
      </div>
    );
  }

  const { data: docsData } = await supabase
    .from("documents")
    .select("*")
    .eq("event_exhibitor_id", participation.id)
    .order("uploaded_at", { ascending: false });

  const documents = (docsData ?? []) as DocumentRow[];
  const toDownload = documents.filter((d) => d.direction === "enviado");
  const received = documents.filter((d) => d.direction === "recebido");

  const action = submitDocument.bind(null, token);

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Documentos do evento
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {participation.exhibitor?.company_name}
        {participation.event?.name && ` · ${participation.event.name}`}
      </p>

      {sent && (
        <p className="mt-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Documento enviado. Você pode enviar outros abaixo.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Documentos pra baixar (enviados pela organização) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Para baixar</h2>
        {toDownload.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Nenhum documento disponível para download no momento.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {toDownload.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {doc.file_name ?? doc.storage_path}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {documentKindLabel(doc.kind)}
                  </span>
                </div>
                <a
                  href={`/api/portal/${token}/${doc.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Enviar documento (cai no CRM vinculado a este expositor) */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Enviar documento
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          PDF ou imagem, até 15 MB. Pode enviar quantos precisar.
        </p>
        <form action={action} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="kind"
              className="block text-sm font-medium text-neutral-700"
            >
              Tipo de documento
            </label>
            <select
              id="kind"
              name="kind"
              defaultValue="cpe"
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            >
              {EXHIBITOR_UPLOAD_KINDS.map((k) => (
                <option key={k} value={k}>
                  {documentKindLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div>
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
              accept=".pdf,image/*"
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Enviar documento
          </button>
        </form>
      </section>

      {/* O que o expositor já enviou */}
      {received.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            Já enviados por você
          </h2>
          <ul className="mt-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {received.map((doc) => (
              <li key={doc.id} className="px-4 py-3">
                <p className="font-medium text-neutral-900">
                  {doc.file_name ?? doc.storage_path}
                </p>
                <span className="text-xs text-neutral-500">
                  {documentKindLabel(doc.kind)} · {formatDateTime(doc.uploaded_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
