import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUsuarioId } from "@/lib/tenant";

const imovelSchema = z.object({
  apelido: z.string().min(1),
  tipo: z.enum(["CASA", "APARTAMENTO", "COMERCIAL", "TERRENO", "OUTRO"]),
  status: z.enum(["VAGO", "ALUGADO", "PROPRIO_USO", "MANUTENCAO"]).optional(),
  endereco: z.string().min(1),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1),
  estado: z.string().min(2).max(2),
  cep: z.string().optional(),
  matricula: z.string().optional(),
  inscricaoIptu: z.string().optional(),
  areaM2: z.coerce.number().positive().optional(),
  valorReferencia: z.coerce.number().positive().optional(),
  observacoes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const usuarioId = await requireUsuarioId();
  if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const imoveis = await prisma.imovel.findMany({
    where: { usuarioId, status: status ? (status as any) : undefined },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(imoveis);
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await requireUsuarioId();
    if (!usuarioId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const data = imovelSchema.parse(body);
    const imovel = await prisma.imovel.create({ data: { ...data, usuarioId } });
    return NextResponse.json(imovel, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", issues: err.issues }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar imóvel" }, { status: 500 });
  }
}
