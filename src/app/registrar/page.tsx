"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome"));
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));

    const res = await fetch("/api/auth/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao criar conta");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", { redirect: false, email, senha });
    setLoading(false);

    if (login?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <p className="font-display text-2xl font-semibold text-ink-900">Criar conta</p>
      <p className="mt-1 text-sm text-ink-700">
        Configuração inicial do administrador — só pode ser feita uma vez.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Nome</label>
          <input
            name="nome"
            type="text"
            required
            className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">E-mail</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Senha (mín. 8 caracteres)</label>
          <input
            name="senha"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
          />
        </div>

        {erro && <p className="text-sm text-brick-500">{erro}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-xs text-ink-700">
        Já tem conta?{" "}
        <Link href="/login" className="text-olive-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
