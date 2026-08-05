import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registrarSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registrarSchema.parse(body);

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const usuario = await prisma.usuario.create({
      data: { nome: data.nome, email: data.email, senhaHash },
    });

    return NextResponse.json({ id: usuario.id, email: usuario.email }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Dados inválidos" }, { status: 422 });
    }
    if ((err as any)?.code === "P2002") {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
