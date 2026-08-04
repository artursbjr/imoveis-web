"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InquilinoValues = {
  id?: string;
  nome?: string;
  cpfCnpj?: string;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
};

export default function InquilinoForm({ inquilino }: { inquilino?: InquilinoValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const editando = Boolean(inquilino?.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const url = editando ? `/api/inquilinos/${inquilino!.id}` : "/api/inquilinos";
    const res = await fetch(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar inquilino");
      return;
    }

    router.push("/inquilinos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
      <Campo label="Nome completo" name="nome" required className="col-span-2" defaultValue={inquilino?.nome} />
      <Campo label="CPF/CNPJ" name="cpfCnpj" required defaultValue={inquilino?.cpfCnpj} />
      <Campo label="Telefone" name="telefone" defaultValue={inquilino?.telefone ?? undefined} />
      <Campo label="E-mail" name="email" type="email" defaultValue={inquilino?.email ?? undefined} />
      <Campo label="Endereço" name="endereco" className="col-span-2" defaultValue={inquilino?.endereco ?? undefined} />

      {erro && <p className="col-span-2 text-sm text-brick-500">{erro}</p>}

      <div className="col-span-2 mt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : editando ? "Salvar alterações" : "Salvar inquilino"}
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
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  className?: string;
  defaultValue?: string;
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
      />
    </div>
  );
}
