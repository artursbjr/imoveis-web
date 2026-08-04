import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InquilinoForm from "@/components/InquilinoForm";

export const dynamic = "force-dynamic";

export default async function EditarInquilinoPage({ params }: { params: { id: string } }) {
  const inquilino = await prisma.inquilino.findUnique({ where: { id: params.id } });
  if (!inquilino) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Editar inquilino</h1>
      <InquilinoForm inquilino={inquilino} />
    </div>
  );
}
