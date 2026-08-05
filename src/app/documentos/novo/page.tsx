import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";
import DocumentoForm from "@/components/DocumentoForm";

export const dynamic = "force-dynamic";

export default async function NovoDocumentoPage() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const [imoveis, contratos] = await Promise.all([
    prisma.imovel.findMany({ where: { usuarioId }, orderBy: { apelido: "asc" } }),
    prisma.contrato.findMany({ where: { usuarioId }, include: { inquilino: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Enviar documento</h1>

      <DocumentoForm
        imoveis={imoveis.map((i) => ({ id: i.id, label: `${i.apelido} — ${i.cidade}/${i.estado}` }))}
        contratos={contratos.map((c) => ({ id: c.id, label: `${c.inquilino.nome} — ${c.dataInicio.toLocaleDateString("pt-BR")}` }))}
      />
    </div>
  );
}
