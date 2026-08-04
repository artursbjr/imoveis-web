import Link from "next/link";
import { getAlertas } from "@/lib/alertas";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function AlertasPage() {
  let aPagar: Awaited<ReturnType<typeof getAlertas>>["aPagar"] = [];
  let aReceber: Awaited<ReturnType<typeof getAlertas>>["aReceber"] = [];
  let erroConexao = false;

  try {
    const result = await getAlertas();
    aPagar = result.aPagar;
    aReceber = result.aReceber;
  } catch {
    erroConexao = true;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-900">Alertas</h1>
      <p className="mt-1 text-ink-700">Contas e cobranças vencidas ou vencendo nos próximos 7 dias.</p>

      {erroConexao && (
        <div className="mt-6 rounded border border-brick-500/30 bg-brick-500/10 p-4 text-sm text-brick-500">
          Não foi possível conectar ao banco de dados.
        </div>
      )}

      {!erroConexao && (
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-display text-lg text-ink-900">A pagar ({aPagar.length})</h2>
            <p className="text-xs text-ink-700">Contas de consumo</p>

            {aPagar.length === 0 && (
              <div className="mt-4 rounded-lg border border-dashed border-paper-200 p-6 text-center text-sm text-ink-700">
                Nada vencendo nos próximos 7 dias.
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {aPagar.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${
                    item.atrasado ? "border-brick-500/30 bg-brick-500/10" : "border-paper-200 bg-paper-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-900">{item.titulo}</p>
                    <span className={`badge ${item.atrasado ? "badge-manutencao" : "badge-proprio"}`}>
                      {item.atrasado ? "atrasado" : "a vencer"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-ink-700">
                    Vencimento: {formatDate(item.dataVencimento)} · R$ {item.valor.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/contas-consumo" className="mt-4 inline-block text-sm text-olive-700 hover:underline">
              Ver todas as contas →
            </Link>
          </div>

          <div>
            <h2 className="font-display text-lg text-ink-900">A receber ({aReceber.length})</h2>
            <p className="text-xs text-ink-700">Cobranças de aluguel</p>

            {aReceber.length === 0 && (
              <div className="mt-4 rounded-lg border border-dashed border-paper-200 p-6 text-center text-sm text-ink-700">
                Nada vencendo nos próximos 7 dias.
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {aReceber.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${
                    item.atrasado ? "border-brick-500/30 bg-brick-500/10" : "border-paper-200 bg-paper-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-900">{item.titulo}</p>
                    <span className={`badge ${item.atrasado ? "badge-manutencao" : "badge-proprio"}`}>
                      {item.atrasado ? "atrasado" : "a vencer"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-ink-700">
                    Vencimento: {formatDate(item.dataVencimento)} · R$ {item.valor.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/cobrancas" className="mt-4 inline-block text-sm text-olive-700 hover:underline">
              Ver todas as cobranças →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
