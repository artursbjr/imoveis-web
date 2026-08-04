"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opcao = { id: string; label: string };

export default function ContratoForm({
  imoveis,
  inquilinos,
}: {
  imoveis: Opcao[];
  inquilinos: Opcao[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(form.entries()),
      incluiCondominio: form.get("incluiCondominio") === "on",
    };

    const res = await fetch("/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar contrato");
      return;
    }

    router.push("/contratos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Imóvel</label>
        <select name="imovelId" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {imoveis.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Inquilino</label>
        <select name="inquilinoId" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {inquilinos.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <Campo label="Início do contrato" name="dataInicio" type="date" required />
      <Campo label="Fim do contrato (opcional)" name="dataFim" type="date" />

      <Campo label="Dia de vencimento" name="diaVencimento" type="number" min={1} max={31} required />
      <Campo label="Valor do aluguel (R$)" name="valorAluguel" type="number" step="0.01" required />

      <Campo label="Valor do condomínio (R$)" name="valorCondominio" type="number" step="0.01" />

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Índice de reajuste</label>
        <select name="indiceReajuste" className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="">Nenhum</option>
          <option value="IGPM">IGP-M</option>
          <option value="IPCA">IPCA</option>
          <option value="INCC">INCC</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <label className="col-span-2 flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="incluiCondominio" className="rounded border-paper-200" />
        Condomínio incluso na cobrança do aluguel
      </label>

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
          {loading ? "Salvando..." : "Salvar contrato"}
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  required,
  type = "text",
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wide text-ink-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        step={step}
        className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
      />
    </div>
  );
}
