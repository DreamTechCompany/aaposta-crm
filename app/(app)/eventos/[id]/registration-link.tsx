"use client";

import { useEffect, useState } from "react";

// Link público de auto-cadastro de expositor por evento (/expor/[slug]).
export function RegistrationLink({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const path = `/expor/${slug}`;
  const url = `${origin}${path}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-medium text-neutral-700">
        Link de cadastro de cliente
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Quem preencher entra como cliente já vinculado a este evento (etapa
        Interesse). Sem login.
      </p>
      <div className="mt-2 flex items-center gap-2">
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
