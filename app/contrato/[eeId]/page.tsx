import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type ExhibitorRow,
  type FormFieldRow,
  type FormSubmissionRow,
} from "@/lib/types";
import { ContractDocument, type ContratoData } from "./contract-document";
import { PrintButton } from "./print-button";

type EE = {
  id: string;
  event_id: string;
  exhibitor: Pick<
    ExhibitorRow,
    "company_name" | "cnpj" | "contact_name" | "contact_email" | "contact_phone"
  > | null;
};

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

export default async function ContratoPage({
  params,
}: {
  params: Promise<{ eeId: string }>;
}) {
  const { eeId } = await params;
  const supabase = await createClient();

  const { data: eeData } = await supabase
    .from("event_exhibitors")
    .select(
      "id, event_id, exhibitor:exhibitors(company_name, cnpj, contact_name, contact_email, contact_phone)",
    )
    .eq("id", eeId)
    .single();

  const ee = eeData as unknown as EE | null;
  if (!ee) notFound();

  const exhibitor = ee.exhibitor;

  // Submissão vinculada a esta participação → dados declarados no formulário.
  const { data: subData } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("event_exhibitor_id", eeId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const submission = subData as FormSubmissionRow | null;

  let declaredFields: { label: string; value: string }[] = [];
  if (submission) {
    const { data: fieldsData } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", submission.form_id)
      .order("position", { ascending: true });
    declaredFields = ((fieldsData ?? []) as FormFieldRow[]).map((f) => ({
      label: f.label,
      value: formatAnswer(submission.answers[f.id]),
    }));
  }

  const data: ContratoData = {
    razaoSocial: exhibitor?.company_name ?? "",
    nomeFantasia: "",
    cnpj: exhibitor?.cnpj ?? "",
    inscricaoEstadual: "",
    endereco: "",
    bairro: "",
    cidade: "",
    cep: "",
    telefones: exhibitor?.contact_phone ?? "",
    email: exhibitor?.contact_email ?? "",
    crlv: "",
    representante: exhibitor?.contact_name ?? "",
    cpf: "",
    telefonesRep: exhibitor?.contact_phone ?? "",
  };

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      {/* Barra de ações — não imprime */}
      <div className="border-b border-neutral-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link
            href={`/eventos/${ee.event_id}/participacao/${eeId}`}
            className="text-sm text-neutral-500 hover:underline"
          >
            ← Voltar à participação
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Dados declarados no formulário — ajuda a marcar a cláusula 1. Não imprime. */}
        {declaredFields.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 print:hidden">
            <p className="text-sm font-semibold text-amber-900">
              Dados informados pelo expositor no formulário
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Use para marcar/preencher os campos da cláusula 1 (estrutura, KVA,
              energia) e os vouchers antes de imprimir.
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {declaredFields.map((f, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <dt className="text-amber-800">{f.label}</dt>
                  <dd className="text-right font-medium text-amber-950">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!submission && (
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-500 print:hidden">
            Nenhuma submissão de formulário vinculada a este expositor — os dados
            operacionais (cláusula 1) sairão em branco. Vincule uma submissão na
            tela da participação para vê-los aqui.
          </div>
        )}

        {/* Folha do contrato */}
        <div className="rounded-lg bg-white p-10 shadow-sm print:rounded-none print:p-0 print:shadow-none">
          <ContractDocument data={data} />
        </div>
      </div>
    </div>
  );
}
