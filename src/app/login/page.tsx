"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.get("email"),
      senha: form.get("senha"),
    });

    setLoading(false);

    if (res?.error) {
      setErro("E-mail ou senha inválidos");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <p className="font-display text-2xl font-semibold text-ink-900">Gestão de Imóveis</p>
      <p className="mt-1 text-sm text-ink-700">Entre com sua conta.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
          <label className="text-xs font-mono uppercase tracking-wide text-ink-700">Senha</label>
          <input
            name="senha"
            type="password"
            required
            className="mt-1 w-full rounded border border-paper-200 bg-paper-50 px-3 py-2 text-sm"
          />
        </div>

        {erro && <p className="text-sm text-brick-500">{erro}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-olive-600 px-4 py-2 text-sm text-paper-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-xs text-ink-700">
        Ainda não tem conta?{" "}
        <Link href="/registrar" className="text-olive-700 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
