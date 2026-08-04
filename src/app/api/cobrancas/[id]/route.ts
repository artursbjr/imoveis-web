import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cobrancaUpdateSchema = z.object({
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"]).optional(),
  dataPagamento: z.coerce.date().optional(),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const cobranca = await prisma.cobranca.findUnique({
    where: { id: params.id },
    include: { contrato: { include: { imovel: true, inquilino: true } } },
  });
  if (!cobranca) return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
  return NextResponse.json(cobranca);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const data = cobrancaUpdateSchema.parse(body);
    const cobranca = await prisma.cobranca.update({ where: { id: params.id }, data });
    return NextResponse.json(cobranca);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar cobrança" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.cobranca.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
