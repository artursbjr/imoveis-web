import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAlertas } from "@/lib/alertas";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  let total = 0;
  let alugados = 0;
  let totalAlertas = 0;
  try {
    total = await prisma.imovel.count();
    alugados = await prisma.imovel.count({ where: { status: "ALUGADO" } });
    const { aPagar, aReceber } = await getAlertas();
    totalAlertas = aPagar.length + aReceber.length;
  } catch {
    // banco ainda não conectado — ok em preview
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-900">Painel</h1>
      <p className="mt-1 text-ink-700">Visão geral da carteira de imóveis.</p>

      <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl">
        <div className="rounded-lg border border-paper-200 bg-paper-50 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-700 font-mono">Imóveis</p>
          <p className="mt-1 font-display text-3xl text-ink-900">{total}</p>
        </div>
        <div className="rounded-lg border border-paper-200 bg-paper-50 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-700 font-mono">Alugados</p>
          <p className="mt-1 font-display text-3xl text-olive-700">{alugados}</p>
        </div>
        <Link href="/alertas" className="rounded-lg border border-paper-200 bg-paper-50 p-5 hover:bg-paper-200/50 transition-colors">
          <p className="text-xs uppercase tracking-wide text-ink-700 font-mono">Alertas</p>
          <p className={`mt-1 font-display text-3xl ${totalAlertas > 0 ? "text-brick-500" : "text-ink-900"}`}>{totalAlertas}</p>
        </Link>
      </div>

      <Link
        href="/imoveis"
        className="mt-8 inline-block rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 transition-colors"
      >
        Ver imóveis →
      </Link>
    </div>
  );
}
