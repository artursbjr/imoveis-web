import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contratoSchema = z.object({
  imovelId: z.string().uuid(),
  inquilinoId: z.string().uuid(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().optional(),
  diaVencimento: z.coerce.number().int().min(1).max(31),
  valorAluguel: z.coerce.number().positive(),
  valorCondominio: z.coerce.number().positive().optional(),
  incluiCondominio: z.coerce.boolean().optional(),
  indiceReajuste: z.enum(["IGPM", "IPCA", "INCC", "OUTRO"]).optional(),
  observacoes: z.string().optional(),
});

export async function GET() {
  const contratos = await prisma.contrato.findMany({
    include: { imovel: true, inquilino: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contratos);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contratoSchema.parse(body);
    const contrato = await prisma.contrato.create({ data });

    // Ao criar o contrato, marca o imóvel como alugado
    await prisma.imovel.update({
      where: { id: data.imovelId },
      data: { status: "ALUGADO" },
    });

    return NextResponse.json(contrato, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar contrato" }, { status: 500 });
  }
}
