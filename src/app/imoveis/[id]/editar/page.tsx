import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireUsuarioId } from "@/lib/tenant";
import ImovelForm from "@/components/ImovelForm";

export const dynamic = "force-dynamic";

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const imovel = await prisma.imovel.findFirst({ where: { id: params.id, usuarioId } });
  if (!imovel) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Editar imóvel</h1>
      <ImovelForm imovel={imovel} />
    </div>
  );
}
