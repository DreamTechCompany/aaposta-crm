"use client";

import { useEffect, useState } from "react";

export function PublicLink({
  slug,
  isActive,
}: {
  slug: string;
  isActive: boolean;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/f/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">
          Link público
        </span>
        {!isActive && (
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
            Inativo — não aceita respostas
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
          {origin ? url : `/f/${slug}`}
        </code>
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
        <a
          href={`/f/${slug}`}
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
