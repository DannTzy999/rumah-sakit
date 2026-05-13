import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'minadminmuain@gacor.toto' } });
  if (user) {
    console.log('✓ SUCCESS: User created');
    console.log('Email: ' + user.email);
    console.log('Name: ' + user.name);
    console.log('Status: ' + user.status);
  } else {
    console.log('User not found');
  }
  await prisma.$.disconnect();
}
main();
