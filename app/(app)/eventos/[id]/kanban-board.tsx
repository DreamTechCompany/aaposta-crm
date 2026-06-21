"use client";

import { useState, useTransition } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
} from "framer-motion";
import { moveCard } from "./pipeline-actions";

type Stage = { id: string; name: string };
type Card = {
  id: string;
  companyName: string;
  contactName: string | null;
  stageId: string | null;
};

// Curva de mola compartilhada — dá o "peso" natural do drop. Mantido curto
// (200-250ms equivalente) pra não atrapalhar quem move vários cards seguidos.
const spring = { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.8 };

export function KanbanBoard({
  eventId,
  stages,
  cards,
}: {
  eventId: string;
  stages: Stage[];
  cards: Card[];
}) {
  const [items, setItems] = useState<Card[]>(cards);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const firstStageId = stages[0]?.id ?? null;

  // Card sem etapa (ou com etapa removida) cai na primeira coluna.
  function columnOf(card: Card): string | null {
    if (card.stageId && stages.some((s) => s.id === card.stageId)) {
      return card.stageId;
    }
    return firstStageId;
  }

  function handleDrop(stageId: string) {
    setOverStage(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;

    const card = items.find((c) => c.id === id);
    if (!card || columnOf(card) === stageId) return;

    const previousStageId = card.stageId;
    // Atualização otimista — move na hora, reverte se a action falhar.
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stageId } : c)),
    );
    startTransition(() => {
      moveCard(id, stageId, eventId).catch(() => {
        setItems((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, stageId: previousStageId } : c,
          ),
        );
      });
    });
  }

  if (stages.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        Nenhuma etapa de pipeline configurada.
      </p>
    );
  }

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage, stageIndex) => {
            const colCards = items.filter((c) => columnOf(c) === stage.id);
            const isOver = overStage === stage.id;
            return (
              <motion.div
                key={stage.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stageIndex * 0.05, ...spring }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overStage !== stage.id) setOverStage(stage.id);
                }}
                onDragLeave={() =>
                  setOverStage((s) => (s === stage.id ? null : s))
                }
                onDrop={() => handleDrop(stage.id)}
                className={`flex w-64 shrink-0 flex-col rounded-xl border transition-colors duration-200 ${
                  isOver
                    ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200"
                    : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                  <span className="text-sm font-semibold tracking-tight text-slate-700">
                    {stage.name}
                  </span>
                  <motion.span
                    key={colCards.length}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums transition-colors ${
                      isOver
                        ? "bg-sky-200 text-sky-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {colCards.length}
                  </motion.span>
                </div>
                <div className="flex min-h-20 flex-col gap-2 p-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {colCards.map((card) => {
                      const isDragging = dragId === card.id;
                      return (
                        <motion.div
                          key={card.id}
                          layoutId={card.id}
                          layout
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{
                            opacity: isDragging ? 0.4 : 1,
                            scale: 1,
                          }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          draggable
                          onDragStart={() => setDragId(card.id)}
                          onDragEnd={() => setDragId(null)}
                          className={`cursor-grab rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-shadow active:cursor-grabbing ${
                            isDragging
                              ? "border-sky-300 shadow-md"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                          }`}
                        >
                          <p className="font-semibold tracking-tight text-slate-900">
                            {card.companyName}
                          </p>
                          {card.contactName && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {card.contactName}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {colCards.length === 0 && (
                    <motion.p
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`rounded-lg border border-dashed px-1 py-5 text-center text-xs transition-colors ${
                        isOver
                          ? "border-sky-300 text-sky-500"
                          : "border-slate-200 text-slate-400"
                      }`}
                    >
                      Arraste cards aqui
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
