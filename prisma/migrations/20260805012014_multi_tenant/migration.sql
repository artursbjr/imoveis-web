-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('CASA', 'APARTAMENTO', 'COMERCIAL', 'TERRENO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('VAGO', 'ALUGADO', 'PROPRIO_USO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('ATIVO', 'ENCERRADO', 'RENOVADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "IndiceReajuste" AS ENUM ('IGPM', 'IPCA', 'INCC', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoContaConsumo" AS ENUM ('LUZ', 'AGUA', 'GAS', 'CONDOMINIO', 'INTERNET', 'SEGURO', 'IPTU', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CONTRATO', 'IPTU', 'MATRICULA', 'VISTORIA', 'SEGURO', 'COMPROVANTE', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('A_PAGAR', 'A_RECEBER');

-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('PENDENTE', 'LIDO', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "tipo" "TipoImovel" NOT NULL,
    "status" "StatusImovel" NOT NULL DEFAULT 'VAGO',
    "endereco" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT,
    "matricula" TEXT,
    "inscricaoIptu" TEXT,
    "areaM2" DOUBLE PRECISION,
    "valorReferencia" DOUBLE PRECISION,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "diaVencimento" INTEGER NOT NULL,
    "valorAluguel" DOUBLE PRECISION NOT NULL,
    "valorCondominio" DOUBLE PRECISION,
    "incluiCondominio" BOOLEAN NOT NULL DEFAULT false,
    "indiceReajuste" "IndiceReajuste",
    "dataProxReajuste" TIMESTAMP(3),
    "status" "StatusContrato" NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobranca" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "referenciaMes" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorAluguel" DOUBLE PRECISION NOT NULL,
    "valorCondominio" DOUBLE PRECISION,
    "valorContas" DOUBLE PRECISION,
    "valorEncargos" DOUBLE PRECISION,
    "valorDesconto" DOUBLE PRECISION,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaConsumo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "cobrancaId" TEXT,
    "tipo" "TipoContaConsumo" NOT NULL,
    "referenciaMes" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "comprovanteUrl" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaConsumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "imovelId" TEXT,
    "contratoId" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "tamanhoKb" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "status" "StatusAlerta" NOT NULL DEFAULT 'PENDENTE',
    "cobrancaId" TEXT,
    "contaConsumoId" TEXT,
    "titulo" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Imovel_usuarioId_idx" ON "Imovel"("usuarioId");

-- CreateIndex
CREATE INDEX "Inquilino_usuarioId_idx" ON "Inquilino"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Inquilino_usuarioId_cpfCnpj_key" ON "Inquilino"("usuarioId", "cpfCnpj");

-- CreateIndex
CREATE INDEX "Contrato_usuarioId_idx" ON "Contrato"("usuarioId");

-- CreateIndex
CREATE INDEX "Contrato_imovelId_idx" ON "Contrato"("imovelId");

-- CreateIndex
CREATE INDEX "Contrato_inquilinoId_idx" ON "Contrato"("inquilinoId");

-- CreateIndex
CREATE INDEX "Cobranca_usuarioId_idx" ON "Cobranca"("usuarioId");

-- CreateIndex
CREATE INDEX "Cobranca_status_dataVencimento_idx" ON "Cobranca"("status", "dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "Cobranca_contratoId_referenciaMes_key" ON "Cobranca"("contratoId", "referenciaMes");

-- CreateIndex
CREATE INDEX "ContaConsumo_usuarioId_idx" ON "ContaConsumo"("usuarioId");

-- CreateIndex
CREATE INDEX "ContaConsumo_imovelId_tipo_idx" ON "ContaConsumo"("imovelId", "tipo");

-- CreateIndex
CREATE INDEX "ContaConsumo_status_dataVencimento_idx" ON "ContaConsumo"("status", "dataVencimento");

-- CreateIndex
CREATE INDEX "ContaConsumo_cobrancaId_idx" ON "ContaConsumo"("cobrancaId");

-- CreateIndex
CREATE INDEX "Documento_usuarioId_idx" ON "Documento"("usuarioId");

-- CreateIndex
CREATE INDEX "Documento_imovelId_idx" ON "Documento"("imovelId");

-- CreateIndex
CREATE INDEX "Documento_contratoId_idx" ON "Documento"("contratoId");

-- CreateIndex
CREATE INDEX "Alerta_usuarioId_idx" ON "Alerta"("usuarioId");

-- CreateIndex
CREATE INDEX "Alerta_status_dataVencimento_idx" ON "Alerta"("status", "dataVencimento");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaConsumo" ADD CONSTRAINT "ContaConsumo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaConsumo" ADD CONSTRAINT "ContaConsumo_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaConsumo" ADD CONSTRAINT "ContaConsumo_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
