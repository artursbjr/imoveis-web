import { prisma } from "@/lib/prisma";
import CobrancaForm from "@/components/CobrancaForm";

export const dynamic = "force-dynamic";

export default async function NovaCobrancaPage() {
  const contratos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
    include: { imovel: true, inquilino: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Gerar cobrança</h1>

      {contratos.length === 0 && (
        <div className="mt-4 rounded border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500">
          Você precisa ter ao menos um contrato ativo para gerar uma cobrança.
        </div>
      )}

      <CobrancaForm
        contratos={contratos.map((c) => ({
          id: c.id,
          label: `${c.inquilino.nome} — ${c.imovel.apelido}`,
          imovelId: c.imovelId,
          valorAluguel: c.valorAluguel,
          valorCondominio: c.valorCondominio,
          incluiCondominio: c.incluiCondominio,
          diaVencimento: c.diaVencimento,
        }))}
      />
    </div>
  );
}
