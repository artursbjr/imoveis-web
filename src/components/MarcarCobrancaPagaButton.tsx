"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarcarCobrancaPagaButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "PAGO") {
    return <span className="text-xs text-olive-700 font-mono">pago ✓</span>;
  }

  async function marcarPago() {
    setLoading(true);
    await fetch(`/api/cobrancas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGO", dataPagamento: new Date().toISOString() }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={marcarPago}
      disabled={loading}
      className="text-xs font-mono text-olive-700 hover:underline disabled:opacity-50"
    >
      {loading ? "salvando..." : "marcar como pago"}
    </button>
  );
}
