-- Migration 0003: token público por participação (event_exhibitors)
--
-- Permite gerar um link de upload (/u/[token]) para o expositor anônimo enviar
-- o contrato assinado. A coleta roda num Route Handler com a service role (que
-- ignora o RLS) — por isso não há policy nova aqui: o token só identifica a
-- participação; nada é exposto ao papel anon diretamente.

alter table event_exhibitors
  add column public_token uuid not null default gen_random_uuid();

-- Backfill: linhas já existentes recebem um token via o default acima.
-- (default já preenche; garante unicidade abaixo.)

create unique index idx_event_exhibitors_public_token
  on event_exhibitors(public_token);
