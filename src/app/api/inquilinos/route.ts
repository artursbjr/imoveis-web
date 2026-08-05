import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const inquilinoSchema = z.object({
  nome: z.string().min(1),
  cpfCnpj: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET() {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const inquilinos = await prisma.inquilino.findMany({
    where: { usuarioId },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(inquilinos);
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const data = inquilinoSchema.parse(body);
    const inquilino = await prisma.inquilino.create({
      data: { ...data, email: data.email || undefined, usuarioId },
    });
    return NextResponse.json(inquilino, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    if ((err as any)?.code === "P2002") {
      return NextResponse.json({ error: "Já existe um inquilino com esse CPF/CNPJ" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar inquilino" }, { status: 500 });
  }
}
