import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireUsuarioId } from "@/lib/tenant";
import InquilinoForm from "@/components/InquilinoForm";

export const dynamic = "force-dynamic";

export default async function EditarInquilinoPage({ params }: { params: { id: string } }) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const inquilino = await prisma.inquilino.findFirst({ where: { id: params.id, usuarioId } });
  if (!inquilino) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Editar inquilino</h1>
      <InquilinoForm inquilino={inquilino} />
    </div>
  );
}
