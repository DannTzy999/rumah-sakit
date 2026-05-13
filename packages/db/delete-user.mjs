import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.deleteMany({
    where: { email: "minadminmuain@gacor.toto" }
  });
  console.log(`Deleted ${user.count} user(s)`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
