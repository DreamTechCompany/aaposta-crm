-- CRM de Eventos — AAposta
-- Migration 0001: schema inicial (tabelas, índices, triggers, seed)
--
-- Modelo: a AAposta (organizador) gerencia muitos EVENTOS. Empresas EXPOSITORAS
-- são reutilizáveis entre eventos; a participação de um expositor num evento
-- (event_exhibitors) é o "card" do kanban e ancora documentos e submissões.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Usuários do backoffice (time AAposta). Liga em auth.users do Supabase.
-- ─────────────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'staff' check (role in ('admin', 'staff')),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Eventos
-- ─────────────────────────────────────────────────────────────────────────
create table events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  location    text,
  starts_at   date,
  ends_at     date,
  status      text not null default 'planejamento'
                check (status in ('planejamento', 'ativo', 'encerrado', 'cancelado')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Empresas expositoras (reutilizáveis entre eventos)
-- ─────────────────────────────────────────────────────────────────────────
create table exhibitors (
  id             uuid primary key default gen_random_uuid(),
  company_name   text not null,
  cnpj           text,
  contact_name   text,
  contact_email  text,
  contact_phone  text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Etapas do pipeline (colunas do kanban). Ordenadas e customizáveis.
-- ─────────────────────────────────────────────────────────────────────────
create table pipeline_stages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  position     int not null,
  is_terminal  boolean not null default false
);

-- ─────────────────────────────────────────────────────────────────────────
-- Participação de um expositor num evento = card do kanban
-- ─────────────────────────────────────────────────────────────────────────
create table event_exhibitors (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  exhibitor_id uuid not null references exhibitors(id) on delete restrict,
  stage_id     uuid references pipeline_stages(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (event_id, exhibitor_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- Formulários customizáveis por evento, com link público
-- ─────────────────────────────────────────────────────────────────────────
create table forms (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  title        text not null,
  description  text,
  public_slug  text not null unique,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Campos do formulário (form builder)
create table form_fields (
  id           uuid primary key default gen_random_uuid(),
  form_id      uuid not null references forms(id) on delete cascade,
  label        text not null,
  field_type   text not null
                 check (field_type in ('text', 'textarea', 'number', 'select',
                                       'multiselect', 'checkbox', 'date', 'email',
                                       'phone', 'file')),
  options      jsonb,             -- opções para select/multiselect
  is_required  boolean not null default false,
  position     int not null default 0,
  created_at   timestamptz not null default now()
);

-- Submissões do formulário (dados operacionais do expositor)
create table form_submissions (
  id                  uuid primary key default gen_random_uuid(),
  form_id             uuid not null references forms(id) on delete cascade,
  event_exhibitor_id  uuid references event_exhibitors(id) on delete set null,
  answers             jsonb not null default '{}',  -- { field_id: valor }
  submitted_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Documentos (enviados pela AAposta e recebidos do expositor)
-- ─────────────────────────────────────────────────────────────────────────
create table documents (
  id                  uuid primary key default gen_random_uuid(),
  event_exhibitor_id  uuid not null references event_exhibitors(id) on delete cascade,
  kind                text not null
                        check (kind in ('contrato', 'contrato_assinado', 'manual',
                                        'cpe', 'outro')),
  direction           text not null check (direction in ('enviado', 'recebido')),
  storage_path        text not null,   -- caminho no Supabase Storage (bucket "documents")
  file_name           text,
  status              text not null default 'pendente'
                        check (status in ('pendente', 'enviado', 'recebido', 'aprovado')),
  uploaded_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Índices (FKs mais consultadas — pensando em escala)
-- ─────────────────────────────────────────────────────────────────────────
create index idx_event_exhibitors_event     on event_exhibitors(event_id);
create index idx_event_exhibitors_exhibitor on event_exhibitors(exhibitor_id);
create index idx_event_exhibitors_stage     on event_exhibitors(stage_id);
create index idx_forms_event                on forms(event_id);
create index idx_form_fields_form           on form_fields(form_id);
create index idx_form_submissions_form      on form_submissions(form_id);
create index idx_form_submissions_ee        on form_submissions(event_exhibitor_id);
create index idx_documents_ee               on documents(event_exhibitor_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger de updated_at
-- ─────────────────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_events_updated
  before update on events
  for each row execute function set_updated_at();

create trigger trg_exhibitors_updated
  before update on exhibitors
  for each row execute function set_updated_at();

create trigger trg_event_exhibitors_updated
  before update on event_exhibitors
  for each row execute function set_updated_at();

create trigger trg_forms_updated
  before update on forms
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Seed: etapas padrão do pipeline (baseadas no fluxo manual do briefing)
-- ─────────────────────────────────────────────────────────────────────────
insert into pipeline_stages (name, position, is_terminal) values
  ('Interesse',              1, false),
  ('Dados coletados',        2, false),
  ('Contrato enviado',       3, false),
  ('Contrato assinado',      4, false),
  ('Documentação completa',  5, false),
  ('Concluído',              6, true);
