import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const imovelUpdateSchema = z.object({
  apelido: z.string().min(1).optional(),
  tipo: z.enum(["CASA", "APARTAMENTO", "COMERCIAL", "TERRENO", "OUTRO"]).optional(),
  status: z.enum(["VAGO", "ALUGADO", "PROPRIO_USO", "MANUTENCAO"]).optional(),
  endereco: z.string().min(1).optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1).optional(),
  estado: z.string().min(2).max(2).optional(),
  cep: z.string().optional(),
  matricula: z.string().optional(),
  inscricaoIptu: z.string().optional(),
  areaM2: z.coerce.number().positive().optional(),
  valorReferencia: z.coerce.number().positive().optional(),
  observacoes: z.string().optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const imovel = await prisma.imovel.findUnique({
    where: { id: params.id },
    include: {
      contratos: { include: { inquilino: true } },
      contasConsumo: { orderBy: { dataVencimento: "desc" }, take: 12 },
      documentos: true,
    },
  });
  if (!imovel) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  return NextResponse.json(imovel);
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const data = imovelUpdateSchema.parse(body);
    const imovel = await prisma.imovel.update({ where: { id: params.id }, data });
    return NextResponse.json(imovel);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar imóvel" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.imovel.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
