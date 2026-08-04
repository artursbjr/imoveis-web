"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ContratoInfo = {
  id: string;
  label: string;
  imovelId: string;
  valorAluguel: number;
  valorCondominio: number | null;
  incluiCondominio: boolean;
  diaVencimento: number;
};

type ContaPendente = {
  id: string;
  tipo: string;
  valor: number;
  dataVencimento: string;
};

const tipoLabel: Record<string, string> = {
  LUZ: "Luz",
  AGUA: "Água",
  GAS: "Gás",
  CONDOMINIO: "Condomínio",
  INTERNET: "Internet",
  SEGURO: "Seguro",
  IPTU: "IPTU",
  OUTRO: "Outro",
};

export default function CobrancaForm({ contratos }: { contratos: ContratoInfo[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<ContratoInfo | null>(null);
  const [valorAluguel, setValorAluguel] = useState("");
  const [valorCondominio, setValorCondominio] = useState("");
  const [contasPendentes, setContasPendentes] = useState<ContaPendente[]>([]);
  const [contasSelecionadas, setContasSelecionadas] = useState<Set<string>>(new Set());
  const [carregandoContas, setCarregandoContas] = useState(false);

  async function onSelecionarContrato(id: string) {
    const c = contratos.find((x) => x.id === id) || null;
    setSelecionado(c);
    setContasSelecionadas(new Set());
    setContasPendentes([]);
    if (c) {
      setValorAluguel(String(c.valorAluguel));
      setValorCondominio(c.incluiCondominio ? "" : c.valorCondominio ? String(c.valorCondominio) : "");

      setCarregandoContas(true);
      try {
        const res = await fetch(`/api/contas-consumo?imovelId=${c.imovelId}&semCobranca=true`);
        const todas: ContaPendente[] = await res.json();
        const pendentes = todas.filter((conta: any) => conta.status === "PENDENTE" || conta.status === "ATRASADO");
        setContasPendentes(pendentes);
        // Já marca todas como selecionadas por padrão
        setContasSelecionadas(new Set(pendentes.map((p) => p.id)));
      } catch {
        setContasPendentes([]);
      }
      setCarregandoContas(false);
    }
  }

  function toggleConta(id: string) {
    setContasSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalContasSelecionadas = contasPendentes
    .filter((c) => contasSelecionadas.has(c.id))
    .reduce((soma, c) => soma + c.valor, 0);

  const totalEstimado =
    (parseFloat(valorAluguel) || 0) + (parseFloat(valorCondominio) || 0) + totalContasSelecionadas;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(form.entries()),
      contasConsumoIds: Array.from(contasSelecionadas),
    };

    const res = await fetch("/api/cobrancas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao gerar cobrança");
      return;
    }

    router.push("/cobrancas");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Contrato</label>
        <select
          name="contratoId"
          required
          onChange={(e) => onSelecionarContrato(e.target.value)}
          className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          {contratos.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Mês de referência</label>
        <input name="referenciaMes" type="month" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Data de vencimento</label>
        <input name="dataVencimento" type="date" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Valor do aluguel (R$)</label>
        <input
          name="valorAluguel"
          type="number"
          step="0.01"
          required
          value={valorAluguel}
          onChange={(e) => setValorAluguel(e.target.value)}
          className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Condomínio (R$)</label>
        <input
          name="valorCondominio"
          type="number"
          step="0.01"
          value={valorCondominio}
          onChange={(e) => setValorCondominio(e.target.value)}
          className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Encargos / multa / juros (R$)</label>
        <input name="valorEncargos" type="number" step="0.01" className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Desconto (R$)</label>
        <input name="valorDesconto" type="number" step="0.01" className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      {selecionado && (
        <div className="col-span-2">
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">
            Contas de consumo do imóvel
          </label>

          {carregandoContas && <p className="mt-2 text-sm text-ink-700">Carregando contas...</p>}

          {!carregandoContas && contasPendentes.length === 0 && (
            <p className="mt-2 text-sm text-ink-700">Nenhuma conta pendente para este imóvel.</p>
          )}

          {!carregandoContas && contasPendentes.length > 0 && (
            <div className="mt-2 flex flex-col gap-2 rounded border border-paper-200 bg-paper-50 p-3">
              {contasPendentes.map((conta) => (
                <label key={conta.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contasSelecionadas.has(conta.id)}
                      onChange={() => toggleConta(conta.id)}
                      className="rounded border-paper-200"
                    />
                    {tipoLabel[conta.tipo] || conta.tipo} — vence em{" "}
                    {new Date(conta.dataVencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </span>
                  <span className="font-mono text-ink-700">R$ {conta.valor.toFixed(2)}</span>
                </label>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-paper-200 pt-2 text-sm font-medium">
                <span>Subtotal contas selecionadas</span>
                <span className="font-mono">R$ {totalContasSelecionadas.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {selecionado && (
        <div className="col-span-2 rounded border border-olive-500/30 bg-olive-500/10 p-3 text-sm">
          <span className="font-medium text-ink-900">Total estimado da cobrança: </span>
          <span className="font-mono text-ink-900">R$ {totalEstimado.toFixed(2)}</span>
          <p className="mt-1 text-xs text-ink-700">
            (aluguel + condomínio + contas selecionadas — encargos e descontos são somados ao salvar)
          </p>
        </div>
      )}

      <div className="col-span-2">
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Observações</label>
        <textarea name="observacoes" rows={3} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      {erro && <p className="col-span-2 text-sm text-brick-500">{erro}</p>}

      <div className="col-span-2 mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Gerando..." : "Gerar cobrança"}
        </button>
      </div>
    </form>
  );
}
