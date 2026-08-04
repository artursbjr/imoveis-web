"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opcao = { id: string; label: string };

export default function ContaConsumoForm({ imoveis }: { imoveis: Opcao[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/contas-consumo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar conta");
      return;
    }

    router.push("/contas-consumo");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Imóvel</label>
        <select name="imovelId" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {imoveis.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Tipo de conta</label>
        <select name="tipo" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="LUZ">Luz</option>
          <option value="AGUA">Água</option>
          <option value="GAS">Gás</option>
          <option value="CONDOMINIO">Condomínio</option>
          <option value="INTERNET">Internet</option>
          <option value="SEGURO">Seguro</option>
          <option value="IPTU">IPTU</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <Campo label="Mês de referência" name="referenciaMes" type="month" required />
      <Campo label="Valor (R$)" name="valor" type="number" step="0.01" required />
      <Campo label="Data de vencimento" name="dataVencimento" type="date" required />

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
          {loading ? "Salvando..." : "Salvar conta"}
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
  step,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wide text-ink-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        step={step}
        className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
      />
    </div>
  );
}
