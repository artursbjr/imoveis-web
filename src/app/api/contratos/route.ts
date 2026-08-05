import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

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
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const contratos = await prisma.contrato.findMany({
    where: { usuarioId },
    include: { imovel: true, inquilino: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contratos);
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const data = contratoSchema.parse(body);

    const [imovel, inquilino] = await Promise.all([
      prisma.imovel.findFirst({ where: { id: data.imovelId, usuarioId } }),
      prisma.inquilino.findFirst({ where: { id: data.inquilinoId, usuarioId } }),
    ]);
    if (!imovel) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    if (!inquilino) return NextResponse.json({ error: "Inquilino não encontrado" }, { status: 404 });

    const contrato = await prisma.contrato.create({ data: { ...data, usuarioId } });

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
