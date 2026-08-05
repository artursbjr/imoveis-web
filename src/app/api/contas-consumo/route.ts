import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const contaSchema = z.object({
  imovelId: z.string().uuid(),
  tipo: z.enum(["LUZ", "AGUA", "GAS", "CONDOMINIO", "INTERNET", "SEGURO", "IPTU", "OUTRO"]),
  referenciaMes: z.coerce.date(),
  valor: z.coerce.number().positive(),
  dataVencimento: z.coerce.date(),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const imovelId = req.nextUrl.searchParams.get("imovelId");
  const status = req.nextUrl.searchParams.get("status");
  const semCobranca = req.nextUrl.searchParams.get("semCobranca") === "true";
  const contas = await prisma.contaConsumo.findMany({
    where: {
      usuarioId,
      imovelId: imovelId || undefined,
      status: status ? (status as any) : undefined,
      cobrancaId: semCobranca ? null : undefined,
    },
    include: { imovel: true },
    orderBy: { dataVencimento: "asc" },
  });
  return NextResponse.json(contas);
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const data = contaSchema.parse(body);

    const imovel = await prisma.imovel.findFirst({ where: { id: data.imovelId, usuarioId } });
    if (!imovel) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

    const conta = await prisma.contaConsumo.create({ data: { ...data, usuarioId } });
    return NextResponse.json(conta, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
