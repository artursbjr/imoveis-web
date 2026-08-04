import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.upsert({
    where: { email: "owner@local" },
    update: {},
    create: { nome: "Proprietário", email: "owner@local", senhaHash: "not-set" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
