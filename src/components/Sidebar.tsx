import Link from "next/link";
import UserMenu from "./UserMenu";

const nav = [
  { href: "/", label: "Painel" },
  { href: "/alertas", label: "Alertas" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/contratos", label: "Contratos" },
  { href: "/cobrancas", label: "Cobranças" },
  { href: "/contas-consumo", label: "Contas de consumo" },
  { href: "/documentos", label: "Documentos" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-ink-950 text-paper-100 p-6 flex flex-col gap-8">
      <div>
        <p className="font-display text-xl font-semibold leading-tight text-paper-50">
          Gestão de
          <br />
          Imóveis
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-3 py-2 text-sm text-paper-200/80 hover:bg-ink-800 hover:text-paper-50 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <UserMenu />
    </aside>
  );
}
