import Link from "next/link";

type StageCount = { name: string; count: number };
type Pendencia = { eeId: string; name: string; missing: string[] };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <p className="text-2xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

// Resumo consolidado do evento: números, distribuição por etapa e pendências.
export function EventDashboard({
  eventId,
  total,
  respondedCount,
  signedCount,
  concludedCount,
  stageCounts,
  pendencias,
}: {
  eventId: string;
  total: number;
  respondedCount: number;
  signedCount: number;
  concludedCount: number;
  stageCounts: StageCount[];
  pendencias: Pendencia[];
}) {
  if (total === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
        Nenhum expositor vinculado ainda — o resumo aparece quando houver
        expositores no evento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Expositores" value={String(total)} />
        <Stat label="Responderam o formulário" value={`${respondedCount}/${total}`} />
        <Stat label="Contrato assinado recebido" value={`${signedCount}/${total}`} />
        <Stat label="Concluídos" value={`${concludedCount}/${total}`} />
      </div>

      {/* Distribuição por etapa */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">Por etapa</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stageCounts.map((s) => (
            <span
              key={s.name}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                s.count > 0
                  ? "bg-neutral-100 text-neutral-700"
                  : "bg-neutral-50 text-neutral-400"
              }`}
            >
              {s.name}: {s.count}
            </span>
          ))}
        </div>
      </div>

      {/* Pendências */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">
          Pendências ({pendencias.length})
        </p>
        {pendencias.length === 0 ? (
          <p className="mt-2 text-sm text-green-700">
            Tudo em dia — nenhuma pendência de formulário ou contrato.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-neutral-100 text-sm">
            {pendencias.map((p) => (
              <li
                key={p.eeId}
                className="flex items-center justify-between gap-4 py-2"
              >
                <Link
                  href={`/eventos/${eventId}/participacao/${p.eeId}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {p.name}
                </Link>
                <span className="text-right text-xs text-neutral-500">
                  falta {p.missing.join(" e ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
