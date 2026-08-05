import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const contratoUpdateSchema = z.object({
  dataFim: z.coerce.date().optional(),
  diaVencimento: z.coerce.number().int().min(1).max(31).optional(),
  valorAluguel: z.coerce.number().positive().optional(),
  valorCondominio: z.coerce.number().positive().optional(),
  incluiCondominio: z.coerce.boolean().optional(),
  indiceReajuste: z.enum(["IGPM", "IPCA", "INCC", "OUTRO"]).optional(),
  status: z.enum(["ATIVO", "ENCERRADO", "RENOVADO", "CANCELADO"]).optional(),
  observacoes: z.string().optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const contrato = await prisma.contrato.findFirst({
    where: { id: params.id, usuarioId },
    include: { imovel: true, inquilino: true, cobrancas: { orderBy: { referenciaMes: "desc" } } },
  });
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  return NextResponse.json(contrato);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const existente = await prisma.contrato.findFirst({ where: { id: params.id, usuarioId } });
    if (!existente) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

    const body = await req.json();
    const data = contratoUpdateSchema.parse(body);
    const contrato = await prisma.contrato.update({ where: { id: params.id }, data });

    if (data.status === "ENCERRADO" || data.status === "CANCELADO") {
      await prisma.imovel.update({
        where: { id: contrato.imovelId },
        data: { status: "VAGO" },
      });
    }

    return NextResponse.json(contrato);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar contrato" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existente = await prisma.contrato.findFirst({ where: { id: params.id, usuarioId } });
  if (!existente) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });

  await prisma.contrato.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
