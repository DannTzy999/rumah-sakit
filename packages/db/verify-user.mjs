import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "minadminmuain@gacor.toto" },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  if (user) {
    console.log("✓ User found:");
    console.log("  Email:", user.email);
    console.log("  Name:", user.name);
    console.log("  Status:", user.status);
    console.log("  Password Hash:", user.passwordHash.substring(0, 20) + "...");
    console.log("  Roles:", user.roles.map(r => r.role.name).join(", "));
    
    // Test password
    const passwordMatch = await bcrypt.compare("jiddansangmahaadmin77#", user.passwordHash);
    console.log("  Password match:", passwordMatch ? "✓ YES" : "✗ NO");
  } else {
    console.log("✗ User not found");
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
