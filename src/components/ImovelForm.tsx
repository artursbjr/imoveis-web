"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImovelValues = {
  id?: string;
  apelido?: string;
  tipo?: string;
  status?: string;
  endereco?: string;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string;
  estado?: string;
  cep?: string | null;
  valorReferencia?: number | null;
};

export default function ImovelForm({ imovel }: { imovel?: ImovelValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const editando = Boolean(imovel?.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const url = editando ? `/api/imoveis/${imovel!.id}` : "/api/imoveis";
    const res = await fetch(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar imóvel");
      return;
    }

    router.push(editando ? `/imoveis/${imovel!.id}` : "/imoveis");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <Campo label="Apelido" name="apelido" required className="col-span-2" defaultValue={imovel?.apelido} />

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Tipo</label>
        <select name="tipo" required defaultValue={imovel?.tipo || "CASA"} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="CASA">Casa</option>
          <option value="APARTAMENTO">Apartamento</option>
          <option value="COMERCIAL">Comercial</option>
          <option value="TERRENO">Terreno</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Status</label>
        <select name="status" defaultValue={imovel?.status || "VAGO"} className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm">
          <option value="VAGO">Vago</option>
          <option value="ALUGADO">Alugado</option>
          <option value="PROPRIO_USO">Próprio</option>
          <option value="MANUTENCAO">Manutenção</option>
        </select>
      </div>

      <Campo label="Endereço" name="endereco" required className="col-span-2" defaultValue={imovel?.endereco} />
      <Campo label="Número" name="numero" defaultValue={imovel?.numero ?? undefined} />
      <Campo label="Complemento" name="complemento" defaultValue={imovel?.complemento ?? undefined} />
      <Campo label="Bairro" name="bairro" defaultValue={imovel?.bairro ?? undefined} />
      <Campo label="Cidade" name="cidade" required defaultValue={imovel?.cidade} />
      <Campo label="UF" name="estado" required maxLength={2} defaultValue={imovel?.estado} />
      <Campo label="CEP" name="cep" defaultValue={imovel?.cep ?? undefined} />
      <Campo label="Valor de referência (R$)" name="valorReferencia" type="number" step="0.01" defaultValue={imovel?.valorReferencia ?? undefined} />

      {erro && <p className="col-span-2 text-sm text-brick-500">{erro}</p>}

      <div className="col-span-2 mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : editando ? "Salvar alterações" : "Salvar imóvel"}
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
  className = "",
  defaultValue,
  ...rest
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  className?: string;
  defaultValue?: string | number;
  [key: string]: any;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-mono uppercase tracking-wide text-ink-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
        {...rest}
      />
    </div>
  );
}
