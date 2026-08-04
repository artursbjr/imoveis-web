import ImovelForm from "@/components/ImovelForm";

export default function NovoImovelPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Novo imóvel</h1>
      <ImovelForm />
    </div>
  );
}
