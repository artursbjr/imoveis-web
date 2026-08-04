"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContratoValues = {
  id: string;
  imovelApelido: string;
  inquilinoNome: string;
  status: string;
  valorAluguel: number;
  valorCondominio: number | null;
  incluiCondominio: boolean;
  diaVencimento: number;
  indiceReajuste: string | null;
  observacoes: string | null;
};

export default function ContratoEditForm({ contrato }: { contrato: ContratoValues }) {
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

    const res = await fetch(`/api/contratos/${contrato.id}`, {
      method: "PUT",
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
      <div className="col-span-2 rounded border border-paper-200 bg-paper-50 p-3 text-sm text-ink-700">
        {contrato.imovelApelido} — {contrato.inquilinoNome}
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Status</label>
        <select name="status" defaultValue={contrato.status} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="ATIVO">Ativo</option>
          <option value="ENCERRADO">Encerrado</option>
          <option value="RENOVADO">Renovado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <Campo label="Dia de vencimento" name="diaVencimento" type="number" min={1} max={31} defaultValue={contrato.diaVencimento} />
      <Campo label="Valor do aluguel (R$)" name="valorAluguel" type="number" step="0.01" defaultValue={contrato.valorAluguel} />
      <Campo label="Valor do condomínio (R$)" name="valorCondominio" type="number" step="0.01" defaultValue={contrato.valorCondominio ?? undefined} />

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Índice de reajuste</label>
        <select name="indiceReajuste" defaultValue={contrato.indiceReajuste ?? ""} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="">Nenhum</option>
          <option value="IGPM">IGP-M</option>
          <option value="IPCA">IPCA</option>
          <option value="INCC">INCC</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <label className="col-span-2 flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="incluiCondominio" defaultChecked={contrato.incluiCondominio} className="rounded border-paper-200" />
        Condomínio incluso na cobrança do aluguel
      </label>

      <div className="col-span-2">
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Observações</label>
        <textarea name="observacoes" rows={3} defaultValue={contrato.observacoes ?? undefined} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm" />
      </div>

      {erro && <p className="col-span-2 text-sm text-brick-500">{erro}</p>}

      <div className="col-span-2 mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  type = "text",
  min,
  max,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  min?: number;
  max?: number;
  step?: string;
  defaultValue?: string | number;
}) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wide text-ink-700">{label}</label>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
      />
    </div>
  );
}
