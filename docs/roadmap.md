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

1. ~~**Cadastro de expositores + vínculo com evento.**~~ ✅ Feito (2026-06-14). O vínculo (`event_exhibitors`) é o card do pipeline; já nasce na 1ª etapa.

2. ~~**Kanban do pipeline por evento.**~~ ✅ Feito (2026-06-15). `/eventos/[id]/pipeline`, drag-and-drop nativo, `moveCard` atualiza `stage_id`. Próximo refinamento possível: reordenar/editar etapas pela UI.

3. ~~**Construtor de formulários por evento + link público.**~~ ✅ Feito (2026-06-15). `/eventos/[id]/formularios` (CRUD + construtor de campos dinâmico) e página pública `/f/[public_slug]`. Submissão grava em `form_submissions`; respostas visíveis no admin. Vínculo submissão↔`event_exhibitor` feito em 2026-06-16 (na tela de participação). Refinamento possível: tipo de campo `file`.

4. **Documentos.** Bucket `documents` (privado) já criado.
   - ✅ **(A) Envio pelo backoffice** (2026-06-16): página de participação `/eventos/[id]/participacao/[eeId]` com upload (contrato/manual/CPE/outro, direction `enviado`), lista, download por signed URL (`/api/documentos/[docId]`) e exclusão.
   - ✅ **(B) Coleta do contrato assinado** (2026-06-16): link público por participação `/u/[token]` (anônimo, liberado no middleware); upload via Server Action com service role (`lib/supabase/admin.ts`), grava com direction `recebido`. Token em `event_exhibitors` (migration `0003`, aplicada). Documento recebido aparece na tela de participação marcado como "Recebido".
   - ✅ **(C) Contrato pré-preenchido** (2026-06-16): vínculo submissão↔participação na tela de participação (`linkSubmission`, preenche `event_exhibitor_id`); página `/contrato/[eeId]` reproduz o contrato (modelo Grande Prêmio Brasil) com o bloco do LOCATÁRIO já preenchido a partir do cadastro do expositor + quadro com os dados declarados no formulário; impressão A4 → "Salvar como PDF". Cláusula 1 (estrutura/KVA/energia) e vouchers ficam pra marcação manual (fluxo de assinatura à mão). Modelo de contrato é específico desse evento — outros eventos precisariam do próprio template.

### Melhorias anotadas (futuro)
- **Formulário por expositor (link individual):** hoje o form é um por evento e a resposta precisa ser vinculada à mão ao expositor. Alternativa: link de formulário por participação (igual ao `/u/[token]` de upload) — a submissão já nasceria amarrada ao expositor, sem o passo manual de vincular.
- **Notificação externa (e-mail/WhatsApp):** avisar a AAposta fora do CRM quando chega formulário/documento. Decidido não fazer agora (Resend exige verificar domínio; WhatsApp oficial exige Meta Business + templates aprovados; libs não-oficiais arriscam banir o número). Em vez disso, o status fica visível dentro do CRM (ver passo 5). Retomar se quiserem aviso ativo — caminho mais simples seria e-mail via Resend ou um bot de Telegram.

5. ~~**Notificações por e-mail.**~~ → Trocado por **status visível no CRM** (2026-06-16): na página do evento, cada expositor mostra badges "Formulário" e "Contrato assinado" (verde = recebido, cinza = pendente); a página de participação repete o resumo no topo. Substitui o aviso ativo — a AAposta abre o evento e vê de relance quem já respondeu. Notificação externa fica anotada acima como melhoria futura.

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
