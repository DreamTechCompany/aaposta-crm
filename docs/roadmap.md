# Roadmap — AAposta CRM

Documento pra quem for continuar o projeto (Pedro ou Caetano). Atualizado em 2026-06-15.

## Status atual

**Pronto e funcionando:**
- Projeto Next.js (App Router, TS) + Tailwind + Supabase configurado.
- Schema do banco aplicado no Supabase — migrations `0001_init.sql` e `0002_rls.sql`.
- Autenticação: login/logout por e-mail e senha, middleware de sessão e proteção de rotas (`middleware.ts`).
- **CRUD de eventos completo**: listar, criar, editar, ver e excluir. É a referência de padrão para as próximas telas.
- **CRUD de expositores completo** + vínculo com evento: lista/criar/editar/ver expositores (`app/(app)/expositores/`); na página do evento, listar expositores vinculados, vincular (cria `event_exhibitors` já na 1ª etapa do pipeline) e desvincular. Na página do expositor, lista os eventos em que ele está.
- **Kanban do pipeline por evento**: `/eventos/[id]/pipeline` — colunas = `pipeline_stages` (por `position`), cards = `event_exhibitors`. Drag-and-drop nativo com atualização otimista, `moveCard` atualiza `stage_id`.
- **Construtor de formulários por evento + link público**: `/eventos/[id]/formularios` — criar/editar formulários (`forms`), construtor de campos dinâmico (`form_fields`: adicionar/remover/reordenar, 9 tipos, opções pra seleção, obrigatório). `saveFields` salva por diff (preserva ids). Link público `/f/[public_slug]` (anônimo, liberado no middleware) renderiza o form ativo e grava em `form_submissions`; tela de respostas no admin. Tipo `file` fica pra fase de documentos.

## Como rodar

```bash
cd ~/DreamTech/aaposta-crm
npm install        # primeira vez
npm run dev        # sobe em http://localhost:3000
```

Precisa do arquivo `.env.local` (não vai pro git) com as keys do Supabase — modelo em `.env.example`. O login usa um usuário criado no painel do Supabase (Authentication → Users, com **Auto Confirm** marcado).

## Pendências / decisões em aberto

- **Service role key:** foi exposta no chat durante o setup — rotacionar no Supabase (Settings → API) e atualizar o `.env.local`. Não é usada ainda; vira necessária no upload público de documentos.
- **Owner da org GitHub:** confirmar Pedro (`pedroacpellegrini`) como Owner de `DreamTechCompany` — hoje está como member.
- **Upload público de documento** (expositor anônimo): decidir entre Route Handler com service role ou signed URL. Ver nota em `docs/schema.md`.
- **Deploy:** ainda roda só local. Publicar na Vercel é passo futuro (gera URL fixa, sem depender do terminal).

## Próximos passos (ordem sugerida)

1. ~~**Cadastro de expositores + vínculo com evento.**~~ ✅ Feito (2026-06-14). O vínculo (`event_exhibitors`) é o card do pipeline; já nasce na 1ª etapa.

2. ~~**Kanban do pipeline por evento.**~~ ✅ Feito (2026-06-15). `/eventos/[id]/pipeline`, drag-and-drop nativo, `moveCard` atualiza `stage_id`. Próximo refinamento possível: reordenar/editar etapas pela UI.

3. ~~**Construtor de formulários por evento + link público.**~~ ✅ Feito (2026-06-15). `/eventos/[id]/formularios` (CRUD + construtor de campos dinâmico) e página pública `/f/[public_slug]`. Submissão grava em `form_submissions`; respostas visíveis no admin. Refinamentos possíveis: vincular submissão a um `event_exhibitor` (hoje fica null), tipo de campo `file` (entra com documentos).

4. **Documentos.** Bucket `documents` (privado) já criado.
   - ✅ **(A) Envio pelo backoffice** (2026-06-16): página de participação `/eventos/[id]/participacao/[eeId]` com upload (contrato/manual/CPE/outro, direction `enviado`), lista, download por signed URL (`/api/documentos/[docId]`) e exclusão.
   - **(B) Coleta do contrato assinado** (upload do expositor anônimo): em andamento — link público por participação `/u/[token]`, upload via Route Handler com service role. Requer migration `0003` (token em `event_exhibitors`).
   - **(C) Contrato pré-preenchido em PDF** com dados da submissão: pendente, vira passo próprio.

5. **Notificações por e-mail (Resend).**
   Avisar a AAposta quando um expositor preenche formulário ou envia documento.

6. **Dashboard por evento.**
   Visão geral de expositores, status e pendências — consolida o que as telas acima produzem.

7. **Deploy na Vercel** com as variáveis de ambiente.

## Mapa do código

- `middleware.ts`, `lib/supabase/*` — auth e clients do Supabase (browser/server).
- `app/login/` — tela e ações de login/logout.
- `app/(app)/` — área autenticada (layout protege e mostra header/nav).
- `app/(app)/eventos/` — CRUD de eventos. **Copiar esse padrão** (page + actions + form) para as novas entidades.
- `supabase/migrations/` — schema do banco. Modelo explicado em `docs/schema.md`.
- `lib/types.ts`, `lib/slug.ts` — tipos e helpers.
