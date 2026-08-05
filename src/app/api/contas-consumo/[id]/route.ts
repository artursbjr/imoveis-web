import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const contaUpdateSchema = z.object({
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"]).optional(),
  dataPagamento: z.coerce.date().optional(),
  valor: z.coerce.number().positive().optional(),
  dataVencimento: z.coerce.date().optional(),
  observacoes: z.string().optional(),
});

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const existente = await prisma.contaConsumo.findFirst({ where: { id: params.id, usuarioId } });
    if (!existente) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

    const body = await req.json();
    const data = contaUpdateSchema.parse(body);
    const conta = await prisma.contaConsumo.update({ where: { id: params.id }, data });
    return NextResponse.json(conta);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar conta" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existente = await prisma.contaConsumo.findFirst({ where: { id: params.id, usuarioId } });
  if (!existente) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

  await prisma.contaConsumo.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
