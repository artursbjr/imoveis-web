"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExcluirButton({
  url,
  confirmMessage = "Tem certeza que deseja excluir?",
  redirectTo,
  label = "excluir",
}: {
  url: string;
  confirmMessage?: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function excluir() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    const res = await fetch(url, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      alert("Não foi possível excluir.");
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button
      onClick={excluir}
      disabled={loading}
      className="text-xs font-mono text-brick-500 hover:underline disabled:opacity-50"
    >
      {loading ? "excluindo..." : label}
    </button>
  );
}
