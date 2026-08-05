import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const inquilinoUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  cpfCnpj: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const inquilino = await prisma.inquilino.findFirst({
    where: { id: params.id, usuarioId },
    include: { contratos: { include: { imovel: true } } },
  });
  if (!inquilino) return NextResponse.json({ error: "Inquilino não encontrado" }, { status: 404 });
  return NextResponse.json(inquilino);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const existente = await prisma.inquilino.findFirst({ where: { id: params.id, usuarioId } });
    if (!existente) return NextResponse.json({ error: "Inquilino não encontrado" }, { status: 404 });

    const body = await req.json();
    const data = inquilinoUpdateSchema.parse(body);
    const inquilino = await prisma.inquilino.update({
      where: { id: params.id },
      data: { ...data, email: data.email || undefined },
    });
    return NextResponse.json(inquilino);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    if ((err as any)?.code === "P2002") {
      return NextResponse.json({ error: "Já existe um inquilino com esse CPF/CNPJ" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar inquilino" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const existente = await prisma.inquilino.findFirst({ where: { id: params.id, usuarioId } });
  if (!existente) return NextResponse.json({ error: "Inquilino não encontrado" }, { status: 404 });

  await prisma.inquilino.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
