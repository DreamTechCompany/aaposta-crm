# Modelo de dados

Migrations em [`supabase/migrations/`](../supabase/migrations). O modelo nasce do fluxo manual descrito no briefing da AAposta.

## Entidades

| Tabela | O que é |
| --- | --- |
| `profiles` | Usuários do backoffice (time AAposta). Liga em `auth.users`. |
| `events` | Eventos organizados pela AAposta. |
| `exhibitors` | Empresas expositoras. Reutilizáveis entre eventos. |
| `event_exhibitors` | Participação de um expositor num evento. É o **card do kanban** e ancora documentos e submissões. |
| `pipeline_stages` | Colunas do kanban (etapas), ordenadas e customizáveis. |
| `forms` | Formulário customizável por evento, com `public_slug` para link público. |
| `form_fields` | Campos do form builder (text, select, file, etc.). |
| `form_submissions` | Respostas do expositor (dados operacionais), em `answers` jsonb. |
| `documents` | Arquivos enviados (contrato, manual, CPE) e recebidos (contrato assinado). |

## Decisões

- **Expositor reutilizável:** a empresa existe uma vez; participa de N eventos via `event_exhibitors`. Histórico por empresa sai de graça.
- **Form builder dinâmico:** campos viram linhas em `form_fields`; respostas ficam em `form_submissions.answers` (jsonb chaveado por `field_id`). Não há tabela rígida de "dados operacionais" — o que muda por evento é configurado, não migrado.
- **Pipeline em tabela, não enum:** etapas editáveis sem migration. Seed inicial segue o fluxo do briefing (Interesse → Dados coletados → Contrato enviado → Contrato assinado → Documentação completa → Concluído).
- **Escala:** UUIDs, índices em todas as FKs consultadas, `updated_at` por trigger.

## Acesso (RLS)

- **Backoffice (autenticado):** acesso total — é ferramenta interna.
- **Público (anon):** só lê formulário ativo + campos e insere submissão. Nada mais é exposto.
- **Storage:** bucket `documents` privado, leitura/escrita só autenticada. O upload do contrato assinado via link público (expositor anônimo) fica para um Route Handler com signed URL — a decidir na implementação da coleta de documentos.

## Fora do MVP (Fase 2)

NF-e, assinatura eletrônica integrada, app mobile, relatórios de faturamento, multi-usuário com permissões por perfil. O `profiles.role` já deixa o gancho para permissões.
