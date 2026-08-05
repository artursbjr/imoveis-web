import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";
import ExcluirDocumentoButton from "@/components/ExcluirDocumentoButton";

export const dynamic = "force-dynamic";

const tipoLabel: Record<string, string> = {
  CONTRATO: "Contrato",
  IPTU: "IPTU",
  MATRICULA: "Matrícula",
  VISTORIA: "Vistoria",
  SEGURO: "Seguro",
  COMPROVANTE: "Comprovante",
  OUTRO: "Outro",
};

type DocumentoComRelacoes = Prisma.DocumentoGetPayload<{
  include: { imovel: true; contrato: { include: { inquilino: true } } };
}>;

export default async function DocumentosPage() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  let documentos: DocumentoComRelacoes[] = [];
  let erroConexao = false;
  try {
    documentos = await prisma.documento.findMany({
      where: { usuarioId },
      include: { imovel: true, contrato: { include: { inquilino: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Documentos</h1>
          <p className="mt-1 text-ink-700">{documentos.length} arquivo(s)</p>
        </div>
        <Link
          href="/documentos/novo"
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
        >
          + Enviar documento
        </Link>
      </div>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && documentos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-paper-200 p-10 text-center text-ink-700">
          Nenhum documento enviado ainda.
        </div>
      )}

      {documentos.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-paper-200">
          <table className="w-full text-sm">
            <thead className="bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-700 font-mono">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Vinculado a</th>
                <th className="px-4 py-3">Tamanho</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => (
                <tr key={doc.id} className="border-t border-paper-200 hover:bg-paper-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{doc.nome}</td>
                  <td className="px-4 py-3 text-ink-700">{tipoLabel[doc.tipo]}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {doc.imovel?.apelido || (doc.contrato ? `Contrato — ${doc.contrato.inquilino.nome}` : "—")}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-700">
                    {doc.tamanhoKb ? `${(doc.tamanhoKb / 1024).toFixed(1)} MB` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={doc.arquivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-olive-700 hover:underline"
                    >
                      abrir
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <ExcluirDocumentoButton id={doc.id} />
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
