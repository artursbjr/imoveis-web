import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";
import ContaConsumoForm from "@/components/ContaConsumoForm";

export const dynamic = "force-dynamic";

export default async function NovaContaConsumoPage() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) redirect("/login");

  const imoveis = await prisma.imovel.findMany({ where: { usuarioId }, orderBy: { apelido: "asc" } });

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Nova conta de consumo</h1>

      {imoveis.length === 0 && (
        <div className="mt-4 rounded border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500">
          Você precisa ter ao menos um imóvel cadastrado antes de lançar uma conta.
        </div>
      )}

      <ContaConsumoForm
        imoveis={imoveis.map((i) => ({ id: i.id, label: `${i.apelido} — ${i.cidade}/${i.estado}` }))}
      />
    </div>
  );
}
