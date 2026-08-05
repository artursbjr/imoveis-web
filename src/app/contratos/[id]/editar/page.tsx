import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireUsuarioId } from "@/lib/tenant";
import ContratoEditForm from "@/components/ContratoEditForm";

export const dynamic = "force-dynamic";

export default async function EditarContratoPage({ params }: { params: { id: string } }) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const contrato = await prisma.contrato.findFirst({
    where: { id: params.id, usuarioId },
    include: { imovel: true, inquilino: true },
  });
  if (!contrato) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Editar contrato</h1>
      <ContratoEditForm
        contrato={{
          id: contrato.id,
          imovelApelido: contrato.imovel.apelido,
          inquilinoNome: contrato.inquilino.nome,
          status: contrato.status,
          valorAluguel: contrato.valorAluguel,
          valorCondominio: contrato.valorCondominio,
          incluiCondominio: contrato.incluiCondominio,
          diaVencimento: contrato.diaVencimento,
          indiceReajuste: contrato.indiceReajuste,
          observacoes: contrato.observacoes,
        }}
      />
    </div>
  );
}
