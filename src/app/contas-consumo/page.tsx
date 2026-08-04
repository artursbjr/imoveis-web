import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import MarcarPagoButton from "@/components/MarcarPagoButton";
import ExcluirButton from "@/components/ExcluirButton";

export const dynamic = "force-dynamic";

const tipoLabel: Record<string, string> = {
  LUZ: "Luz",
  AGUA: "Água",
  GAS: "Gás",
  CONDOMINIO: "Condomínio",
  INTERNET: "Internet",
  SEGURO: "Seguro",
  IPTU: "IPTU",
  OUTRO: "Outro",
};

type ContaComImovel = Prisma.ContaConsumoGetPayload<{ include: { imovel: true } }>;

function statusEfetivo(conta: ContaComImovel): "PAGO" | "ATRASADO" | "PENDENTE" | "CANCELADO" {
  if (conta.status === "PAGO" || conta.status === "CANCELADO") return conta.status;
  return new Date(conta.dataVencimento) < new Date() ? "ATRASADO" : "PENDENTE";
}

const statusClass: Record<string, string> = {
  PAGO: "badge-alugado",
  ATRASADO: "badge-manutencao",
  PENDENTE: "badge-proprio",
  CANCELADO: "badge-vago",
};

export default async function ContasConsumoPage() {
  let contas: ContaComImovel[] = [];
  let erroConexao = false;
  try {
    contas = await prisma.contaConsumo.findMany({
      include: { imovel: true },
      orderBy: { dataVencimento: "asc" },
    });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Contas de consumo</h1>
          <p className="mt-1 text-ink-700">{contas.length} lançamento(s)</p>
        </div>
        <Link
          href="/contas-consumo/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Nova conta
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && contas.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhuma conta cadastrada ainda.
        </div>
      )}

      {contas.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta) => {
                const s = statusEfetivo(conta);
                return (
                  <tr key={conta.id} className="border-t border-paper-200 hover:bg-paper-50">
                    <td className="px-4 py-3 font-medium text-ink-900">{conta.imovel.apelido}</td>
                    <td className="px-4 py-3 text-ink-700">{tipoLabel[conta.tipo]}</td>
                    <td className="px-4 py-3 font-mono text-ink-700">R$ {conta.valor.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-ink-700">
                      {new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusClass[s]}`}>{s}</span>
                    </td>
                    <td className="px-4 py-3">
                      <MarcarPagoButton id={conta.id} status={conta.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ExcluirButton
                        url={`/api/contas-consumo/${conta.id}`}
                        confirmMessage={`Excluir a conta de ${tipoLabel[conta.tipo]} de ${conta.imovel.apelido}?`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
