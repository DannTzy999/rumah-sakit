import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const targetEmail = 'minadminmuain@gacor.toto';
    
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    
    if (!user) {
      console.log(✗ User with email "" not found in database);
      return;
    }
    
    console.log(Found user: ID=, Email=, Name=);
    
    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { email: targetEmail },
    });
    
    console.log(✓ Successfully deleted user with email: );
    console.log(  User ID: );
    console.log(  User Name: );
  } catch (error) {
    console.error(✗ Error deleting user:, error.message);
  } finally {
    await prisma.();
  }
}

deleteUser();
