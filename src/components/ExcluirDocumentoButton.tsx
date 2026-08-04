"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExcluirDocumentoButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function excluir() {
    if (!confirm("Excluir este documento?")) return;
    setLoading(true);
    await fetch(`/api/documentos/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={excluir}
      disabled={loading}
      className="text-xs font-mono text-brick-500 hover:underline disabled:opacity-50"
    >
      {loading ? "excluindo..." : "excluir"}
    </button>
  );
}
