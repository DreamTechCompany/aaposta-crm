"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type EventCard = {
  id: string;
  name: string;
  location: string | null;
  startsAt: string | null;
  bottleneck: {
    stageName: string;
    done: boolean;
    holding: string[];
    position: number;
    exhibitorCount: number;
  } | null;
};

function formatDate(d: string | null): string {
  if (!d) return "Data a definir";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Pontinhos de progresso do pipeline: preenche até a etapa do gargalo. Dá
// leitura visual de "onde o evento está travado" sem precisar abrir.
function ProgressDots({
  position,
  total,
  done,
}: {
  position: number;
  total: number;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const filled = done || i <= position;
        return (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              done
                ? "bg-emerald-500"
                : filled
                  ? "bg-sky-500"
                  : "bg-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

export function EventsList({
  cards,
  totalStages,
}: {
  cards: EventCard[];
  totalStages: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
      className="mt-6 grid gap-3 sm:grid-cols-2"
    >
      {cards.map((e) => {
        const b = e.bottleneck;
        return (
          <motion.div
            key={e.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            whileHover={{ y: -3 }}
          >
            <Link
              href={`/eventos/${e.id}`}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold tracking-tight text-slate-900 group-hover:text-slate-700">
                  {e.name}
                </h2>
                {b &&
                  (b.done ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Concluído
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {b.stageName}
                    </span>
                  ))}
              </div>

              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-slate-500">
                <span>{formatDate(e.startsAt)}</span>
                {e.location && <span>{e.location}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                {!b ? (
                  <span className="text-xs text-slate-400">
                    Nenhum cliente ainda
                  </span>
                ) : (
                  <>
                    <div className="min-w-0">
                      <ProgressDots
                        position={b.position}
                        total={totalStages}
                        done={b.done}
                      />
                      {!b.done && (
                        <p
                          className="mt-1.5 truncate text-xs text-slate-500"
                          title={b.holding.join(", ")}
                        >
                          aguardando: {b.holding[0]}
                          {b.holding.length > 1 && ` +${b.holding.length - 1}`}
                        </p>
                      )}
                    </div>
                    <span className="ml-3 shrink-0 text-xs tabular-nums text-slate-400">
                      {b.exhibitorCount}{" "}
                      {b.exhibitorCount === 1 ? "cliente" : "clientes"}
                    </span>
                  </>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
