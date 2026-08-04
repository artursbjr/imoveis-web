import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImovelForm from "@/components/ImovelForm";

export const dynamic = "force-dynamic";

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  const imovel = await prisma.imovel.findUnique({ where: { id: params.id } });
  if (!imovel) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Editar imóvel</h1>
      <ImovelForm imovel={imovel} />
    </div>
  );
}
