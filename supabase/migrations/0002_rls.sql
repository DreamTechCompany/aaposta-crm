-- CRM de Eventos — AAposta
-- Migration 0002: Row Level Security e Storage
--
-- Dois mundos de acesso:
--   1. Backoffice (time AAposta, autenticado) — acesso total.
--   2. Público (expositor, anônimo) — só lê formulário ativo e envia submissão.

-- ─────────────────────────────────────────────────────────────────────────
-- Habilita RLS em todas as tabelas
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table events            enable row level security;
alter table exhibitors        enable row level security;
alter table pipeline_stages   enable row level security;
alter table event_exhibitors  enable row level security;
alter table forms             enable row level security;
alter table form_fields       enable row level security;
alter table form_submissions  enable row level security;
alter table documents         enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- Backoffice: usuários autenticados têm acesso total (ferramenta interna).
-- ─────────────────────────────────────────────────────────────────────────
create policy "auth full access" on events
  for all to authenticated using (true) with check (true);
create policy "auth full access" on exhibitors
  for all to authenticated using (true) with check (true);
create policy "auth full access" on pipeline_stages
  for all to authenticated using (true) with check (true);
create policy "auth full access" on event_exhibitors
  for all to authenticated using (true) with check (true);
create policy "auth full access" on forms
  for all to authenticated using (true) with check (true);
create policy "auth full access" on form_fields
  for all to authenticated using (true) with check (true);
create policy "auth full access" on form_submissions
  for all to authenticated using (true) with check (true);
create policy "auth full access" on documents
  for all to authenticated using (true) with check (true);

-- Cada usuário vê e edita o próprio perfil
create policy "own profile" on profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- Público (anon): lê o formulário ativo e seus campos, e envia submissão.
-- ─────────────────────────────────────────────────────────────────────────
create policy "public reads active forms" on forms
  for select to anon using (is_active = true);

create policy "public reads fields of active forms" on form_fields
  for select to anon using (
    exists (select 1 from forms f where f.id = form_fields.form_id and f.is_active)
  );

create policy "public submits to active forms" on form_submissions
  for insert to anon with check (
    exists (select 1 from forms f where f.id = form_submissions.form_id and f.is_active)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Storage: bucket privado de documentos. Acesso só por usuário autenticado.
-- (Upload do expositor via link público é servido por Route Handler com
--  service role / signed URL — decidir na implementação da coleta de docs.)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "auth reads documents" on storage.objects
  for select to authenticated using (bucket_id = 'documents');
create policy "auth writes documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'documents');
create policy "auth updates documents" on storage.objects
  for update to authenticated using (bucket_id = 'documents');
create policy "auth deletes documents" on storage.objects
  for delete to authenticated using (bucket_id = 'documents');
