"use client";

import { useEffect, useState } from "react";

type ActiveForm = { slug: string; title: string };

function LinkRow({ title, path }: { title: string; path: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}${path}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <p className="text-xs font-medium text-neutral-600">{title}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
          {origin ? url : path}
        </code>
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Abrir
        </a>
      </div>
    </div>
  );
}

// Link de formulário individual por expositor: a resposta já nasce vinculada a
// esta participação (sem o passo manual de vincular submissão).
export function FormExhibitorLinks({
  token,
  forms,
}: {
  token: string;
  forms: ActiveForm[];
}) {
  if (forms.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-medium text-neutral-700">
        Formulário do lead (link individual)
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Mande este link pro lead. A resposta já chega vinculada a ele e
        avança o pipeline — sem precisar vincular à mão.
      </p>
      <div className="mt-3 space-y-3">
        {forms.map((f) => (
          <LinkRow
            key={f.slug}
            title={f.title}
            path={`/f/${f.slug}?e=${token}`}
          />
        ))}
      </div>
    </div>
  );
}
