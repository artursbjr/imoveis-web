import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExcluirButton from "@/components/ExcluirButton";

export const dynamic = "force-dynamic";

export default async function InquilinosPage() {
  let inquilinos: Awaited<ReturnType<typeof prisma.inquilino.findMany>> = [];
  let erroConexao = false;
  try {
    inquilinos = await prisma.inquilino.findMany({ orderBy: { nome: "asc" } });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Inquilinos</h1>
          <p className="mt-1 text-ink-700">{inquilinos.length} cadastrado(s)</p>
        </div>
        <Link
          href="/inquilinos/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Novo inquilino
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && inquilinos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhum inquilino cadastrado ainda.
        </div>
      )}

      {inquilinos.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF/CNPJ</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((inquilino) => (
                <tr key={inquilino.id} className="border-t border-paper-200 hover:bg-paper-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{inquilino.nome}</td>
                  <td className="px-4 py-3 font-mono text-ink-700">{inquilino.cpfCnpj}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {inquilino.telefone || inquilino.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/inquilinos/${inquilino.id}/editar`} className="text-xs font-mono text-olive-700 hover:underline">
                      editar
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ExcluirButton
                      url={`/api/inquilinos/${inquilino.id}`}
                      confirmMessage={`Excluir o inquilino "${inquilino.nome}"?`}
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
