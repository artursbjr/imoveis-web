import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const inquilinoSchema = z.object({
  nome: z.string().min(1),
  cpfCnpj: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET() {
  const inquilinos = await prisma.inquilino.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(inquilinos);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = inquilinoSchema.parse(body);
    const inquilino = await prisma.inquilino.create({
      data: { ...data, email: data.email || undefined },
    });
    return NextResponse.json(inquilino, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar inquilino" }, { status: 500 });
  }
}
