import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.ChiAurora.create({
    data: {
        id: "1fjk3",
        crush: "Alex",
        userId: "aurora1",
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    },
    });
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

