# Roadmap — AAposta CRM

Documento pra quem for continuar o projeto (Pedro ou Caetano). Atualizado em 2026-06-15.

## Status atual

**Pronto e funcionando:**
- Projeto Next.js (App Router, TS) + Tailwind + Supabase configurado.
- Schema do banco aplicado no Supabase — migrations `0001_init.sql`, `0002_rls.sql` e `0003_event_exhibitor_public_token.sql`.
- Autenticação: login/logout por e-mail e senha, middleware de sessão e proteção de rotas (`middleware.ts`).
- **CRUD de eventos completo**: listar, criar, editar, ver e excluir. É a referência de padrão para as próximas telas.
- **CRUD de expositores completo** + vínculo com evento: lista/criar/editar/ver expositores (`app/(app)/expositores/`); na página do evento, listar expositores vinculados, vincular (cria `event_exhibitors` já na 1ª etapa do pipeline) e desvincular. Na página do expositor, lista os eventos em que ele está.
- **Kanban do pipeline por evento**: `/eventos/[id]/pipeline` — colunas = `pipeline_stages` (por `position`), cards = `event_exhibitors`. Drag-and-drop nativo com atualização otimista, `moveCard` atualiza `stage_id`.
- **Construtor de formulários por evento + link público**: `/eventos/[id]/formularios` — criar/editar formulários (`forms`), construtor de campos dinâmico (`form_fields`: adicionar/remover/reordenar, 9 tipos, opções pra seleção, obrigatório). `saveFields` salva por diff (preserva ids). Link público `/f/[public_slug]` (anônimo, liberado no middleware) renderiza o form ativo e grava em `form_submissions`; tela de respostas no admin. Tipo `file` fica pra fase de documentos.
- **Documentos (A + B)**: página de participação `/eventos/[id]/participacao/[eeId]`. Backoffice envia contrato/manual/CPE (`direction enviado`), lista, baixa (signed URL em `/api/documentos/[docId]`) e exclui. Expositor anônimo envia o contrato assinado por link único `/u/[token]` → upload via service role (`lib/supabase/admin.ts`), grava `direction recebido`. Bucket `documents` privado. Falta a parte C (contrato pré-preenchido em PDF).

## Como rodar

```bash
cd ~/DreamTech/aaposta-crm
npm install        # primeira vez
npm run dev        # sobe em http://localhost:3000
```

Precisa do arquivo `.env.local` (não vai pro git) com as keys do Supabase — modelo em `.env.example`. O login usa um usuário criado no painel do Supabase (Authentication → Users, com **Auto Confirm** marcado).

## Pendências / decisões em aberto

- ~~**Service role key** exposta no setup~~ → rotacionada em 2026-06-16 e em uso no upload público (`lib/supabase/admin.ts`).
- ~~**Upload público de documento** (expositor anônimo)~~ → resolvido: Server Action com service role + token por participação (`/u/[token]`).
- **Owner da org GitHub:** confirmar Pedro (`pedroacpellegrini`) como Owner de `DreamTechCompany` — hoje está como member.
- **Deploy:** ainda roda só local. Publicar na Vercel é passo futuro (gera URL fixa, sem depender do terminal).

## Próximos passos (ordem sugerida)

1. ~~**Cadastro de expositores + vínculo com evento.**~~ ✅ Feito (2026-06-14). O vínculo (`event_exhibitors`) é o card do pipeline; já nasce na 1ª etapa. **Auto-cadastro público por evento** em 2026-06-16: link `/expor/[slug]` (anônimo, liberado no middleware) com os mesmos campos do cadastro manual; `registerExhibitor` (service role) cria o expositor e já vincula ao evento na 1ª etapa. Editável depois na ficha do expositor.

2. ~~**Kanban do pipeline por evento.**~~ ✅ Feito (2026-06-15). Drag-and-drop nativo, `moveCard` atualiza `stage_id`. **Embutido na página do evento** em 2026-06-16 (a rota separada `/pipeline` foi removida; kanban em `app/(app)/eventos/[id]/kanban-board.tsx`). **Automação** (`lib/pipeline.ts` `advanceStage`, só avança): vincular submissão → "Dados coletados"; subir contrato → "Contrato enviado"; receber contrato assinado → "Contrato assinado". "Documentação completa" e "Concluído" seguem manuais. A **lista de eventos** mostra o status do evento = etapa-gargalo (menos avançada) + quem está segurando. Próximo refinamento possível: reordenar/editar etapas pela UI.

