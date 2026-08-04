import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExcluirButton from "@/components/ExcluirButton";

export const dynamic = "force-dynamic";

export default async function DetalheImovelPage({ params }: { params: { id: string } }) {
  const imovel = await prisma.imovel.findUnique({
    where: { id: params.id },
    include: { contratos: { include: { inquilino: true } }, contasConsumo: true, documentos: true },
  });

  if (!imovel) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{imovel.apelido}</h1>
          <p className="mt-1 text-ink-700">
            {imovel.endereco}, {imovel.numero} — {imovel.cidade}/{imovel.estado}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href={`/imoveis/${imovel.id}/editar`} className="text-sm text-olive-700 hover:underline">
            Editar
          </Link>
          <ExcluirButton
            url={`/api/imoveis/${imovel.id}`}
            confirmMessage={`Excluir o imóvel "${imovel.apelido}"? Isso também remove contratos, contas e documentos vinculados.`}
            redirectTo="/imoveis"
            label="Excluir"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <Secao titulo="Contratos">
          {imovel.contratos.length === 0 && <p className="text-sm text-ink-700">Nenhum contrato vinculado.</p>}
          {imovel.contratos.map((c) => (
            <p key={c.id} className="text-sm">
              {c.inquilino.nome} — R$ {c.valorAluguel.toFixed(2)}
            </p>
          ))}
        </Secao>

        <Secao titulo="Contas de consumo">
          {imovel.contasConsumo.length === 0 && <p className="text-sm text-ink-700">Nenhuma conta registrada.</p>}
          {imovel.contasConsumo.map((c) => (
            <p key={c.id} className="text-sm">
              {c.tipo} — R$ {c.valor.toFixed(2)}
            </p>
          ))}
        </Secao>
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-paper-200 bg-paper-50 p-5">
      <h2 className="font-display text-lg text-ink-900">{titulo}</h2>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}
