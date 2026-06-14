export const EVENT_STATUSES = [
  "planejamento",
  "ativo",
  "encerrado",
  "cancelado",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

const STATUS_LABELS: Record<EventStatus, string> = {
  planejamento: "Planejamento",
  ativo: "Ativo",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export function statusLabel(status: EventStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export type EventRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: EventStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
