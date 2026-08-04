# Gestão de Imóveis

Sistema web para administração de imóveis para aluguel: cadastro de imóveis, inquilinos e contratos, geração de cobranças mensais de aluguel (com recibo em PDF), controle de contas de consumo (luz, água, gás, condomínio, internet, seguro), centralização de documentos e alertas de vencimento.

Construído com **Next.js 14 (App Router)**, **Prisma + PostgreSQL**, **NextAuth** e hospedado na **Vercel**.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Banco de dados | PostgreSQL (via [Neon](https://neon.tech)) |
| ORM | Prisma |
| Autenticação | NextAuth (Credentials Provider, sessão JWT) |
| Armazenamento de arquivos | Vercel Blob |
| Geração de PDF | pdf-lib |
| Estilo | Tailwind CSS |
| Cron | Vercel Cron Jobs |
| Deploy | Vercel |

## Estrutura do projeto

```
prisma/
  schema.prisma          → modelo de dados (todas as entidades e relações)
  seed.ts                → script opcional de seed

src/
  app/
    api/                  → API routes (uma pasta por recurso: imoveis, inquilinos, contratos, cobrancas, contas-consumo, documentos)
      auth/                 → rotas do NextAuth + cadastro inicial do administrador
      cron/gerar-cobrancas/ → job diário que gera a cobrança do mês para contratos ativos
    imoveis/ inquilinos/ contratos/ cobrancas/ contas-consumo/ documentos/ alertas/
                          → páginas (listagem, criação, edição) de cada módulo
    login/ registrar/    → autenticação
    layout.tsx            → layout raiz (fontes, providers)
    page.tsx              → painel inicial

  components/             → formulários e componentes de UI reutilizáveis
  lib/
    auth.ts                → configuração do NextAuth
    prisma.ts               → client singleton do Prisma
    alertas.ts              → lógica de cálculo de alertas (contas/cobranças vencendo)
  middleware.ts            → protege todas as rotas exceto login/registro/cron

vercel.json               → configuração do cron job
```

## Modelo de dados (resumo)

- **Usuario** — administrador do sistema (login único, ver seção Autenticação)
- **Imovel** — propriedade cadastrada, com endereço, tipo e status (vago/alugado/próprio/manutenção)
- **Inquilino** — pessoa física/jurídica que aluga um imóvel
- **Contrato** — vincula um Imóvel a um Inquilino, com valores e vencimento
- **Cobranca** — cobrança mensal de aluguel gerada a partir de um Contrato; pode incluir contas de consumo vinculadas
- **ContaConsumo** — conta de consumo (luz, água, gás, condomínio, internet, seguro, IPTU) de um imóvel; pode ser vinculada a uma Cobranca
- **Documento** — arquivo (PDF/imagem) vinculado a um Imóvel ou Contrato, armazenado no Vercel Blob

Todas as exclusões em cascata relevantes estão configuradas no schema (ex: excluir um imóvel remove seus contratos, contas e documentos).

## Autenticação

O sistema foi desenhado para **um único administrador** (uso pessoal):

1. Na primeira execução, acesse `/registrar` para criar a conta (nome, e-mail, senha).
2. Esse endpoint (`/api/auth/registrar`) só funciona **uma vez** — depois que existe um usuário com senha definida, novas tentativas de registro são bloqueadas.
3. Login normal em `/login` a partir daí.
4. O middleware (`src/middleware.ts`) bloqueia acesso a qualquer página ou rota de API sem sessão válida.

## Cobranças e integração com contas de consumo

Ao gerar uma cobrança (manualmente em `/cobrancas/novo` ou automaticamente pelo cron), o sistema busca as contas de consumo pendentes do imóvel do contrato e permite incluí-las na cobrança. O valor de cada conta incluída é somado ao total (`valorContas`) e, no recibo em PDF, cada conta aparece detalhada individualmente.

O job de cron (`/api/cron/gerar-cobrancas`, agendado em `vercel.json` para rodar diariamente) cria automaticamente a cobrança do mês para cada contrato ativo que ainda não tem uma, já vinculando as contas de consumo do período.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, NEXTAUTH_SECRET, BLOB_READ_WRITE_TOKEN, CRON_SECRET
npx prisma db push     # sincroniza o schema com o banco
npm run dev
```

Acesse `http://localhost:3000/registrar` para criar a conta de administrador.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL (Neon) |
| `NEXTAUTH_SECRET` | Segredo usado para assinar as sessões (gerar com `openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob (criado automaticamente ao conectar o Storage no projeto Vercel) |
| `CRON_SECRET` | Segredo que autentica as chamadas do Vercel Cron ao job de geração de cobranças |

## Deploy

O projeto é hospedado na Vercel. O build (`npm run build`) roda `prisma db push` automaticamente antes de compilar o Next.js, então qualquer alteração no `schema.prisma` é aplicada ao banco a cada deploy.

O cron job configurado em `vercel.json` chama `/api/cron/gerar-cobrancas` diariamente às 6h UTC (3h no horário de Brasília).
