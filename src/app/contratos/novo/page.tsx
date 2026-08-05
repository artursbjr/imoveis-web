import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";
import ContratoForm from "@/components/ContratoForm";

export const dynamic = "force-dynamic";


export default async function NovoContratoPage() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const [imoveis, inquilinos] = await Promise.all([
    prisma.imovel.findMany({ where: { usuarioId }, orderBy: { apelido: "asc" } }),
    prisma.inquilino.findMany({ where: { usuarioId }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Novo contrato</h1>

      {(imoveis.length === 0 || inquilinos.length === 0) && (
        <div className="mt-4 rounded border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500">
          Você precisa ter ao menos um imóvel e um inquilino cadastrados antes de criar um contrato.
        </div>
      )}

      <ContratoForm
        imoveis={imoveis.map((i) => ({ id: i.id, label: `${i.apelido} — ${i.cidade}/${i.estado}` }))}
        inquilinos={inquilinos.map((i) => ({ id: i.id, label: i.nome }))}
      />
    </div>
  );
}
