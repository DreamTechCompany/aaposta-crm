"use client";

import { motion } from "framer-motion";
import { ExhibitorForm } from "@/app/(app)/expositores/exhibitor-form";

type EventInfo = {
  name: string;
  location: string | null;
  startsAt: string | null;
};

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

// Página que o expositor abre pelo link de cadastro. Primeira (e às vezes
// única) impressão que ele tem do produto — por isso ganha marca e contexto
// do evento, não só um form solto.
export function PublicRegistration({
  event,
  action,
  error,
}: {
  event: EventInfo;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
}) {
  const date = formatDate(event.startsAt);

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            AAposta
            <span className="ml-1.5 font-normal text-slate-400">Eventos</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Cadastro de expositor
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            {event.name}
          </h1>
          {(date || event.location) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
              {date && <span>{date}</span>}
              {event.location && <span>{event.location}</span>}
            </div>
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
          className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="mb-5 text-sm text-slate-500">
            Preencha os dados da sua empresa para participar do evento. Campos
            com <span className="text-slate-700">*</span> são obrigatórios.
          </p>
          <ExhibitorForm
            action={action}
            submitLabel="Enviar cadastro"
            error={error}
          />
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Organização do evento via AAposta CRM
        </p>
      </main>
    </div>
  );
}
