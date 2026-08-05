import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Executado diariamente pelo Vercel Cron (ver vercel.json).
// Para cada contrato ativo sem cobrança no mês corrente, cria uma automaticamente,
// já somando e vinculando as contas de consumo pendentes do imóvel naquele mês.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hoje = new Date();
  const ano = hoje.getUTCFullYear();
  const mes = hoje.getUTCMonth();
  const referenciaMes = new Date(Date.UTC(ano, mes, 1));
  const inicioProximoMes = new Date(Date.UTC(ano, mes + 1, 1));

  const contratosAtivos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
  });

  let criadas = 0;
  const erros: string[] = [];

  for (const contrato of contratosAtivos) {
    const jaExiste = await prisma.cobranca.findUnique({
      where: {
        contratoId_referenciaMes: {
          contratoId: contrato.id,
          referenciaMes,
        },
      },
    });
    if (jaExiste) continue;

    const dia = Math.min(contrato.diaVencimento, 28);
    const dataVencimento = new Date(Date.UTC(ano, mes, dia));

    const valorCondominio = contrato.incluiCondominio ? contrato.valorCondominio ?? undefined : undefined;

    // Contas de consumo do imóvel referentes a este mês, ainda não vinculadas a nenhuma cobrança
    const contasDoMes = await prisma.contaConsumo.findMany({
      where: {
        usuarioId: contrato.usuarioId,
        imovelId: contrato.imovelId,
        cobrancaId: null,
        referenciaMes: { gte: referenciaMes, lt: inicioProximoMes },
      },
      select: { id: true, valor: true },
    });
    const valorContas = contasDoMes.reduce((soma, c) => soma + c.valor, 0);

    const valorTotal = contrato.valorAluguel + (valorCondominio || 0) + valorContas;

    try {
      const cobranca = await prisma.cobranca.create({
        data: {
          usuarioId: contrato.usuarioId,
          contratoId: contrato.id,
          referenciaMes,
          dataVencimento,
          valorAluguel: contrato.valorAluguel,
          valorCondominio,
          valorContas: valorContas || undefined,
          valorTotal,
        },
      });

      if (contasDoMes.length > 0) {
        await prisma.contaConsumo.updateMany({
          where: { id: { in: contasDoMes.map((c) => c.id) } },
          data: { cobrancaId: cobranca.id },
        });
      }

      criadas++;
    } catch (err) {
      console.error(`Erro ao gerar cobrança para contrato ${contrato.id}:`, err);
      erros.push(contrato.id);
    }
  }

  return NextResponse.json({
    ok: true,
    referenciaMes: referenciaMes.toISOString(),
    contratosAtivos: contratosAtivos.length,
    cobrancasCriadas: criadas,
    erros,
  });
}
