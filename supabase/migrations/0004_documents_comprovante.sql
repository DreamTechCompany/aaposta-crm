-- Adiciona 'comprovante' aos tipos de documento aceitos.
-- O expositor envia comprovantes (ex: Pix da barraca) pelo portal público
-- /u/[token]; precisam de um kind próprio além de contrato_assinado/cpe.
alter table documents drop constraint documents_kind_check;
alter table documents add constraint documents_kind_check
  check (kind in ('contrato', 'contrato_assinado', 'manual',
                  'cpe', 'comprovante', 'outro'));
