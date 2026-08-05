import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";
import ExcluirButton from "@/components/ExcluirButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  VAGO: "Vago",
  ALUGADO: "Alugado",
  PROPRIO_USO: "Próprio",
  MANUTENCAO: "Manutenção",
};

const statusClass: Record<string, string> = {
  VAGO: "badge-vago",
  ALUGADO: "badge-alugado",
  PROPRIO_USO: "badge-proprio",
  MANUTENCAO: "badge-manutencao",
};

export default async function ImoveisPage() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  let imoveis: Awaited<ReturnType<typeof prisma.imovel.findMany>> = [];
  let erroConexao = false;
  try {
    imoveis = await prisma.imovel.findMany({ where: { usuarioId }, orderBy: { createdAt: "desc" } });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Imóveis</h1>
          <p className="mt-1 text-ink-700">{imoveis.length} cadastrado(s)</p>
        </div>
        <Link
          href="/imoveis/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Novo imóvel
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados. Configure a variável DATABASE_URL.
        </div>
      )}

      {!erroConexao && imoveis.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhum imóvel cadastrado ainda.
        </div>
      )}

      {imoveis.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Apelido</th>
                <th className="px-4 py-3">Cidade</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {imoveis.map((imovel) => (
                <tr key={imovel.id} className="border-t border-paper-200 hover:bg-paper-50">
                  <td className="px-4 py-3">
                    <Link href={`/imoveis/${imovel.id}`} className="font-medium text-ink-900 hover:underline">
                      {imovel.apelido}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{imovel.cidade}/{imovel.estado}</td>
                  <td className="px-4 py-3 text-ink-700">{imovel.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusClass[imovel.status]}`}>{statusLabel[imovel.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/imoveis/${imovel.id}/editar`} className="text-xs font-mono text-olive-700 hover:underline">
                      editar
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ExcluirButton
                      url={`/api/imoveis/${imovel.id}`}
                      confirmMessage={`Excluir o imóvel "${imovel.apelido}"? Isso também remove contratos, contas e documentos vinculados.`}
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
