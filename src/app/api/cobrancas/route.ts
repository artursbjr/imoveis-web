import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const cobrancaSchema = z.object({
  contratoId: z.string().uuid(),
  referenciaMes: z.coerce.date(),
  dataVencimento: z.coerce.date(),
  valorAluguel: z.coerce.number().positive(),
  valorCondominio: z.coerce.number().min(0).optional(),
  valorEncargos: z.coerce.number().min(0).optional(),
  valorDesconto: z.coerce.number().min(0).optional(),
  observacoes: z.string().optional(),
  contasConsumoIds: z.array(z.string().uuid()).optional(),
});

export async function GET(req: NextRequest) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const contratoId = req.nextUrl.searchParams.get("contratoId");
  const cobrancas = await prisma.cobranca.findMany({
    where: { usuarioId, contratoId: contratoId || undefined },
    include: { contrato: { include: { imovel: true, inquilino: true } } },
    orderBy: { referenciaMes: "desc" },
  });
  return NextResponse.json(cobrancas);
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const data = cobrancaSchema.parse(body);

    const contrato = await prisma.contrato.findFirst({ where: { id: data.contratoId, usuarioId } });
    if (!contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // Busca as contas de consumo selecionadas, garantindo que pertencem ao imóvel
    // do contrato, ao mesmo tenant, e ainda não estão vinculadas a nenhuma outra cobrança.
    let contasSelecionadas: { id: string; valor: number }[] = [];
    if (data.contasConsumoIds && data.contasConsumoIds.length > 0) {
      contasSelecionadas = await prisma.contaConsumo.findMany({
        where: {
          id: { in: data.contasConsumoIds },
          usuarioId,
          imovelId: contrato.imovelId,
          cobrancaId: null,
        },
        select: { id: true, valor: true },
      });
    }

    const valorContas = contasSelecionadas.reduce((soma, c) => soma + c.valor, 0);

    const valorTotal =
      data.valorAluguel +
      (data.valorCondominio || 0) +
      valorContas +
      (data.valorEncargos || 0) -
      (data.valorDesconto || 0);

    const { contasConsumoIds, ...cobrancaData } = data;

    const cobranca = await prisma.cobranca.create({
      data: {
        ...cobrancaData,
        usuarioId,
        valorContas: valorContas || undefined,
        valorTotal,
      },
    });

    if (contasSelecionadas.length > 0) {
      await prisma.contaConsumo.updateMany({
        where: { id: { in: contasSelecionadas.map((c) => c.id) } },
        data: { cobrancaId: cobranca.id },
      });
    }

    return NextResponse.json(cobranca, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    if ((err as any)?.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma cobrança para esse contrato neste mês" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar cobrança" }, { status: 500 });
  }
}
