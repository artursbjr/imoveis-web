"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opcao = { id: string; label: string };

export default function DocumentoForm({
  imoveis,
  contratos,
}: {
  imoveis: Opcao[];
  contratos: Opcao[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [vinculo, setVinculo] = useState<"imovel" | "contrato">("imovel");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/documentos", {
      method: "POST",
      body: form,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao enviar documento");
      return;
    }

    router.push("/documentos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <div className="col-span-2 flex gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="radio"
            checked={vinculo === "imovel"}
            onChange={() => setVinculo("imovel")}
          />
          Vincular a um imóvel
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="radio"
            checked={vinculo === "contrato"}
            onChange={() => setVinculo("contrato")}
          />
          Vincular a um contrato
        </label>
      </div>

      {vinculo === "imovel" ? (
        <div className="col-span-2">
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Imóvel</label>
          <select name="imovelId" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {imoveis.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="col-span-2">
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Contrato</label>
          <select name="contratoId" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {contratos.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Tipo de documento</label>
        <select name="tipo" required className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="CONTRATO">Contrato</option>
          <option value="IPTU">IPTU</option>
          <option value="MATRICULA">Matrícula</option>
          <option value="VISTORIA">Vistoria</option>
          <option value="SEGURO">Seguro</option>
          <option value="COMPROVANTE">Comprovante</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Nome (opcional)</label>
        <input
          name="nome"
          type="text"
          placeholder="Ex: Escritura registrada"
          className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-2">
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Arquivo</label>
        <input
          name="file"
          type="file"
          required
          className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-olive-600 file:px-3 file:py-1.5 file:text-paper-50 file:text-sm"
        />
      </div>

      {erro && <p className="col-span-2 text-sm text-brick-500">{erro}</p>}

      <div className="col-span-2 mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Enviando..." : "Enviar documento"}
        </button>
      </div>
    </form>
  );
}
