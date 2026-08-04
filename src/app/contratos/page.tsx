import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ExcluirButton from "@/components/ExcluirButton";

const statusClass: Record<string, string> = {
  ATIVO: "badge-alugado",
  ENCERRADO: "badge-vago",
  RENOVADO: "badge-alugado",
  CANCELADO: "badge-manutencao",
};

type ContratoComRelacoes = Prisma.ContratoGetPayload<{
  include: { imovel: true; inquilino: true };
}>;

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  let contratos: ContratoComRelacoes[] = [];
  let erroConexao = false;
  try {
    contratos = await prisma.contrato.findMany({
      include: { imovel: true, inquilino: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Contratos</h1>
          <p className="mt-1 text-ink-700">{contratos.length} cadastrado(s)</p>
        </div>
        <Link
          href="/contratos/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Novo contrato
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && contratos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhum contrato cadastrado ainda. Cadastre um imóvel e um inquilino primeiro.
        </div>
      )}

      {contratos.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Aluguel</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} className="border-t border-paper-200 hover:bg-paper-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{c.imovel.apelido}</td>
                  <td className="px-4 py-3 text-ink-700">{c.inquilino.nome}</td>
                  <td className="px-4 py-3 font-mono text-ink-700">
                    R$ {c.valorAluguel.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-700">dia {c.diaVencimento}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusClass[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/contratos/${c.id}/editar`} className="text-xs font-mono text-olive-700 hover:underline">
                      editar
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ExcluirButton
                      url={`/api/contratos/${c.id}`}
                      confirmMessage={`Excluir o contrato de ${c.inquilino.nome}? Isso também remove as cobranças geradas.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
