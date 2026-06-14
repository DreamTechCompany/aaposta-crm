# Roadmap — AAposta CRM

Documento pra quem for continuar o projeto (Pedro ou Caetano). Atualizado em 2026-06-14.

## Status atual

**Pronto e funcionando:**
- Projeto Next.js (App Router, TS) + Tailwind + Supabase configurado.
- Schema do banco aplicado no Supabase — migrations `0001_init.sql` e `0002_rls.sql`.
- Autenticação: login/logout por e-mail e senha, middleware de sessão e proteção de rotas (`middleware.ts`).
- **CRUD de eventos completo**: listar, criar, editar, ver e excluir. É a referência de padrão para as próximas telas.

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

1. **Cadastro de expositores + vínculo com evento.**
   Tabelas `exhibitors` e `event_exhibitors` já existem. Criar: lista de expositores, criar/editar expositor, e na página do evento listar os expositores vinculados com botão "vincular expositor". O vínculo (`event_exhibitors`) é o card do pipeline.

2. **Kanban do pipeline por evento.**
   `pipeline_stages` já vem populado (6 etapas). Colunas = etapas, cards = `event_exhibitors`; arrastar entre colunas atualiza `stage_id`.

3. **Construtor de formulários por evento + link público.**
   Tabelas `forms` e `form_fields`. Página pública em `/f/[public_slug]` (acesso anônimo — o RLS já libera leitura de form ativo e inserção de submissão). Submissão grava em `form_submissions`.

4. **Documentos.**
   Envio do contrato pré-preenchido (gerar PDF com dados da submissão), manual e CPE; coleta do contrato assinado (upload). Bucket `documents` (privado) já criado.

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
