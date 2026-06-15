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

export type ExhibitorRow = {
  id: string;
  company_name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventExhibitorRow = {
  id: string;
  event_id: string;
  exhibitor_id: string;
  stage_id: string | null;
  created_at: string;
  updated_at: string;
};

// Linha de event_exhibitors com o expositor e a etapa embutidos (join).
export type EventExhibitorWithRelations = EventExhibitorRow & {
  exhibitor: ExhibitorRow | null;
  stage: { id: string; name: string } | null;
};
