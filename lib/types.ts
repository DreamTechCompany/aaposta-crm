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

// ─────────────────────────────────────────────────────────────────────────
// Formulários (construtor por evento + link público)
// ─────────────────────────────────────────────────────────────────────────

// Tipos de campo do construtor. 'file' fica de fora por enquanto — envio de
// arquivo entra na fase de documentos.
export const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "date",
  "select",
  "multiselect",
  "checkbox",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto curto",
  textarea: "Texto longo",
  number: "Número",
  email: "E-mail",
  phone: "Telefone",
  date: "Data",
  select: "Seleção única",
  multiselect: "Seleção múltipla",
  checkbox: "Caixa de marcação",
};

export function fieldTypeLabel(type: string): string {
  return FIELD_TYPE_LABELS[type as FieldType] ?? type;
}

// Tipos que usam a lista de opções.
export function fieldHasOptions(type: string): boolean {
  return type === "select" || type === "multiselect";
}

export type FormRow = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  public_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FormFieldRow = {
  id: string;
  form_id: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  is_required: boolean;
  position: number;
  created_at: string;
};

export type FormSubmissionRow = {
  id: string;
  form_id: string;
  event_exhibitor_id: string | null;
  answers: Record<string, unknown>;
  submitted_at: string;
};