3. ~~**Construtor de formulários por evento + link público.**~~ ✅ Feito (2026-06-15). `/eventos/[id]/formularios` (CRUD + construtor de campos dinâmico) e página pública `/f/[public_slug]`. Submissão grava em `form_submissions`; respostas visíveis no admin. Vínculo submissão↔`event_exhibitor` feito em 2026-06-16 (na tela de participação). Refinamento possível: tipo de campo `file`.

4. **Documentos.** Bucket `documents` (privado) já criado.
   - ✅ **(A) Envio pelo backoffice** (2026-06-16): página de participação `/eventos/[id]/participacao/[eeId]` com upload (contrato/manual/CPE/outro, direction `enviado`), lista, download por signed URL (`/api/documentos/[docId]`) e exclusão.
   - ✅ **(B) Coleta do contrato assinado** (2026-06-16): link público por participação `/u/[token]` (anônimo, liberado no middleware); upload via Server Action com service role (`lib/supabase/admin.ts`), grava com direction `recebido`. Token em `event_exhibitors` (migration `0003`, aplicada). Documento recebido aparece na tela de participação marcado como "Recebido".
   - ✅ **(C) Contrato pré-preenchido** (2026-06-16): vínculo submissão↔participação na tela de participação (`linkSubmission`, preenche `event_exhibitor_id`); página `/contrato/[eeId]` reproduz o contrato (modelo Grande Prêmio Brasil) com o bloco do LOCATÁRIO já preenchido a partir do cadastro do expositor + quadro com os dados declarados no formulário; impressão A4 → "Salvar como PDF". Cláusula 1 (estrutura/KVA/energia) e vouchers ficam pra marcação manual (fluxo de assinatura à mão). Modelo de contrato é específico desse evento — outros eventos precisariam do próprio template.

### Melhorias anotadas (futuro)
- ~~**Formulário por expositor (link individual)**~~ ✅ Feito (2026-06-17). `/f/[public_slug]?e=[public_token]`: o link leva o token da participação; `submitPublicForm` resolve via service role, grava a submissão já com `event_exhibitor_id` e avança pro "Dados coletados". Links individuais na tela de participação (`form-exhibitor-links.tsx`). O link genérico `/f/[slug]` (sem `?e=`) e o "vincular submissão" manual seguem como fallback.
- **Notificação externa (e-mail/WhatsApp):** avisar a AAposta fora do CRM quando chega formulário/documento. Decidido não fazer agora (Resend exige verificar domínio; WhatsApp oficial exige Meta Business + templates aprovados; libs não-oficiais arriscam banir o número). Em vez disso, o status fica visível dentro do CRM (ver passo 5). Retomar se quiserem aviso ativo — caminho mais simples seria e-mail via Resend ou um bot de Telegram.

5. ~~**Notificações por e-mail.**~~ → Trocado por **status visível no CRM** (2026-06-16): na página do evento, cada expositor mostra badges "Formulário" e "Contrato assinado" (verde = recebido, cinza = pendente); a página de participação repete o resumo no topo. Substitui o aviso ativo — a AAposta abre o evento e vê de relance quem já respondeu. Notificação externa fica anotada acima como melhoria futura.

6. ~~**Dashboard por evento.**~~ ✅ Feito (2026-06-17). Seção "Resumo" no topo da página do evento (`event-dashboard.tsx`): números (expositores, responderam o formulário, contrato assinado recebido, concluídos), distribuição por etapa do pipeline e lista de pendências (quem falta formulário/contrato, clicável pra ficha).

7. ~~**Deploy na Vercel**~~ ✅ Feito (2026-06-17). Deploy na Vercel (Hobby) com as 3 env vars do Supabase. **Obs:** o plano grátis da Vercel não deploya repo privado de org → o repo `aaposta-crm` foi tornado **público** (sem segredos commitados; `.env.local` segue ignorado). Se quiser voltar a privado no futuro: Netlify (grátis com repo privado de org) ou Vercel Pro. Pós-deploy: setar Site URL/Redirect URLs no Supabase Auth.

## Mapa do código

- `middleware.ts`, `lib/supabase/*` — auth e clients do Supabase (browser/server).
- `app/login/` — tela e ações de login/logout.
- `app/(app)/` — área autenticada (layout protege e mostra header/nav).
- `app/(app)/eventos/` — CRUD de eventos. **Copiar esse padrão** (page + actions + form) para as novas entidades.
- `supabase/migrations/` — schema do banco. Modelo explicado em `docs/schema.md`.
- `lib/types.ts`, `lib/slug.ts` — tipos e helpers.
