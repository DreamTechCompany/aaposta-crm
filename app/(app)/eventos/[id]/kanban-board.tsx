"use client";

import { useState, useTransition } from "react";
import { moveCard } from "./pipeline-actions";

type Stage = { id: string; name: string };
type Card = {
  id: string;
  companyName: string;
  contactName: string | null;
  stageId: string | null;
};

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
      <p className="mt-6 text-sm text-neutral-500">
        Nenhuma etapa de pipeline configurada.
      </p>
    );
  }

  return (
    <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const colCards = items.filter((c) => columnOf(c) === stage.id);
        const isOver = overStage === stage.id;
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage.id) setOverStage(stage.id);
            }}
            onDragLeave={() =>
              setOverStage((s) => (s === stage.id ? null : s))
            }
            onDrop={() => handleDrop(stage.id)}
            className={`flex w-64 shrink-0 flex-col rounded-lg border ${
              isOver
                ? "border-neutral-400 bg-neutral-100"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
              <span className="text-sm font-medium text-neutral-700">
                {stage.name}
              </span>
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                {colCards.length}
              </span>
            </div>
            <div className="flex min-h-20 flex-col gap-2 p-2">
              {colCards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragId(card.id)}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
                >
                  <p className="font-medium text-neutral-900">
                    {card.companyName}
                  </p>
                  {card.contactName && (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {card.contactName}
                    </p>
                  )}
                </div>
              ))}
              {colCards.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-neutral-400">
                  Arraste cards aqui
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
