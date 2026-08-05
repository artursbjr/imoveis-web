import { prisma } from "./prisma";

const DIAS_ANTECEDENCIA = 7;

export async function getAlertas(usuarioId: string) {
  const agora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + DIAS_ANTECEDENCIA);

  const [contasPendentes, cobrancasPendentes] = await Promise.all([
    prisma.contaConsumo.findMany({
      where: {
        usuarioId,
        status: { in: ["PENDENTE", "ATRASADO"] },
        dataVencimento: { lte: limite },
      },
      include: { imovel: true },
      orderBy: { dataVencimento: "asc" },
    }),
    prisma.cobranca.findMany({
      where: {
        usuarioId,
        status: { in: ["PENDENTE", "ATRASADO"] },
        dataVencimento: { lte: limite },
      },
      include: { contrato: { include: { imovel: true, inquilino: true } } },
      orderBy: { dataVencimento: "asc" },
    }),
  ]);

  const aPagar = contasPendentes.map((c) => ({
    id: c.id,
    tipo: "conta" as const,
    titulo: `${c.tipo} — ${c.imovel.apelido}`,
    valor: c.valor,
    dataVencimento: c.dataVencimento,
    atrasado: new Date(c.dataVencimento) < agora,
  }));

  const aReceber = cobrancasPendentes.map((c) => ({
    id: c.id,
    tipo: "cobranca" as const,
    titulo: `Aluguel — ${c.contrato.inquilino.nome} (${c.contrato.imovel.apelido})`,
    valor: c.valorTotal,
    dataVencimento: c.dataVencimento,
    atrasado: new Date(c.dataVencimento) < agora,
  }));

  return { aPagar, aReceber };
}
