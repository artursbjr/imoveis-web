import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const imovelId = req.nextUrl.searchParams.get("imovelId");
  const contratoId = req.nextUrl.searchParams.get("contratoId");
  const documentos = await prisma.documento.findMany({
    where: {
      imovelId: imovelId || undefined,
      contratoId: contratoId || undefined,
    },
    include: { imovel: true, contrato: { include: { inquilino: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documentos);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const nome = String(form.get("nome") || "");
    const tipo = String(form.get("tipo") || "OUTRO");
    const imovelId = String(form.get("imovelId") || "") || undefined;
    const contratoId = String(form.get("contratoId") || "") || undefined;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 422 });
    }
    if (!imovelId && !contratoId) {
      return NextResponse.json({ error: "Selecione um imóvel ou contrato" }, { status: 422 });
    }

    const blob = await put(`documentos/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const documento = await prisma.documento.create({
      data: {
        nome: nome || file.name,
        tipo: tipo as any,
        arquivoUrl: blob.url,
        tamanhoKb: Math.round(file.size / 1024),
        imovelId,
        contratoId,
      },
    });

    return NextResponse.json(documento, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar documento" }, { status: 500 });
  }
}
