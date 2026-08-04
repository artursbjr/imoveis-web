import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const documento = await prisma.documento.findUnique({ where: { id: params.id } });
  if (!documento) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

  try {
    await del(documento.arquivoUrl);
  } catch (err) {
    console.error("Erro ao excluir do blob (prosseguindo mesmo assim):", err);
  }

  await prisma.documento.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
