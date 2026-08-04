import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contaSchema = z.object({
  imovelId: z.string().uuid(),
  tipo: z.enum(["LUZ", "AGUA", "GAS", "CONDOMINIO", "INTERNET", "SEGURO", "IPTU", "OUTRO"]),
  referenciaMes: z.coerce.date(),
  valor: z.coerce.number().positive(),
  dataVencimento: z.coerce.date(),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const imovelId = req.nextUrl.searchParams.get("imovelId");
  const status = req.nextUrl.searchParams.get("status");
  const semCobranca = req.nextUrl.searchParams.get("semCobranca") === "true";
  const contas = await prisma.contaConsumo.findMany({
    where: {
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
    const body = await req.json();
    const data = contaSchema.parse(body);
    const conta = await prisma.contaConsumo.create({ data });
    return NextResponse.json(conta, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
