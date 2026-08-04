import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import MarcarCobrancaPagaButton from "@/components/MarcarCobrancaPagaButton";
import ExcluirButton from "@/components/ExcluirButton";

export const dynamic = "force-dynamic";

type CobrancaComRelacoes = Prisma.CobrancaGetPayload<{
  include: { contrato: { include: { imovel: true; inquilino: true } } };
}>;

function statusEfetivo(c: CobrancaComRelacoes): "PAGO" | "ATRASADO" | "PENDENTE" | "CANCELADO" {
  if (c.status === "PAGO" || c.status === "CANCELADO") return c.status;
  return new Date(c.dataVencimento) < new Date() ? "ATRASADO" : "PENDENTE";
}

const statusClass: Record<string, string> = {
  PAGO: "badge-alugado",
  ATRASADO: "badge-manutencao",
  PENDENTE: "badge-proprio",
  CANCELADO: "badge-vago",
};

export default async function CobrancasPage() {
  let cobrancas: CobrancaComRelacoes[] = [];
  let erroConexao = false;
  try {
    cobrancas = await prisma.cobranca.findMany({
      include: { contrato: { include: { imovel: true, inquilino: true } } },
      orderBy: { referenciaMes: "desc" },
    });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Cobranças de aluguel</h1>
          <p className="mt-1 text-ink-700">{cobrancas.length} lançamento(s)</p>
        </div>
        <Link
          href="/cobrancas/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Gerar cobrança
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && cobrancas.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhuma cobrança gerada ainda. Cadastre um contrato primeiro.
        </div>
      )}

      {cobrancas.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Referência</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cobrancas.map((c) => {
                const s = statusEfetivo(c);
                return (
                  <tr key={c.id} className="border-t border-paper-200 hover:bg-paper-50">
                    <td className="px-4 py-3 font-medium text-ink-900">{c.contrato.inquilino.nome}</td>
                    <td className="px-4 py-3 text-ink-700">{c.contrato.imovel.apelido}</td>
                    <td className="px-4 py-3 text-ink-700">
                      {new Date(c.referenciaMes).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-700">R$ {c.valorTotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusClass[s]}`}>{s}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/cobrancas/${c.id}/recibo`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-olive-700 hover:underline"
                      >
                        ver recibo
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <MarcarCobrancaPagaButton id={c.id} status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ExcluirButton
                        url={`/api/cobrancas/${c.id}`}
                        confirmMessage={`Excluir esta cobrança de ${c.contrato.inquilino.nome}?`}
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
