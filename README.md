# AAposta — CRM de Eventos

Sistema web sob medida para a **AAposta Estratégia, Comunicação e Eventos**. Gestão do ciclo de expositores em eventos B2B: cadastro, coleta de dados operacionais, envio e recebimento de documentos, e pipeline de status por evento.

Cliente da [DreamTech](https://github.com/DreamTechCompany). Briefing e proposta ficam no repo de operação (`DreamTechAgency`), em `clientes/AAposta/`.

## Escopo do MVP

1. Dashboard por evento — visão geral de expositores, status e pendências
2. Cadastro de empresas expositoras
3. Gestão de eventos — datas, local, expositores vinculados
4. Construtor de formulários por evento — campos customizáveis + link público
5. Coleta de dados operacionais — estrutura, demanda elétrica, dimensões, tipo de energia
6. Envio de documentos — contrato pré-preenchido, manual do expositor, CPE
7. Coleta de documentos assinados — upload do contrato assinado + documentação
8. Pipeline visual de status — kanban por evento
9. Notificações por e-mail

Sem integração de assinatura eletrônica no MVP — o expositor assina o PDF à mão digitalmente e devolve; o sistema só suporta o upload.

## Stack

Next.js (App Router, TypeScript) + Tailwind + Supabase (Postgres, Auth, Storage). E-mail via Resend. Deploy na Vercel. Detalhes do banco em [docs/schema.md](docs/schema.md).

## Status

Estrutura inicial: schema do banco (2 migrations), clients do Supabase e shell do Next prontos. Telas em construção.

## Setup

```bash
npm install
cp .env.example .env.local   # preencher com as keys do Supabase
npm run dev
```

### Banco (Supabase)

1. Criar um projeto em [supabase.com](https://supabase.com).
2. Copiar URL + anon key para `.env.local`.
3. Aplicar as migrations de `supabase/migrations/` (via Supabase CLI `supabase db push`, ou colando o SQL no SQL Editor na ordem 0001 → 0002).
